"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUIStore, useThemeStore } from "@/lib/stores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAssignees, inviteUsersToProject } from "@/lib/api";
import { Button } from "@workspace/ui/Button";
import Select from "react-select";
import { Skeleton } from "@workspace/ui/Skeleton";
import { Alert } from "@workspace/ui/Alert";
import toast from "react-hot-toast";
import { selectStyles } from "@/lib/selectStyles";

type Props = {
    projectId: string;
};

const inviteSchema = z.object({
    userIds: z.array(z.string()).min(1, "Please select at least one user"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function InviteUsersModal({ projectId }: Props) {
    const { isInviteModalOpen, closeInviteModal } = useUIStore();
    const { theme } = useThemeStore();

    const { data: assignees = [], isLoading } = useQuery({
        queryKey: ["assignees"],
        queryFn: fetchAssignees,
    });

    const { control, handleSubmit, formState: { errors }, reset } = useForm<InviteFormData>({
        resolver: zodResolver(inviteSchema),
        defaultValues: { userIds: [] },
    });

    const queryClient = useQueryClient();

    const inviteMutation = useMutation({
        mutationFn: (data: InviteFormData) => inviteUsersToProject(projectId, data.userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            closeInviteModal();
            toast.success("Invitations sent successfully");
            reset();
        },
        onError: (error: Error) => {
            toast.error(`Failed to send invitations: ${error.message}`);
        },
    });

    const onSubmit = (data: InviteFormData) => {
        inviteMutation.mutate(data);
    };

    if (!isInviteModalOpen) return null;
    if (isLoading) return <Skeleton className="h-64 w-full sm:w-96" />;
    if (!projectId) return <Alert variant="destructive">No project selected</Alert>;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) closeInviteModal();
            }}
        >
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md text-black dark:text-white">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">Invite Users to Project</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Controller
                            name="userIds"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    isMulti
                                    options={assignees.map((assignee) => ({
                                        value: assignee.id,
                                        label: assignee.name,
                                    }))}
                                    value={assignees
                                        .filter((assignee) => field.value.includes(assignee.id))
                                        .map((assignee) => ({ value: assignee.id, label: assignee.name }))}
                                    onChange={(selected) =>
                                        field.onChange(selected ? selected.map((option) => option.value) : [])
                                    }
                                    placeholder="Select users to invite"
                                    className="text-sm sm:text-base"
                                    classNamePrefix="react-select"
                                    styles={selectStyles(theme === "dark")}
                                />
                            )}
                        />
                        {errors.userIds && <p className="text-red-500 text-sm mt-1">{errors.userIds.message}</p>}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeInviteModal}
                            className="w-full sm:w-auto text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={inviteMutation.isPending}
                            className="w-full sm:w-auto text-sm sm:text-base hover:bg-primary/90 active:scale-95 transition-transform"
                        >
                            Send Invites
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}