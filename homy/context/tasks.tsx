import React, { createContext, useContext, useState } from "react";

export type Task = {
  id: string; title: string; description: string; dueDate: string;
  status: "todo" | "in-progress" | "done"; completed: boolean;
};

interface TasksContextValue {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Task) => setTasks(prev => [task, ...prev]);

  const updateTask = (id: string, data: Partial<Task>) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));

  const deleteTask = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  const toggleComplete = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  return (
    <TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleComplete }}>
      {children}
    </TasksContext.Provider>
  );
}

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
};
