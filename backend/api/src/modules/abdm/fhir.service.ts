/**
 * HL7 FHIR R4 Service
 *
 * Converts LabCore ELIS test results into ABDM / NRCES-compliant
 * HL7 FHIR R4 DiagnosticReport Document Bundle.
 *
 * Bundle composition:
 *   1. Bundle (type: document)
 *   2. Composition (document metadata)
 *   3. Patient (ABHA-linked demographics)
 *   4. Organization (Laboratory)
 *   5. Practitioner (Signing pathologist / lab director)
 *   6. Specimen (sample type, collection datetime)
 *   7. Observation[]  (one per test parameter: value, unit, reference interval, interpretation)
 *   8. DiagnosticReport (status: final, references all observations, code, conclusion)
 */

import crypto from "crypto";
import prisma from "../../../config/database";
import abdmConfig from "./abdm.config";

// ─────────────────────────────────────────────────────────────
// FHIR Resource Builders
// ─────────────────────────────────────────────────────────────

function fhirId(): string {
  return crypto.randomUUID();
}

function buildPatientResource(patient: any): object {
  const identifier: any[] = [
    { system: "https://healthid.ndhm.gov.in", value: patient.uhid, use: "official" },
  ];
  if (patient.abhaNumber) {
    identifier.push({
      system: "https://healthid.ndhm.gov.in/abha",
      value: patient.abhaNumber,
      use: "official",
      type: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "NNIND", display: "ABHA Number" }] },
    });
  }
  if (patient.abhaAddress) {
    identifier.push({
      system: "https://phr.abdm.gov.in",
      value: patient.abhaAddress,
    });
  }

  const gender =
    patient.gender === "MALE" ? "male" : patient.gender === "FEMALE" ? "female" : "other";

  return {
    resourceType: "Patient",
    id: "patient-" + patient.id,
    identifier,
    name: [{ use: "official", text: `${patient.firstName} ${patient.lastName}`, family: patient.lastName, given: [patient.firstName] }],
    gender,
    ...(patient.dateOfBirth ? { birthDate: new Date(patient.dateOfBirth).toISOString().slice(0, 10) } : {}),
    telecom: patient.phone ? [{ system: "phone", value: patient.phone }] : [],
    address: patient.address
      ? [{ text: [patient.address, patient.city, patient.state, patient.pincode].filter(Boolean).join(", "), city: patient.city, state: patient.state, postalCode: patient.pincode, country: "IN" }]
      : [],
  };
}

function buildOrganizationResource(): object {
  return {
    resourceType: "Organization",
    id: "organization-lab",
    name: abdmConfig.lab.name,
    identifier: [
      ...(abdmConfig.lab.registrationNumber ? [{ system: "https://facility.ndhm.gov.in", value: abdmConfig.lab.registrationNumber }] : []),
      ...(abdmConfig.lab.nablNumber ? [{ system: "https://www.nabl-india.org", value: abdmConfig.lab.nablNumber }] : []),
    ],
    telecom: abdmConfig.lab.phone ? [{ system: "phone", value: abdmConfig.lab.phone }] : [],
    address: abdmConfig.lab.address
      ? [{ text: abdmConfig.lab.address, country: "IN", state: abdmConfig.lab.stateCode }]
      : [],
  };
}

function buildPractitionerResource(doctor?: any): object {
  if (!doctor) {
    return {
      resourceType: "Practitioner",
      id: "practitioner-default",
      name: [{ text: abdmConfig.lab.name + " - Lab Director" }],
    };
  }
  return {
    resourceType: "Practitioner",
    id: "practitioner-" + doctor.id,
    name: [{ text: `Dr. ${doctor.fullName ?? doctor.name ?? ""}`, prefix: ["Dr."] }],
    identifier: doctor.registrationNumber
      ? [{ system: "https://doctor.ndhm.gov.in", value: doctor.registrationNumber }]
      : [],
    telecom: doctor.phone ? [{ system: "phone", value: doctor.phone }] : [],
  };
}

