import crypto from "crypto";
import { Prisma } from "@prisma/client";
import prisma from "../../../config/database";
import { HttpError } from "../../utils/http-error";
import { createAuditLog } from "../audit/audit.service";
import { buildPatientData, DRAFT_PLACEHOLDERS } from "./patient.mapper";
import { generateUHID } from "./patient.service";

/**
 * Patient Draft Service
 * Drafts are rows in `patients` with isDraft = true, so they share every column
 * with real patients and are excluded from the roster by that flag.
 */

export interface DraftActor {
  id?: string;
  role?: string;
}

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "BRANCH_ADMIN"];
const DRAFT_RETENTION_DAYS = 7;

const isPrivileged = (actor?: DraftActor) =>
  Boolean(actor?.role && ADMIN_ROLES.includes(actor.role));

const tempDraftUHID = () => `DRAFT-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

/** Drafts are private to their creator unless the caller manages the lab. */
const resolveDraftScope = (actor?: DraftActor): Prisma.PatientWhereInput => {
  if (isPrivileged(actor)) return {};
  if (!actor?.id) {
    throw new HttpError("Sign-in required to read drafts", 401, "AUTHENTICATION_REQUIRED");
  }
  return { createdById: actor.id };
};

const requireDraft = async (draftId: string, actor?: DraftActor) => {
  const draft = await prisma.patient.findUnique({ where: { id: draftId } });

  if (!draft || !draft.isDraft) {
    throw new HttpError("Draft not found", 404, "DRAFT_NOT_FOUND");
  }

  // A draft belongs to whoever started it unless the caller is an admin.
  if (!isPrivileged(actor) && draft.createdById !== actor?.id) {
    throw new HttpError("Not authorized to access this draft", 403, "DRAFT_FORBIDDEN");
  }

  return draft;
};

const DRAFT_IDENTITY_COLUMNS = ["firstName", "lastName", "gender"] as const;

/**
 * Auto-saves carry only the section being edited. Without the stored identity
 * values the relaxed mapper would fall back to the "Draft Patient" placeholder
 * and silently rename the draft on every save.
 */
const withDraftIdentity = (
  data: Record<string, any>,
  existing?: Record<string, any>
): Record<string, any> => {
  if (!existing) return data;

  const merged = { ...data };
  for (const column of DRAFT_IDENTITY_COLUMNS) {
    const incoming = merged[column];
    if ((typeof incoming !== "string" || incoming.trim() === "") && existing[column]) {
      merged[column] = existing[column];
    }
  }
  return merged;
};

const draftPagination = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
});

/**
 * Save or update a patient draft. Data arrives straight from a half-filled form,
 * so enum/length problems fall back to safe defaults instead of rejecting.
 */
export const saveDraft = async (
  data: Record<string, any>,
  actor?: DraftActor,
  draftId?: string
) => {
  const existing = draftId ? await requireDraft(draftId, actor) : undefined;

  const payload = buildPatientData(
    withDraftIdentity(data, existing),
    existing,
    { strict: false }
  );

  payload.formStep = Math.max(1, Math.trunc(Number(data.formStep) || 1));
  payload.formProgress = Math.max(0, Math.min(100, Math.trunc(Number(data.formProgress) || 0)));
  payload.lastEditedSection =
    typeof data.lastEditedSection === "string" && data.lastEditedSection.trim()
      ? data.lastEditedSection.trim().slice(0, 100)
      : "basic-info";
  payload.isDraft = true;

  if (existing) {
    const updated = await prisma.patient.update({
      where: { id: existing.id },
      data: payload,
    });

    return {
      draft: updated,
      message: "Draft auto-saved successfully",
      isNew: false,
      draftId: updated.id,
    };
  }

  const created = await prisma.patient.create({
    data: {
      ...payload,
      uhid: tempDraftUHID(),
      createdById: actor?.id ?? null,
      isDraft: true,
    },
  });

  return {
    draft: created,
    message: "Draft created successfully",
    isNew: true,
    draftId: created.id,
  };
};

export const getUserDrafts = async (actor?: DraftActor, page = 1, limit = 20) => {
  const safePage = Math.max(1, Math.trunc(Number(page) || 1));
  const safeLimit = Math.min(100, Math.max(1, Math.trunc(Number(limit) || 20)));

  // Only privileged users may list other people's drafts.
  const where: Prisma.PatientWhereInput = {
    isDraft: true,
    ...resolveDraftScope(actor),
  };

  const [drafts, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        uhid: true,
        firstName: true,
        middleName: true,
        lastName: true,
        phone: true,
        email: true,
        gender: true,
        patientType: true,
        formStep: true,
        formProgress: true,
        lastEditedSection: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.patient.count({ where }),
  ]);

  return { drafts, pagination: draftPagination(safePage, safeLimit, total) };
};

export const getDraftById = async (draftId: string, actor?: DraftActor) => {
  const draft = await requireDraft(draftId, actor);
  return draft;
};

/**
 * Promote a draft to a real patient: new sequential UHID, validated payload,
 * duplicate check, QR code pointing at the live record.
 */
export const finalizeDraft = async (
  draftId: string,
  finalData?: Record<string, any>,
  actor?: DraftActor
) => {
  const draft = await requireDraft(draftId, actor);

  const patient = await prisma
    .$transaction(async (tx) => {
      const payload = buildPatientData({ ...draft, ...(finalData ?? {}) }, draft, {
        strict: true,
      });

      // Drafts auto-save with placeholder names, so reject those on finalize.
      if (
        payload.firstName === DRAFT_PLACEHOLDERS.firstName ||
        payload.lastName === DRAFT_PLACEHOLDERS.lastName
      ) {
        throw new HttpError(
          "Please complete the patient's first and last name before registering.",
          400,
          "DRAFT_INCOMPLETE"
        );
      }

      const uhid = await generateUHID(tx);

      if (payload.phone || payload.email || payload.aadhaarNumber || payload.panNumber) {
        const clash = await tx.patient.findFirst({
          where: {
            isDraft: false,
            id: { not: draftId },
            OR: [
              ...(payload.phone ? [{ phone: payload.phone as string }] : []),
              ...(payload.email ? [{ email: payload.email as string }] : []),
              ...(payload.aadhaarNumber
                ? [{ aadhaarNumber: payload.aadhaarNumber as string }]
                : []),
              ...(payload.panNumber ? [{ panNumber: payload.panNumber as string }] : []),
            ],
          },
          select: { id: true, uhid: true },
        });
        if (clash) {
          throw new HttpError(
            `Patient already exists with the same contact details. UHID: ${clash.uhid}`,
            409,
            "DUPLICATE_PATIENT"
          );
        }
      }

      if (payload.familyHeadId) {
        if (payload.familyHeadId === draftId) {
          throw new HttpError("A patient cannot be their own family head", 400, "SELF_FAMILY_LINK");
        }
        const head = await tx.patient.findUnique({
          where: { id: payload.familyHeadId },
          select: { id: true, isDraft: true },
        });
        if (!head || head.isDraft) {
          throw new HttpError("Family head not found", 400, "FAMILY_HEAD_NOT_FOUND");
        }
      }

      if (payload.referredById) {
        const doctor = await tx.doctor.findUnique({
          where: { id: payload.referredById },
          select: { id: true },
        });
        if (!doctor) throw new HttpError("Referring doctor not found", 400, "DOCTOR_NOT_FOUND");
      }

      return tx.patient.update({
        where: { id: draftId },
        data: {
          ...payload,
          uhid,
          isDraft: false,
          formStep: null,
          formProgress: null,
          lastEditedSection: null,
          verificationStatus: "UNVERIFIED",
          phoneVerified: false,
          emailVerified: false,
          kycVerified: false,
          // The row id is stable through finalization, so the QR can be built here.
          qrCode: JSON.stringify({
            type: "PATIENT",
            id: draftId,
            uhid,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    })
    .catch((error) => {
      if (error instanceof HttpError) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new HttpError(
          "This UHID is already taken. Please try again.",
          409,
          "UHID_TAKEN"
        );
      }
      console.error("Failed to finalize patient draft:", error);
      throw error;
    });

  await createAuditLog({
    userId: actor?.id,
    module: "PATIENTS",
    action: "FINALIZE_DRAFT",
    recordId: patient.id,
    oldData: { draftId },
    newData: { uhid: patient.uhid },
  }).catch((error) =>
    console.error("Failed to create audit log for draft finalization:", error)
  );

  return {
    patient,
    message: "Draft finalized and patient registered successfully",
  };
};

export const deleteDraft = async (draftId: string, actor?: DraftActor) => {
  const draft = await requireDraft(draftId, actor);

  const dependents = await prisma.order.count({ where: { patientId: draft.id } });
  if (dependents > 0) {
    throw new HttpError(
      "This draft already has orders linked. Finalize or delete them first.",
      409,
      "DRAFT_HAS_ORDERS"
    );
  }

  await prisma.patient.delete({ where: { id: draft.id } });

  return { message: "Draft deleted successfully", id: draft.id };
};

/** Drop abandoned drafts, but never one that already collected orders. */
export const cleanupOldDrafts = async () => {
  const cutoff = new Date(Date.now() - DRAFT_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const result = await prisma.patient.deleteMany({
    where: {
      isDraft: true,
      updatedAt: { lt: cutoff },
      orders: { none: {} },
    },
  });

  return {
    message: `Cleaned up ${result.count} old drafts`,
    deletedCount: result.count,
    olderThanDays: DRAFT_RETENTION_DAYS,
  };
};

export const getFormProgressStats = async (actor?: DraftActor) => {
  const where: Prisma.PatientWhereInput = {
    isDraft: true,
    ...resolveDraftScope(actor),
  };

  const [rows, totalDrafts] = await Promise.all([
    prisma.patient.groupBy({
      by: ["formStep", "lastEditedSection"],
      where,
      _count: true,
      _avg: { formProgress: true },
    }),
    prisma.patient.count({ where }),
  ]);

  if (totalDrafts === 0) {
    return { totalDrafts: 0, averageProgress: 0, sectionStats: {}, stepStats: {} };
  }

  const sectionStats: Record<string, number> = {};
  const stepStats: Record<string, number> = {};
  let weightedProgress = 0;

  for (const row of rows) {
    const count = Number((row as any)._count ?? 0);
    const section = row.lastEditedSection || "unknown";
    const step = String(row.formStep ?? 0);
    sectionStats[section] = (sectionStats[section] || 0) + count;
    stepStats[step] = (stepStats[step] || 0) + count;
    weightedProgress += Number((row as any)._avg?.formProgress ?? 0) * count;
  }

  return {
    totalDrafts,
    averageProgress: Math.round((weightedProgress / totalDrafts) * 100) / 100,
    sectionStats,
    stepStats,
  };
};

export const duplicateDraft = async (draftId: string, actor?: DraftActor) => {
  const original = await requireDraft(draftId, actor);

  const payload = buildPatientData(original, undefined, { strict: false });
  const suffix = " (Copy)";
  const baseName =
    original.firstName === DRAFT_PLACEHOLDERS.firstName
      ? DRAFT_PLACEHOLDERS.firstName
      : `${original.firstName}${suffix}`;

  const copy = await prisma.patient.create({
    data: {
      ...payload,
      uhid: tempDraftUHID(),
      firstName: baseName.slice(0, 100),
      createdById: actor?.id ?? original.createdById,
      formStep: original.formStep,
      formProgress: 0,
      lastEditedSection: original.lastEditedSection,
      isDraft: true,
    },
  });

  return { draft: copy, message: "Draft duplicated successfully", draftId: copy.id };
};
