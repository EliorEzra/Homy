import React, { createContext, useContext, useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { Models, ID, Permission, Role } from "react-native-appwrite";
import { Task, DatabaseIDs } from "./db_models";
import { useAuth } from "./auth";

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

  async function getTasks(): Promise<getTasksResponse> {
    try {
      const response = await databases.listRows({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.TASKS,
      });
      setTasks(response.rows);
      return { data: response, error: undefined };
    } catch (error) {
      return { data: undefined, error: error as Error };
    }
  }

  async function addTask(data: Task, permissions: string[]): Promise<addTaskResponse> {
    if (!data.task_text) throw new Error("Task text cannot be empty");
    try {
      if (user === null) throw new Error("User must be logged in before creating tasks");
      await databases.createRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.TASKS,
        rowId: ID.unique(),
        data: {
          task_text: data.task_text,
          description: data.description ?? "",
          due_date: data.due_date ?? "",
          status: data.status ?? "todo",
          completed: data.completed ?? false,
          userId: user.$id,
        },
        permissions: [
          Permission.read(Role.user(user.$id)),
          Permission.write(Role.user(user.$id)),
          ...permissions,
        ],
      });
      await getTasks();
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
      await getTasks();
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
      await getTasks();
      return { data: {}, error: undefined };
    } catch (error) {
      return { data: undefined, error: error as Error };
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await getTasks();
      } catch (error) {
        console.log("error", error);
        setTasks(null);
      }
    })();
  }, []);

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
