"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface TableProps
  extends React.HTMLAttributes<HTMLTableElement> {}

export function Table({
  className,
  children,
  ...props
}: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table
        className={cn(
          "w-full border-collapse text-left text-sm",
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableHeader({
  className,
  children,
  ...props
}: TableHeaderProps) {
  return (
    <thead
      className={cn(
        "border-b border-gray-200 bg-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({
  className,
  children,
  ...props
}: TableBodyProps) {
  return (
    <tbody
      className={cn(
        "divide-y divide-gray-100 bg-white",
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
}

interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {}

export function TableRow({
  className,
  children,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export function TableHead({
  className,
  children,
  ...props
}: TableHeadProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500",
        "whitespace-nowrap",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export function TableCell({
  className,
  children,
  ...props
}: TableCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-sm text-gray-700",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

interface TableEmptyProps {
  message?: string;
  colSpan?: number;
}

export function TableEmpty({
  message = "No data found",
  colSpan = 1,
}: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="py-12 text-center text-gray-500"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

interface TableLoadingProps {
  colSpan?: number;
  rows?: number;
}

export function TableLoading({
  colSpan = 1,
  rows = 5,
}: TableLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }).map(
        (_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({
              length: colSpan,
            }).map((_, cellIndex) => (
              <TableCell key={cellIndex}>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              </TableCell>
            ))}
          </TableRow>
        )
      )}
    </>
  );
}

export default Table;