function buildSpecimenResource(sample: any): object {
  const sampleTypeMap: Record<string, { code: string; display: string }> = {
    BLOOD: { code: "119297000", display: "Blood specimen" },
    URINE: { code: "122575003", display: "Urine specimen" },
    STOOL: { code: "119339001", display: "Fecal specimen" },
    SERUM: { code: "119364003", display: "Serum specimen" },
    PLASMA: { code: "119361006", display: "Plasma specimen" },
    CSF: { code: "258450006", display: "Cerebrospinal fluid specimen" },
    SWAB: { code: "257261003", display: "Swab" },
  };

  const sampleType = sampleTypeMap[sample.sampleType?.toUpperCase()] ?? { code: "123038009", display: "Specimen" };

  return {
    resourceType: "Specimen",
    id: "specimen-" + sample.id,
    status: "available",
    type: {
      coding: [{ system: "http://snomed.info/sct", code: sampleType.code, display: sampleType.display }],
      text: sample.sampleType,
    },
    collection: {
      ...(sample.collectedAt ? { collectedDateTime: new Date(sample.collectedAt).toISOString() } : {}),
      collector: { reference: "#practitioner-default" },
    },
    container: sample.container ? [{ description: sample.container }] : [],
    note: sample.remarks ? [{ text: sample.remarks }] : [],
  };
}

function buildObservationResource(param: any, patientRef: string, specimenRef: string): object {
  const interpretation = resolveInterpretation(param);

  const value: any = {};
  if (param.numericValue !== null && param.numericValue !== undefined) {
    value.valueQuantity = {
      value: parseFloat(param.numericValue),
      unit: param.unit ?? "",
      system: "http://unitsofmeasure.org",
      code: param.unit ?? "",
    };
  } else if (param.textValue) {
    value.valueString = param.textValue;
  }

  return {
    resourceType: "Observation",
    id: "obs-" + param.id,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "laboratory",
            display: "Laboratory",
          },
        ],
      },
    ],
    code: {
      coding: param.loincCode
        ? [{ system: "http://loinc.org", code: param.loincCode, display: param.parameterName }]
        : [],
      text: param.parameterName,
    },
    subject: { reference: patientRef },
    specimen: { reference: specimenRef },
    effectiveDateTime: param.reportedAt ? new Date(param.reportedAt).toISOString() : new Date().toISOString(),
    ...value,
    referenceRange:
      param.normalRange || (param.lowValue !== null && param.highValue !== null)
        ? [
            {
              ...(param.lowValue !== null ? { low: { value: parseFloat(param.lowValue), unit: param.unit ?? "" } } : {}),
              ...(param.highValue !== null ? { high: { value: parseFloat(param.highValue), unit: param.unit ?? "" } } : {}),
              text: param.normalRange ?? `${param.lowValue} - ${param.highValue} ${param.unit ?? ""}`.trim(),
            },
          ]
        : [],
    interpretation: interpretation
      ? [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                code: interpretation.code,
                display: interpretation.display,
              },
            ],
            text: interpretation.display,
          },
        ]
      : [],
    note: param.remarks ? [{ text: param.remarks }] : [],
  };
}

