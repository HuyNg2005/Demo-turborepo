
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/lib/api";
import { flexRender, getCoreRowModel, useReactTable, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { Task } from "@/types";
import { useUIStore } from "@/lib/stores";
import {Skeleton} from "@workspace/ui/Skeleton";
import {Input} from "@workspace/ui/Input";
import {Table,TableBody, TableCell, TableHead, TableHeader, TableRow} from "@workspace/ui/Table";
import {Button} from "@workspace/ui/Button";

type Props = {
    projectId: string;
};

export default function TaskTable({ projectId }: Props) {
    const { openModal } = useUIStore();
    const [globalFilter, setGlobalFilter] = useState("");

    const { data: tasks, isLoading } = useQuery({
        queryKey: ["tasks", projectId],
        queryFn: () => fetchTasks(projectId),
    });

    const columns = useMemo(
        () => [
            {
                accessorKey: "title",
                header: "Title",
            },
            {
                accessorKey: "status",
                header: "Status",
            },
            {
                accessorFn: (row: Task) => row.assignee.name,
                id: "assignee",
                header: "Assignee",
            },
            {
                accessorKey: "dueDate",
                header: "Due Date",
                cell: ({ row }: { row: any }) => new Date(row.original.dueDate).toLocaleDateString(),
            },
        ],
        []
    );

    const table = useReactTable({
        data: tasks ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    if (isLoading) return <Skeleton className="h-96 w-full" />;

    return (
        <div>
            <Input
                placeholder="Filter tasks..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="mb-4 max-w-sm"
            />
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} onClick={() => openModal(row.original.id)}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-end mt-4 gap-2">
                <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Previous
                </Button>
                <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Next
                </Button>
            </div>
        </div>
    );
}