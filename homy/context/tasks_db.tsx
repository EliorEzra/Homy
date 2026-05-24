import React, { createContext, useContext, useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { Models, ID, Permission, Role } from "react-native-appwrite";
import { Task, DatabaseIDs } from "./db_models";
import { useAuth } from "./auth";
import { useHouse } from "./house";

interface ProviderProps {
  children: React.ReactNode;
}

interface getTasksResponse {
  data: Models.RowList<Models.Row> | undefined;
  error: Error | undefined;
}

interface addTaskResponse {
  error: any | undefined;
  data: {} | undefined;
}

interface updateTaskResponse {
  error: any | undefined;
  data: {} | undefined;
}

interface deleteTaskResponse {
  error: any | undefined;
  data: {} | undefined;
}

interface TasksDBContextValue {
  getTasks: () => Promise<getTasksResponse>;
  addTask: (data: Task, permissions: string[]) => Promise<addTaskResponse>;
  updateTask: (taskId: string, data: Task, permissions?: string[]) => Promise<updateTaskResponse>;
  deleteTask: (taskId: string) => Promise<deleteTaskResponse>;
  tasks: Models.Row[] | null;
}

const TasksContext = createContext<TasksDBContextValue | undefined>(undefined);

export function TasksProvider(props: ProviderProps) {
  const [tasks, setTasks] = useState<Models.Row[] | null>([]);
  const { user } = useAuth();
  const { houseTeamId } = useHouse();

  async function getTasks(): Promise<getTasksResponse> {
    try {
      const response = await databases.listRows({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.TASKS,
      });
      const filtered = houseTeamId
        ? response.rows.filter((r: Models.Row) => r.team_id === houseTeamId)
        : [];
      setTasks(filtered);
      return { data: response, error: undefined };
    } catch (error) {
      return { data: undefined, error: error as Error };
    }
  }

  async function addTask(data: Task, permissions: string[]): Promise<addTaskResponse> {
    if (!data.task_text) throw new Error("Task text cannot be empty");
    try {
      if (user === null) throw new Error("User must be logged in before creating tasks");
      const rowId = ID.unique();
      await databases.createRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.TASKS,
        rowId,
        data: {
          task_text: data.task_text,
          description: data.description ?? "",
          due_date: data.due_date ?? "",
          status: data.status ?? "todo",
          completed: data.completed ?? false,
          assigned_to: data.assigned_to ?? "",
          userId: user.$id,
          team_id: houseTeamId ?? "",
        },
        permissions: [
          Permission.read(Role.user(user.$id)),
          Permission.write(Role.user(user.$id)),
          // All house members can read; only the creator can write
          ...(houseTeamId ? [Permission.read(Role.team(houseTeamId))] : []),
          ...permissions,
        ],
      });
      setTasks(prev => [...(prev ?? []), { $id: rowId, task_text: data.task_text, description: data.description ?? "", due_date: data.due_date ?? "", status: data.status ?? "todo", completed: data.completed ?? false, assigned_to: data.assigned_to ?? "", userId: user.$id, team_id: houseTeamId ?? "" } as Models.Row]);
      return { data: {}, error: undefined };
    } catch (error) {
      return { data: undefined, error: error as Error };
    }
  }

  async function updateTask(taskId: string, data: Task, permissions?: string[]): Promise<updateTaskResponse> {
    try {
      await databases.updateRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.TASKS,
        rowId: taskId,
        data: data,
        permissions: permissions,
      });
      setTasks(prev => (prev ?? []).map(t => t.$id === taskId ? { ...t, ...data } : t));
      return { data: {}, error: undefined };
    } catch (error) {
      return { data: undefined, error: error as Error };
    }
  }

  async function deleteTask(taskId: string): Promise<deleteTaskResponse> {
    try {
      await databases.deleteRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.TASKS,
        rowId: taskId,
      });
      setTasks(prev => (prev ?? []).filter(t => t.$id !== taskId));
      return { data: {}, error: undefined };
    } catch (error) {
      return { data: undefined, error: error as Error };
    }
  }

  useEffect(() => {
    if (!houseTeamId) {
      setTasks([]);
      return;
    }
    (async () => {
      try {
        await getTasks();
      } catch (error) {
        console.log("error", error);
        setTasks(null);
      }
    })();
  }, [houseTeamId]);

  return (
    <TasksContext.Provider value={{ getTasks, addTask, updateTask, deleteTask, tasks }}>
      {props.children}
    </TasksContext.Provider>
  );
}

export const useTasks = () => {
  const tasksContext = useContext(TasksContext);
  if (!tasksContext) throw new Error("useTasks must be used within a TasksProvider");
  return tasksContext;
};
