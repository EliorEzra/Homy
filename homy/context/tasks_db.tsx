import React, { createContext, useContext, useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Models, ID, Permission, TablesDB, Role } from "react-native-appwrite";
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

const TasksContext = createContext<TasksDBContextValue | undefined>(
  undefined
);


export function TasksProvider(props: ProviderProps) {
  const [tasks, setTasks] = useState<Models.Row[] | null>([]);

  async function getTasks(): Promise<getTasksResponse> {
    try {
      const response = await databases.listRows({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.TASKS
      })

      setTasks(response.rows)

      return {
        data: response,
        error: undefined
      }
    } catch (error) {
      return {
        data: undefined,
        error: error as Error
      }
    }
  }

  async function addTask(data: Task, permissions: string[]): Promise<addTaskResponse> {
    const {user} = useAuth();
    if (typeof data.task_text === undefined) {
      throw new Error("Task text cannot be empty");
    }
    try {
      if (user === null) {
        throw new Error("User must be logged in before creating tasks")
      }
      const response = await databases.createRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.TASKS,
        rowId: ID.unique(),
        data: {
          task_text: data.task_text,
          completed: data.completed,
          userId: user.$id
        },
        permissions: [
          Permission.read(Role.user(user.$id as string)),
          Permission.write(Role.user(user.$id as string)),
          ...permissions]
      })

      return {
        data: {},
        error: undefined
      }
    } catch (error) {
      return {
        data: undefined,
        error: error as Error
      }
    }
  }

  async function updateTask(taskId: string, data: Task, permissions?: string[]): Promise<updateTaskResponse> {
    try {
      const response = await databases.updateRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.TASKS,
        rowId: taskId,
        data: data,
        permissions: permissions
      })

      return {
        data: {},
        error: undefined
      }
    } catch (error) {
      return {
        data: undefined,
        error: error as Error
      }
    }
  }

  async function deleteTask(taskId: string): Promise<deleteTaskResponse> {
    try {
      const response = await databases.deleteRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.TASKS,
        rowId: taskId
      })
      return {
        data: {},
        error: undefined
      }
    } catch (error) {
      return {
        data: undefined,
        error: error as Error
      }
    }
  }

  useEffect(() => {
      (async () => {
        try {
          const response = await getTasks();
        } catch (error) {
          console.log("error", error);
          setTasks(null);
        }
        console.log("initialize ", tasks);
      })();
    }, []);

  return (
    <TasksContext.Provider
      value={{
        getTasks: getTasks,
        addTask: addTask,
        updateTask: updateTask,
        deleteTask: deleteTask,
        tasks,
      }}
    >
      {props.children}
    </TasksContext.Provider>
  );
}

export const useTasks = () => {
  const tasksContext = useContext(TasksContext);

  if (!tasksContext) {
    throw new Error("useTasks must be used within an TasksContextProvider");
  }

  return tasksContext;
};