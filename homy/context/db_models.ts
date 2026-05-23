export const DatabaseIDs = {
    DATABASE: '69f0d87e002066c90e1f',
    TASKS: 'tasks',
    EVENTS: 'events',
    SHOP_ITEMS: 'shop_items',
    EXPENSES: 'expenses',
    JOIN_REQUESTS: 'join_requests',
}

export type Task = {
    task_text?: string;
    description?: string;
    due_date?: string;
    status?: "todo" | "in-progress" | "done";
    completed?: boolean;
    assigned_to?: string;
    userId?: string;
    team_id?: string;
}

export type CalEvent = {
    title?: string;
    date?: string;
    time?: string;
    description?: string;
    assigned_to?: string; // comma-separated userIds, empty = everyone
    userId?: string;
    team_id?: string;
}

export type ShopItem = {
    name?: string;
    quantity?: string;
    category?: string;
    checked?: boolean;
    userId?: string;
    team_id?: string;
}

export type Expense = {
    title?: string;
    amount?: number;
    paid_by?: string;
    split_with?: string; // comma-separated, e.g. "Me,Alex"
    date?: string;
    userId?: string;
    team_id?: string;
}
