"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllTasks } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/Table";
import { Button } from "@workspace/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/Select";
import { Skeleton } from "@workspace/ui/Skeleton";
import { Alert } from "@workspace/ui/Alert";
import Link from "next/link";
import type { Task } from "@/types";

export default function TasksPage() {
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const { data: tasks = [], isLoading, error } = useQuery({
        queryKey: ["allTasks"],
        queryFn: fetchAllTasks,
    });

    const filteredTasks = statusFilter
        ? tasks.filter((task) => task.status === statusFilter)
        : tasks;

    if (isLoading) return <Skeleton className="h-64 w-full" />;

    if (error) return <Alert variant="destructive">Error loading tasks: {(error as Error).message}</Alert>;

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Button
                            variant="outline"
                            className="text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                        >
                            Back to Project
                        </Button>
                    </Link>
                    <h2 className="text-lg sm:text-xl font-bold">All Tasks</h2>
                </div>
                <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
                >
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {filteredTasks.length === 0 ? (
                <Alert variant="default">No tasks found.</Alert>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Due Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.map((task: Task & { projectName: string }) => (
                            <TableRow key={`${task.id}-${task.projectName}`}>
                                <TableCell>{task.projectName}</TableCell>
                                <TableCell>{task.title}</TableCell>
                                <TableCell>{task.status}</TableCell>
                                <TableCell>{task.assignee.name}</TableCell>
                                <TableCell>{task.dueDate || "N/A"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}