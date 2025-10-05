"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import TaskTable from "@/components/TaskTable";
import TaskModal from "@/components/TaskModal";
import InviteUsersModal from "@/components/InviteUsersModal";
import ViewToggle from "@/components/ViewToggle";
import { useUIStore } from "@/lib/stores";
import { useEffect, useState } from "react";
import { Skeleton } from "@workspace/ui/Skeleton";
import { Alert } from "@workspace/ui/Alert";
import { TooltipProvider } from "@workspace/ui/Tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/Select";
import { Button } from "@workspace/ui/Button";
import { useThemeStore } from "@/lib/stores";

export default function Page()
{
    const { activeProjectId, setActiveProjectId, viewMode } = useUIStore();
    const { data: projects, isLoading, error } = useQuery({
        queryKey: ["projects"],
        queryFn: fetchProjects,
    });

    const [mounted, setMounted] = useState(false);
    const { theme } = useThemeStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (projects && !activeProjectId && projects.length > 0) {
            // @ts-ignore
            setActiveProjectId(projects[0].id);
        }
    }, [projects, activeProjectId, setActiveProjectId]);

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    if (!mounted || isLoading) return <Skeleton className="h-screen w-full" />;
    if (error) return <Alert variant="destructive">Error: {(error as Error).message}</Alert>;
    if (!projects?.length) return <Alert variant="default">No projects found.</Alert>;

    return (
        <TooltipProvider>
            <div className="flex flex-col sm:flex-row h-screen">
                <Sidebar projects={projects} />
                <main className="flex-1 p-4 sm:p-6 pt-16 sm:pt-6 overflow-auto">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Select
                                value={activeProjectId || ""}
                                onValueChange={(value) => setActiveProjectId(value || null)}
                            >
                                <SelectTrigger className="w-full sm:w-[200px] text-sm sm:text-base">
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="sm:hidden">
                                <ViewToggle />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {activeProjectId && (
                                <>
                                    <Button
                                        onClick={() => useUIStore.getState().openModal()}
                                        className="w-full sm:w-auto text-sm sm:text-base"
                                    >
                                        New Task
                                    </Button>
                                    <Button
                                        onClick={() => useUIStore.getState().openInviteModal()}
                                        className="w-full sm:w-auto text-sm sm:text-base"
                                    >
                                        Invite Users
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    {activeProjectId ? (
                        <>
                            <div className={viewMode === "board" ? "block sm:block" : "hidden sm:block"}>
                                <KanbanBoard projectId={activeProjectId} />
                            </div>
                            <div className="sm:block">
                                <h2 className={viewMode === "table" ? "text-lg sm:text-xl font-bold mt-4 sm:mt-6 block sm:block" : "text-lg sm:text-xl font-bold mt-4 sm:mt-6 hidden sm:block"}>Tasks</h2>
                                <div className={viewMode === "table" ? "block sm:block" : "hidden sm:block"}>
                                    <TaskTable projectId={activeProjectId} />
                                </div>
                            </div>
                            <TaskModal projectId={activeProjectId} />
                            <InviteUsersModal projectId={activeProjectId} />
                        </>
                    ) : (
                        <Alert variant="default">Please select a project.</Alert>
                    )}
                </main>
            </div>
        </TooltipProvider>
    );
}