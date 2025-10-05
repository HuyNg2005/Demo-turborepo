"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile, fetchProjects } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/Card";
import { Skeleton } from "@workspace/ui/Skeleton";
import { Alert } from "@workspace/ui/Alert";
import Link from "next/link";
import {Button} from "@workspace/ui/Button";

export default function ProfilePage() {
    const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
        queryKey: ["profile"],
        queryFn: fetchUserProfile,
    });

    const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery({
        queryKey: ["projects"],
        queryFn: fetchProjects,
    });

    if (profileLoading || projectsLoading) return <Skeleton className="h-64 w-full" />;

    if (profileError || projectsError) {
        const errorMessage = profileError
            ? (profileError as Error).message
            : (projectsError as Error).message;
        return <Alert variant="destructive">Error loading profile: {errorMessage}</Alert>;
    }

    if (!profile) return <Alert variant="destructive">No profile found</Alert>;

    const joinedProjects = projects.filter((project) => profile.joinedProjects.includes(project.id));

    return (
        <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
                <Link href="/">
                    <Button
                        variant="outline"
                        className="text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                    >
                        Back to Project
                    </Button>
                </Link>
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">User Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Name</h3>
                        <p className="text-base sm:text-lg">{profile.name}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</h3>
                        <p className="text-base sm:text-lg">{profile.email}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Joined Projects</h3>
                        {joinedProjects.length === 0 ? (
                            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">No projects joined</p>
                        ) : (
                            <ul className="list-disc pl-5 space-y-1">
                                {joinedProjects.map((project) => (
                                    <li key={project.id} className="text-base sm:text-lg">
                                        {project.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}