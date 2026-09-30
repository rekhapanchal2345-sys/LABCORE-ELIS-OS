"use client";

import React from "react";
import Link from "next/link";
import type { Doctor } from "./DoctorTable";

interface DoctorCardProps {
  doctor: Doctor;
  onDelete?: (doctor: Doctor) => void;
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

export default function DoctorCard({
  doctor,
  onDelete,
}: DoctorCardProps) {
  const name = getDoctorName(doctor);
  const active = doctor.isActive !== false;

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {doctor.photoUrl ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full overflow-hidden">
              <img 
                src={doctor.photoUrl} 
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
              {getInitials(doctor)}
            </div>
          )}

          <div className="min-w-0">
            <Link
              href={`/doctors/${doctor.id}`}
              className="block truncate text-base font-semibold text-gray-900 hover:underline"
            >
              {name}
            </Link>

            <p className="mt-1 truncate text-xs text-gray-500">
              {doctor.doctorCode ||
                doctor.doctorId ||
                doctor.registrationNumber ||
                `Doctor #${doctor.id}`}
            </p>
            {doctor.department && (
              <p className="mt-0.5 truncate text-xs text-gray-400">
                {doctor.department}
              </p>
            )}
          </div>
        </div>

        <span
          className={
            active
              ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
              : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
          }
        >
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-xs text-gray-400">
            Specialization
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {doctor.specialization || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Qualification
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {doctor.qualification || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">
            Phone
          </p>

          <p className="mt-1 text-sm text-gray-700">
            {doctor.phone || "—"}
          </p>
        </div>

        {doctor.email && (
          <div>
            <p className="text-xs text-gray-400">
              Email
            </p>

            <p className="mt-1 truncate text-sm text-gray-700">
              {doctor.email}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Link
          href={`/doctors/${doctor.id}`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          View
        </Link>

        <Link
          href={`/doctors/${doctor.id}?edit=true`}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit
        </Link>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(doctor)}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}