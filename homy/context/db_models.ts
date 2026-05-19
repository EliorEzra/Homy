export const DatabaseIDs = {
    DATABASE: '69f0d87e002066c90e1f',
    TASKS: 'tasks',
    EVENTS: 'events',
}

export type Task = {
    task_text?: string;
    description?: string;
    due_date?: string;
    status?: "todo" | "in-progress" | "done";
    completed?: boolean;
    userId?: string;
}

export type CalEvent = {
    title?: string;
    date?: string;
    time?: string;
    description?: string;
    userId?: string;
}
