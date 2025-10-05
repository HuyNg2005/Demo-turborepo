import { useUIStore } from "@/lib/stores";
import type { Project } from "@/types";
import { Button } from "@workspace/ui/Button";
import { Separator } from "@workspace/ui/Separator";
import { useThemeStore } from "@/lib/stores";
import {
    FolderIcon,
    ListBulletIcon,
    UserIcon,
    MoonIcon,
    SunIcon,
    Bars3Icon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import Link from "next/link";
import {TrophyIcon} from "lucide-react";

type Props = {
    projects: Project[];
};

export default function Sidebar({ projects }: Props) {
    const { setActiveProjectId } = useUIStore();
    const { theme, toggleTheme } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);

    if (!projects) return <div className="p-4">Loading projects...</div>;

    return (
        <>
            <Button
                variant="ghost"
                className="sm:hidden p-3 fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-md shadow-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bars3Icon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
            </Button>
            <nav
                className={`w-56 sm:w-64 bg-muted p-4 sm:p-6 flex flex-col fixed sm:static top-0 left-0 h-full z-40 transition-transform transform ${
                    isOpen ? "translate-x-0 shadow-md" : "-translate-x-full"
                } sm:translate-x-0`}
            >
                <div className="mt-16 sm:mt-0">
                    <Button
                        variant="ghost"
                        className="justify-start mb-3 text-sm sm:text-base w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setActiveProjectId(null)}
                    >
                        <FolderIcon className="w-5 h-5 mr-3" />
                        Projects
                    </Button>
                    <Link href="/tasks">
                    <Button
                        variant="ghost"
                        className="justify-start mb-3 text-sm sm:text-base w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ListBulletIcon className="w-5 h-5 mr-3" />
                        Tasks
                    </Button>
                    </Link>
                    <Link href="/profile">
                    <Button
                        variant="ghost"
                        className="justify-start mb-3 text-sm sm:text-base w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <UserIcon className="w-5 h-5 mr-3" />
                        Profile
                    </Button>
                    </Link>
                    <Separator className="my-4" />
                    <Button
                        variant="ghost"
                        className="justify-start text-sm sm:text-base w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={toggleTheme}
                    >
                        {theme === "dark" ? (
                            <>
                                <SunIcon className="w-5 h-5 mr-3" />
                                Light
                            </>
                        ) : (
                            <>
                                <MoonIcon className="w-5 h-5 mr-3" />
                                Dark
                            </>
                        )}
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    className="sm:hidden mt-4 w-full text-sm text-red-500"
                    onClick={() => setIsOpen(false)}
                >
                    Close
                </Button>
            </nav>
        </>
    );
}