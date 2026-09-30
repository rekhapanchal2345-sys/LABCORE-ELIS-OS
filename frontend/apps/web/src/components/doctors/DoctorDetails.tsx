"use client";

import React from "react";
import Link from "next/link";
import type { Doctor } from "./DoctorTable";

interface DoctorDetailsProps {
  doctor: Doctor;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getDoctorName(doctor: Doctor) {
  if (doctor.fullName) return doctor.fullName;
  if (doctor.name) return doctor.name;

  return [
    doctor.firstName,
    doctor.middleName,
    doctor.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Unknown Doctor";
}

function getInitials(doctor: Doctor) {
  const name = getDoctorName(doctor);

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "D";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium text-gray-800">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function DoctorDetails({
  doctor,
  onEdit,
  onDelete,
}: DoctorDetailsProps) {
  const name = getDoctorName(doctor);
  const active = doctor.isActive !== false;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-700">
                {getInitials(doctor)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">
                    {name}
                  </h1>

                  <span
                    className={
                      active
                        ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                        : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                    }
                  >
                    {active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Doctor ID:{" "}
                  <span className="font-medium text-gray-700">
                    {doctor.doctorId ||
                      doctor.registrationNumber ||
                      doctor.id}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit Doctor
                </button>
              )}

              <Link
                href={`/patients?doctorId=${doctor.id}`}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                View Patients
              </Link>

              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Professional Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Specialization"
            value={doctor.specialization}
          />

          <InfoItem
            label="Qualification"
            value={doctor.qualification}
          />

          <InfoItem
            label="Registration Number"
            value={doctor.registrationNumber}
          />

          <InfoItem
            label="Status"
            value={active ? "Active" : "Inactive"}
          />
        </dl>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Contact Information
          </h2>
        </div>

        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <InfoItem
            label="Phone"
            value={doctor.phone}
          />

          <InfoItem
            label="Email"
            value={doctor.email}
          />
        </dl>
      </section>

      {/* Digital Signature Section */}
      {doctor.signatureUrl && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Digital Signature
            </h2>
          </div>

          <div className="p-5">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Signature (for report approval/printing)
              </dt>
              <dd className="mt-2">
                <div className="h-32 w-48 rounded border border-gray-300 overflow-hidden bg-white">
                  <img src={doctor.signatureUrl} alt="Doctor signature" className="h-full w-full object-contain" />
                </div>
              </dd>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}