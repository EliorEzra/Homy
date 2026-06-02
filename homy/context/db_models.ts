// ─── Role permission types ────────────────────────────────────────────────────
export type TabPermission = {
  canCreate: boolean;
  canEdit: boolean;    // hierarchy-enforced: only applies to same/lower rank creators
  canDelete: boolean;  // hierarchy-enforced: only applies to same/lower rank creators
};

export type RolePermissions = {
  tasks: TabPermission;
  shop: TabPermission;
  finances: TabPermission;
  calendar: TabPermission;
};

export const DEFAULT_TAB_PERMISSION: TabPermission = { canCreate: true, canEdit: true, canDelete: true };

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  tasks: DEFAULT_TAB_PERMISSION,
  shop: DEFAULT_TAB_PERMISSION,
  finances: DEFAULT_TAB_PERMISSION,
  calendar: DEFAULT_TAB_PERMISSION,
};

// ─── Database IDs ─────────────────────────────────────────────────────────────
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