function resolveInterpretation(param: any): { code: string; display: string } | null {
  if (param.isAbnormal === true || param.flag === "ABNORMAL" || param.flag === "H" || param.flag === "L") {
    const flag = param.flag ?? (param.numericValue > param.highValue ? "H" : "L");
    if (flag === "H" || (param.numericValue && param.highValue && parseFloat(param.numericValue) > parseFloat(param.highValue))) {
      return { code: "H", display: "High" };
    }
    if (flag === "L" || (param.numericValue && param.lowValue && parseFloat(param.numericValue) < parseFloat(param.lowValue))) {
      return { code: "L", display: "Low" };
    }
    return { code: "A", display: "Abnormal" };
  }
  if (param.isCritical === true || param.flag === "CRITICAL") {
    return { code: "AA", display: "Critical abnormal" };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Main: Build FHIR Bundle for an Order
// ─────────────────────────────────────────────────────────────

export async function buildFhirBundle(orderId: string): Promise<object> {
  // Load full order with patient, samples, and results
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      patient: true,
      samples: {
        include: {
          results: {
            include: {
              parameters: true,
              test: { select: { testCode: true, testName: true } },
              verifiedBy: { select: { id: true, fullName: true } },
            },
          },
        },
      },
    },
  });

  if (!order) throw new Error(`Order ${orderId} not found`);

  const patient = order.patient as any;
  const samples = order.samples as any[];
  const bundleId = crypto.randomUUID();
  const now = new Date().toISOString();

  const patientResource = buildPatientResource(patient);
  const patientRef = `Patient/patient-${patient.id}`;
  const orgResource = buildOrganizationResource();
  const orgRef = "Organization/organization-lab";

  // Collect all resources
  const entries: any[] = [];
  const drObsRefs: any[] = [];
  const specimenRefs: any[] = [];

  // Get first verifying doctor across all results
  let verifyingPractitioner: any = null;
  for (const sample of samples) {
    for (const result of sample.results ?? []) {
      if ((result as any).verifiedBy && !verifyingPractitioner) {
        verifyingPractitioner = (result as any).verifiedBy;
      }
    }
  }

  const practitionerResource = buildPractitionerResource(verifyingPractitioner);
  const practitionerRef = `Practitioner/practitioner-${verifyingPractitioner?.id ?? "default"}`;

  // Specimens and Observations
  for (const sample of samples) {
    const specimenResource = buildSpecimenResource(sample);
    const specimenId = `Specimen/specimen-${sample.id}`;
    specimenRefs.push({ reference: specimenId });
    entries.push({ fullUrl: specimenId, resource: specimenResource });

    for (const result of sample.results ?? []) {
      for (const param of (result as any).parameters ?? []) {
        const obsResource = buildObservationResource(param, patientRef, specimenId);
        const obsId = `Observation/obs-${param.id}`;
        drObsRefs.push({ reference: obsId });
        entries.push({ fullUrl: obsId, resource: obsResource });
      }
    }
  }

  // DiagnosticReport
  const drId = `DiagnosticReport/dr-${orderId}`;
  const diagnosticReport = {
    resourceType: "DiagnosticReport",
    id: "dr-" + orderId,
    status: "final",
    category: [
      {
        coding: [
          { system: "http://terminology.hl7.org/CodeSystem/v2-0074", code: "LAB", display: "Laboratory" },
        ],
      },
    ],
    code: {
      coding: [
        { system: "http://loinc.org", code: "11502-2", display: "Laboratory report" },
      ],
      text: "Diagnostic Laboratory Report",
    },
    subject: { reference: patientRef },
    effectiveDateTime: (order as any).createdAt ? new Date((order as any).createdAt).toISOString() : now,
    issued: now,
    performer: [{ reference: orgRef }, { reference: practitionerRef }],
    specimen: specimenRefs,
    result: drObsRefs,
    conclusion: "See individual observations for details.",
    identifier: [
      {
        system: `https://hip.${abdmConfig.hipId.toLowerCase()}.in/orders`,
        value: (order as any).orderNumber ?? orderId,
      },
    ],
  };

  // Composition (document entry point)
  const compositionResource = {
    resourceType: "Composition",
    id: "comp-" + orderId,
    status: "final",
    type: {
      coding: [{ system: "http://loinc.org", code: "11502-2", display: "Laboratory report" }],
      text: "Diagnostic Report",
    },
    subject: { reference: patientRef },
    date: now,
    author: [{ reference: orgRef }],
    title: `Diagnostic Report – ${abdmConfig.lab.name}`,
    section: [
      {
        title: "Laboratory Results",
        code: { coding: [{ system: "http://loinc.org", code: "30954-2" }] },
        entry: [{ reference: drId }],
      },
    ],
  };

  // Assemble final Bundle
  const bundle = {
    resourceType: "Bundle",
    id: bundleId,
    meta: {
      lastUpdated: now,
      profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"],
    },
    identifier: { system: "https://hip.abdm.gov.in/bundles", value: bundleId },
    type: "document",
    timestamp: now,
    entry: [
      { fullUrl: `Composition/comp-${orderId}`, resource: compositionResource },
      { fullUrl: patientRef, resource: patientResource },
      { fullUrl: orgRef, resource: orgResource },
      { fullUrl: practitionerRef, resource: practitionerResource },
      { fullUrl: drId, resource: diagnosticReport },
      ...entries,
    ],
  };

  return bundle;
}
