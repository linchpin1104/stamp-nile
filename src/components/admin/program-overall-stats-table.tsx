
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ProgramOverallStatsEntry {
  programId: string;
  programTitle: string;
  participantCount: number; // Total users considered as potential participants
  completedCount: number;
  completionRate: number; // Percentage
  averageSatisfaction: number | null;
}

const StarRatingDisplay: React.FC<{ score: number | null }> = ({ score }) => {
  if (score === null || score === undefined) return <span className="text-xs text-muted-foreground">-</span>;
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.round(score) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">({score.toFixed(1)})</span>
    </div>
  );
};

export const columns: ColumnDef<ProgramOverallStatsEntry>[] = [
  {
    accessorKey: "programTitle",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Program Title <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <Link href={`/admin/programs/${entry.programId}/edit`} className="font-medium hover:underline">
          {entry.programTitle}
        </Link>
      );
    },
  },
  {
    accessorKey: "participantCount",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-center w-full justify-center">
        Participants <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("participantCount")}</div>,
  },
  {
    accessorKey: "completedCount",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-center w-full justify-center">
        Completions <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("completedCount")}</div>,
  },
  {
    accessorKey: "completionRate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-center w-full justify-center">
        Completion Rate <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center tabular-nums">{`${row.getValue("completionRate")}%`}</div>,
  },
  {
    accessorKey: "averageSatisfaction",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-center w-full justify-center">
        Avg. Satisfaction <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StarRatingDisplay score={row.getValue("averageSatisfaction") as number | null} />
      </div>
    ),
  },
];

interface ProgramOverallStatsTableProps {
  data: ProgramOverallStatsEntry[];
}

export function ProgramOverallStatsTable({ data }: ProgramOverallStatsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "programTitle", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
        pagination: {
            pageSize: 5, // Show fewer programs for this summary table
        }
    }
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by program title..."
          value={(table.getColumn("programTitle")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("programTitle")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No program statistics available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
