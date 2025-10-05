"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

import type { Assignee } from "@/types";
import {cn} from "@workspace/ui/lib/utils";

type Props = {
    user: Assignee;
    className?: string;
};

export default function Avatar({ user, className }: Props) {
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <AvatarPrimitive.Root
            className={cn(
                "inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
                className
            )}
        >
            <AvatarPrimitive.Image
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={`${user.name}'s avatar`}
                className="h-full w-full rounded-full object-cover"
            />
            <AvatarPrimitive.Fallback className="text-sm sm:text-base">
                {initials}
            </AvatarPrimitive.Fallback>
        </AvatarPrimitive.Root>
    );
}