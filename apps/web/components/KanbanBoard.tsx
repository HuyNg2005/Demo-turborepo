"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, updateTask } from "@/lib/api";
import KanbanColumn from "./KanbanColumn";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useState } from "react";
import type { Task } from "@/types";
import { Skeleton } from "@workspace/ui/Skeleton";
import { Alert } from "@workspace/ui/Alert";
import TaskCard from "./TaskCard";
import toast from "react-hot-toast";

type Props = {
    projectId: string | null;
};

const statuses = ["TODO", "IN_PROGRESS", "DONE"] as const;
type Status = (typeof statuses)[number];

const KanbanBoard = React.memo(({ projectId }: Props) => {
    const queryClient = useQueryClient();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const {
        data: tasks = [],
        isLoading,
        error,
    } = useQuery<Task[], Error>({
        queryKey: ["tasks", projectId],
        queryFn: () => (projectId ? fetchTasks(projectId) : Promise.resolve([])),
        enabled: !!projectId,
        retry: 1,
    });

    const mutation = useMutation({
        mutationFn: async ({
                               taskId,
                               status,
                           }: {
            taskId: string;
            status: Status;
        }) => updateTask(projectId!, taskId, { status }),
        onMutate: async ({ taskId, status }) => {
            await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });
            const previousTasks = queryClient.getQueryData<Task[]>(["tasks", projectId]) || [];
            queryClient.setQueryData<Task[]>(
                ["tasks", projectId],
                previousTasks.map((t) =>
                    t.id === taskId ? { ...t, status } : t
                )
            );
            return { previousTasks };
        },
        onSuccess: () => {
            toast.success("Task status updated successfully");
        },
        onError: (err, _variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(["tasks", projectId], context.previousTasks);
            }
            toast.error(`Failed to update task status: ${err.message}`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            setActiveTask(null);
        },
    });

    const handleDragStart = (event: DragEndEvent) => {
        const task = tasks.find((t) => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !projectId) {
            setActiveTask(null);
            return;
        }

        const newStatus = over.id as Status;
        if (statuses.includes(newStatus)) {
            mutation.mutate({ taskId: String(active.id), status: newStatus });
        } else {
            setActiveTask(null);
        }
    };

    if (isLoading) return <Skeleton className="h-96 w-full" />;
    if (error) return <Alert variant="destructive">Error: {error.message}</Alert>;
    if (!projectId) return <Alert variant="default">No project selected.</Alert>;
    if (tasks.length === 0)
        return <Alert variant="default">No tasks found.</Alert>;

    const tasksByStatus: Record<Status, Task[]> = statuses.reduce(
        (acc, status) => {
            acc[status] = tasks.filter((task: Task) => task.status === status);
            return acc;
        },
        {} as Record<Status, Task[]>
    );

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            sensors={sensors}
        >
            <SortableContext
                items={[...statuses] as Status[]}
                strategy={horizontalListSortingStrategy}
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                    {statuses.map((status) => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            tasks={tasksByStatus[status]}
                        />
                    ))}
                </div>
            </SortableContext>
            <DragOverlay>
                {activeTask ? (
                    <TaskCard task={activeTask} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
});

KanbanBoard.displayName = "KanbanBoard";

export default KanbanBoard;