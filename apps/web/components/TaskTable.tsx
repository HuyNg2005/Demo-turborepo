"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/lib/api";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    ColumnDef,
    ColumnFiltersState,
} from "@tanstack/react-table";
import React, { useMemo, useState} from "react";
import type { Task } from "@/types";
import { useUIStore } from "@/lib/stores";
import { Skeleton } from "@workspace/ui/Skeleton";
import { Alert } from "@workspace/ui/Alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/Table";
import { Button } from "@workspace/ui/Button";
import { Input as UIInput } from "@workspace/ui/Input";
import { throttle } from "lodash";
import { Card } from "@workspace/ui/Card";

type Props = {
    projectId: string | null;
    tasks?: Task[];
};

const TaskTable = React.memo(({ projectId, tasks: propTasks }: Props) => {
    const { openModal } = useUIStore();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const { data: fetchedTasks = [], isLoading, error } = useQuery({
        queryKey: ["tasks", projectId],
        queryFn: () => fetchTasks(projectId),
        enabled: !!projectId && !propTasks,
        retry: 1,
        initialData: propTasks ?? [],
    });

    const tasks = propTasks ?? fetchedTasks;

    const columns = useMemo<ColumnDef<Task>[]>(
        () => [
            {
                accessorKey: "title",
                header: "Title",
                cell: ({ row }) => (
                    <div className="truncate max-w-[150px] sm:max-w-[250px]">{row.original.title}</div>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => row.original.status.replace(/_/g, " "),
            },
            {
                accessorFn: (row) => row.assignee?.name ?? "Unassigned",
                id: "assignee",
                header: "Assignee",
            },
            {
                accessorKey: "dueDate",
                header: "Due Date",
                cell: ({ row }) =>
                    row.original.dueDate
                        ? new Date(row.original.dueDate).toLocaleDateString()
                        : "-",
            },
        ],
        []
    );

    const table = useReactTable<Task>({
        data: tasks,
        columns,
        state: { columnFilters },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 3 } },
    });

    if (isLoading) return <Skeleton className="h-96 w-full" />;
    if (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return <Alert variant="destructive">Error: {msg}</Alert>;
    }
    if (!projectId && !propTasks) return <Alert variant="default">No project selected.</Alert>;
    if (!tasks.length) return <Alert variant="default">No tasks found.</Alert>;

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-4">
                {table.getAllColumns().map((column) => (
                    <UIInput
                        key={column.id}
                        placeholder={`Filter ${column.id}...`}
                        value={(column.getFilterValue() as string) ?? ""}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        className="w-full sm:w-auto max-w-xs text-sm"
                    />
                ))}
            </div>

            <div className="sm:hidden space-y-3">
                {table.getRowModel().rows.map((row) => {
                    const task = row.original;
                    return (
                        <Card
                            key={task.id}
                            className="p-3 cursor-pointer hover:bg-muted/50 active:scale-95 transition-transform"
                            onClick={() => openModal(task.id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-sm truncate flex-1 mr-2">{task.title}</h4>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                    {task.status.replace(/_/g, " ")}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p><strong>Assignee:</strong> {task.assignee?.name ?? "Unassigned"}</p>
                                <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden sm:block border rounded-lg shadow-sm border-gray-200 dark:border-gray-700 overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        onClick={
                                            header.column.getCanSort()
                                                ? header.column.getToggleSortingHandler()
                                                : undefined
                                        }
                                        className={
                                            header.column.getCanSort()
                                                ? "cursor-pointer min-w-[100px] sm:min-w-[150px] text-sm sm:text-base"
                                                : "min-w-[100px] sm:min-w-[150px] text-sm sm:text-base"
                                        }
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.original.id}
                                onClick={() => openModal(row.original.id)}
                                className="cursor-pointer hover:bg-muted/50 text-sm sm:text-base"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.column.id} className="py-2 sm:py-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
                <Button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    size="sm"
                >
                    Previous
                </Button>
                <span className="text-sm">
                    {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    size="sm"
                >
                    Next
                </Button>
            </div>
        </div>
    );
});

TaskTable.displayName = "TaskTable";

export default TaskTable;