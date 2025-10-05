import type {Task, Project, Assignee} from "@/types";

// Mock DB
const mockProjects: Project[] = [
    { id: "proj-1", name: "Frontend Refactor", createdAt: "2025-04-01T10:00:00Z" },
    { id: "proj-2", name: "Mobile MVP", createdAt: "2025-04-10T12:00:00Z" },
];

const mockTasks: Record<string, Task[]> = {
    "proj-1": [
        {
            id: "task-101",
            title: "Setup Zustand store",
            description: "Implement global state for modal and current project",
            status: "IN_PROGRESS",
            assignee: { id: "user-1", name: "Alice" },
            dueDate: "2025-05-15",
        },
    ],
    "proj-2": [
        {
            id: "task-201",
            title: "Design Mobile UI",
            description: "Create wireframes for mobile app",
            status: "TODO",
            assignee: { id: "user-2", name: "Bob" },
            dueDate: "2025-06-01",
        },
    ],
};

const mockAssignees: Assignee[] = [
    { id: "user-1", name: "Alice" },
    { id: "user-2", name: "Bob" },
    { id: "user-3", name: "Charlie" },
];

// Mock invited users per project
const mockInvitations: Record<string, string[]> = {
    "proj-1": ["user-1", "user-2"],
    "proj-2": ["user-2", "user-3"],
};

// Mock user profile
const mockUserProfile = {
    id: "user-1",
    name: "Alice",
    email: "alice@example.com",
    joinedProjects: ["proj-1"],
};


// -------------------- User Profile --------------------
export const fetchUserProfile = async (): Promise<{
    id: string;
    name: string;
    email: string;
    joinedProjects: string[];
    invitedUsers: { projectId: string; projectName: string; users: Assignee[] }[];
}> => {
    const invitedUsers = mockProjects
        .filter((project) => mockUserProfile.joinedProjects.includes(project.id))
        .map((project) => ({
            projectId: project.id,
            projectName: project.name,
            users: (mockInvitations[project.id] || [])
                .map((userId) => mockAssignees.find((a) => a.id === userId))
                .filter((user): user is Assignee => !!user),
        }));
    return new Promise((resolve) =>
        setTimeout(() => resolve({ ...mockUserProfile, invitedUsers }), 200)
    );
};


// -------------------- Projects --------------------
export const fetchProjects = async (): Promise<Project[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockProjects), 300));
};

// -------------------- Tasks --------------------
export const fetchAllTasks = async (): Promise<(Task & { projectName: string })[]> => {
    const allTasks: (Task & { projectName: string })[] = [];
    for (const project of mockProjects) {
        const tasks = mockTasks[project.id] || [];
        tasks.forEach((task) => {
            allTasks.push({ ...task, projectName: project.name });
        });
    }
    return new Promise((resolve) => setTimeout(() => resolve(allTasks), 300));
};

export const fetchTasks = async (projectId: string | null): Promise<Task[]> => {
    if (!projectId) throw new Error("No projectId provided");
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if (mockTasks[projectId]) resolve(mockTasks[projectId]);
            else reject(new Error(`404 Tasks not found for project: ${projectId}`));
        }, 300)
    );
};

export const createTask = async (
    projectId: string | null,
    task: Omit<Task, "id" | "assignee"> & { assigneeId: string }
): Promise<Task> => {
    if (!projectId) throw new Error("No projectId provided");

    const assignee = mockAssignees.find((a) => a.id === task.assigneeId);
    if (!assignee) throw new Error("Assignee not found");

    const newTask: Task = {
        id: `task-${Date.now()}`,
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        assignee: { id: task.assigneeId, name: assignee.name },
        dueDate: task.dueDate,
    };

    if (!mockTasks[projectId]) mockTasks[projectId] = [];
    mockTasks[projectId].push(newTask);

    return newTask;
};

export const updateTask = async (
    projectId: string,
    taskId: string,
    updates: Partial<Omit<Task, "id" | "assignee"> & { assigneeId?: string }>
): Promise<Task> => {
    if (!mockTasks[projectId]) throw new Error("Project not found");
    const tasks = mockTasks[projectId];
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error("Task not found");

    // @ts-ignore
    const updatedAssignee = updates.assigneeId
        ? mockAssignees.find((a) => a.id === updates.assigneeId)
        : tasks[index].assignee;

    // @ts-ignore
    const updated: Task = {
        ...tasks[index],
        ...updates,
        assignee: updatedAssignee || tasks[index].assignee,
    };

    tasks[index] = updated;
    return new Promise((resolve) => setTimeout(() => resolve(updated), 200));
};

export const fetchTask = async (projectId: string, taskId: string): Promise<Task> => {
    if (!mockTasks[projectId]) throw new Error("Project not found");
    const task = mockTasks[projectId].find((t) => t.id === taskId);
    if (!task) throw new Error("Task not found");
    return new Promise((resolve) => setTimeout(() => resolve(task), 200));
};

export const fetchAssignees = async (): Promise<Assignee[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockAssignees), 200));
};

export const deleteTask = async (projectId: string, taskId: string): Promise<void> => {
    if (!mockTasks[projectId]) throw new Error("Project not found");
    mockTasks[projectId] = mockTasks[projectId].filter((task) => task.id !== taskId);
    return new Promise((resolve) => setTimeout(() => resolve(), 200));
};

export const inviteUsersToProject = async (projectId: string, userIds: string[]): Promise<void> => {
    if (!mockProjects.some((p) => p.id === projectId)) throw new Error("Project not found");
    if (!userIds.every((id) => mockAssignees.some((a) => a.id === id))) {
        throw new Error("One or more users not found");
    }

    if (!mockInvitations[projectId]) mockInvitations[projectId] = [];
    // @ts-ignore
    mockInvitations[projectId].push(...userIds.filter((id) => !mockInvitations[projectId].includes(id)));

    return new Promise((resolve) => setTimeout(() => resolve(), 200));
};

