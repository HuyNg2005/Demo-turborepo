"use client";

import { useUIStore } from "@/lib/stores";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { Card } from "@workspace/ui/Card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/Tooltip";
import Avatar from "@/components/Avatar";

type Props = {
    task: Task;
};

export default function TaskCard({ task }: Props) {
    const { openModal } = useUIStore();

    const { attributes, listeners, setNodeRef, transform } = useSortable({
        id: task.id,
        data: { type: "task" },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        touchAction: "none",
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="p-2 cursor-grab active:opacity-80"
            onClick={() => openModal(task.id)}
        >
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                    <Avatar user={task.assignee} className="h-6 w-6 sm:h-8 sm:w-8" />
                    <span className="text-sm">{task.assignee.name}</span>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        {task.dueDate}
                    </TooltipContent>
                </Tooltip>
            </div>
        </Card>
    );
}