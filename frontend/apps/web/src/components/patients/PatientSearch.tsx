"use client";

import React, { ChangeEvent, FormEvent } from "react";

interface PatientSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export default function PatientSearch({
  value,
  onChange,
  onSearch,
  placeholder = "Search patient by name, ID, phone or email...",
  loading = false,
}: PatientSearchProps) {
  function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    onChange(event.target.value);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (onSearch) {
      onSearch(value.trim());
    }
  }

  function handleClear() {
    onChange("");

    if (onSearch) {
      onSearch("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row"
    >
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>

        <input
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        {value && !loading && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}