import TaskCard from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "@/types";
import { Card } from "@workspace/ui/Card";

type Props = {
    status: Task["status"];
    tasks: Task[];
};

export default function KanbanColumn({ status, tasks }: Props) {
    const { setNodeRef } = useDroppable({ id: status });

    return (
        <Card className="p-4">
            <h3 className="font-semibold mb-2">{status.replace("_", " ")}</h3>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`flex flex-col gap-2 ${
                        tasks.length > 2
                            ? "max-h-[240px] sm:max-h-[300px] overflow-y-auto scrollbar-always"
                            : "h-[240px] sm:h-[300px]"
                    }`}
                >
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                    {tasks.length === 0 && (
                        <>
                            <div className="bg-muted p-2 rounded">Description</div>
                            <div className="bg-muted p-2 rounded">Task</div>
                        </>
                    )}
                </div>
            </SortableContext>
        </Card>
    );
}