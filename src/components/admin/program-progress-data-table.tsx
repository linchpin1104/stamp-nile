
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown, UserCheck, Star, CalendarDays } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

export interface ProgramProgressEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  programId: string;
  programTitle: string;
  progressPercent: number;
  status: 'Completed' | 'In Progress' | 'Not Started';
  satisfactionScore?: number;
  completionDate?: string;
}

const StarRating: React.FC<{ score?: number }> = ({ score }) => {
  if (score === undefined || score === null) return <span className="text-xs text-muted-foreground">-</span>;
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < score ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">({score.toFixed(1)})</span>
    </div>
  );
};


export const columns: ColumnDef<ProgramProgressEntry>[] = [
  {
    accessorKey: "userName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        User <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.userAvatar} alt={user.userName} data-ai-hint="user avatar small" />
            <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link href={`/admin/users/${user.userId}/view`} className="font-medium hover:underline">
            {user.userName}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "programTitle",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Program <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
        const entry = row.original;
        return (
            <Link href={`/admin/programs/${entry.programId}/edit`} className="hover:underline">
                {entry.programTitle}
            </Link>
        );
    }
  },
  {
    accessorKey: "progressPercent",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-center w-full justify-center">
        Progress <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const progress = row.getValue("progressPercent") as number;
      return (
        <div className="flex items-center space-x-2 justify-center">
          <Progress value={progress} className="w-24 h-2" />
          <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
        </div>
      );
    },
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-center w-full justify-center">
        Status <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as ProgramProgressEntry['status'];
      let badgeVariant: "default" | "secondary" | "outline" = "outline";
      let badgeClasses = "border-muted-foreground/50 text-muted-foreground";
      if (status === "Completed") {
        badgeVariant = "default";
        badgeClasses = "bg-green-100 text-green-700 border-green-300 hover:bg-green-200";
      } else if (status === "In Progress") {
        badgeVariant = "secondary";
        badgeClasses = "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200";
      }
      return (
        <div className="text-center">
            <Badge variant={badgeVariant} className={cn("capitalize font-medium", badgeClasses)}>
                {status === 'Completed' && <UserCheck className="mr-1 h-3 w-3"/>}
                {status.replace('_', ' ')}
            </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "satisfactionScore",
    header: "Satisfaction",
    cell: ({ row }) => <StarRating score={row.original.satisfactionScore} />,
  },
  {
    accessorKey: "completionDate",
    header: "Completion Date",
    cell: ({ row }) => {
      const date = row.original.completionDate;
      return date ? <span className="text-xs text-muted-foreground flex items-center"><CalendarDays className="mr-1.5 h-3.5 w-3.5" />{format(new Date(date), "yyyy-MM-dd")}</span> : <span className="text-xs text-muted-foreground">-</span>;
    },
  },
];

interface ProgramProgressDataTableProps {
  data: ProgramProgressEntry[];
}

export function ProgramProgressDataTable({ data }: ProgramProgressDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "programTitle", desc: false },
    { id: "userName", desc: false },
  ]);
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
            pageSize: 10,
        }
    }
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by user name..."
          value={(table.getColumn("userName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("userName")?.setFilterValue(event.target.value)
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
                  No progress data found for the selected filter.
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
