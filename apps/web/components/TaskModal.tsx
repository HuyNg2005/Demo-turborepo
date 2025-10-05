"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUIStore } from "@/lib/stores";
import type { Task } from "@/types";
import { Input } from "@workspace/ui/Input";
import { Textarea } from "@workspace/ui/Textarea";
import { Button } from "@workspace/ui/Button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/Select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createTask, updateTask, fetchTask, fetchAssignees, deleteTask } from "@/lib/api";
import { Skeleton } from "@workspace/ui/Skeleton";
import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/Tooltip";
import toast from "react-hot-toast";

type Props = {
    projectId: string;
};

const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
    assigneeId: z.string().min(1, "Assignee is required"),
    dueDate: z
        .string()
        .refine((s) => {
            if (!s) return false;
            const selectedDate = new Date(s);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return !Number.isNaN(selectedDate.getTime()) && selectedDate >= today;
        }, { message: "Due date must be today or in the future" }),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function TaskModal({ projectId }: Props) {
    const { isModalOpen, closeModal, editingTaskId } = useUIStore();

    const { data: editingTask, isLoading: taskLoading } = useQuery({
        queryKey: ["task", projectId, editingTaskId],
        queryFn: () => fetchTask(projectId!, editingTaskId!),
        enabled: !!projectId && !!editingTaskId,
    });

    const { data: assignees = [] } = useQuery({
        queryKey: ["assignees"],
        queryFn: fetchAssignees,
    });

    const queryClient = useQueryClient();

    const { register, control, handleSubmit, formState: { errors }, reset } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "TODO",
            assigneeId: "",
            dueDate: new Date().toISOString().split("T")[0], // Default to today
        },
    });

    useEffect(() => {
        if (taskLoading) return;
        if (editingTask) {
            reset({
                title: editingTask.title,
                description: editingTask.description ?? "",
                status: editingTask.status,
                assigneeId: editingTask.assignee.id,
                dueDate: new Date(editingTask.dueDate).toISOString().split("T")[0],
            });
        }
    }, [editingTask, taskLoading, reset]);

    const createMutation = useMutation<Task, Error, TaskFormData>({
        mutationFn: (data) => createTask(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            closeModal();
            toast.success("Task created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create task: ${error.message}`);
        },
    });

    const updateMutation = useMutation<Task, Error, TaskFormData>({
        mutationFn: (data) => updateTask(projectId, editingTaskId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            closeModal();
            toast.success("Task updated successfully");
        },
        onError: (error) => {
            toast.error(`Failed to update task: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteTask(projectId, editingTaskId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            closeModal();
            toast.success("Task deleted successfully");
        },
        onError: (error) => {
            toast.error(`Failed to delete task: ${error.message}`);
        },
    });

    const onSubmit = (data: TaskFormData) => {
        if (editingTaskId) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = () => {
        if (editingTaskId && confirm(`Are you sure you want to delete task "${editingTask?.title}"?`)) {
            deleteMutation.mutate();
        }
    };

    if (!isModalOpen) return null;
    if (taskLoading && editingTaskId) return <Skeleton className="h-96 w-full sm:w-96" />;

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split("T")[0];

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) closeModal();
            }}
        >
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md text-black dark:text-white">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">
                    {editingTaskId ? "Edit Task" : "New Task"}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input
                            {...register("title")}
                            placeholder="Title"
                            className="text-sm sm:text-base"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                        <Textarea
                            {...register("description")}
                            placeholder="Description"
                            className="text-sm sm:text-base"
                        />
                    </div>
                    <div>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(v) => field.onChange(v)}
                                >
                                    <SelectTrigger className="text-sm sm:text-base">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODO">To Do</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="DONE">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div>
                        <Controller
                            name="assigneeId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(v) => field.onChange(v)}
                                >
                                    <SelectTrigger className="text-sm sm:text-base">
                                        <SelectValue placeholder="Select assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignees.map((assignee) => (
                                            <SelectItem key={assignee.id} value={assignee.id}>
                                                {assignee.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.assigneeId && <p className="text-red-500 text-sm mt-1">{errors.assigneeId.message}</p>}
                    </div>
                    <div>
                        <Input
                            type="date"
                            {...register("dueDate")}
                            min={today} // Restrict to today or future
                            className="text-sm sm:text-base"
                        />
                        {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeModal}
                            className="w-full sm:w-auto text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                        >
                            Cancel
                        </Button>
                        {editingTaskId && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={handleDelete}
                                        className="w-full sm:w-auto text-sm sm:text-base hover:bg-primary/90 active:scale-95 transition-transform"
                                        disabled={deleteMutation.isPending}
                                    >
                                        Delete
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Delete task
                                </TooltipContent>
                            </Tooltip>
                        )}
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="w-full sm:w-auto text-sm sm:text-base hover:bg-primary/90 active:scale-95 transition-transform"
                        >
                            {editingTaskId ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}