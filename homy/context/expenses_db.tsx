import React, { createContext, useContext, useEffect, useState } from "react";
import { databases, client } from "@/lib/appwrite";
import { Models, ID, Permission, Role, Channel } from "react-native-appwrite";
import { Expense, DatabaseIDs } from "./db_models";
import { useAuth } from "./auth";
import { useHouse } from "./house";

interface ProviderProps {
  children: React.ReactNode;
}

interface ExpensesDBContextValue {
  expenses: Models.Row[] | null;
  addExpense: (data: Expense) => Promise<{ data?: {}; error?: Error }>;
  deleteExpense: (expenseId: string) => Promise<{ data?: {}; error?: Error }>;
}

const ExpensesContext = createContext<ExpensesDBContextValue | undefined>(undefined);

export function ExpensesProvider(props: ProviderProps) {
  const [expenses, setExpenses] = useState<Models.Row[] | null>([]);
  const { user } = useAuth();
  const { houseTeamId } = useHouse();

  async function getExpenses() {
    try {
      const response = await databases.listRows({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.EXPENSES,
      });
      const filtered = houseTeamId
        ? response.rows.filter((r: Models.Row) => r.team_id === houseTeamId)
        : [];
      setExpenses(filtered);
    } catch (error) {
      console.log("error fetching expenses", error);
      setExpenses(null);
    }
  }

  async function addExpense(data: Expense): Promise<{ data?: {}; error?: Error }> {
    if (!data.title) throw new Error("Expense title cannot be empty");
    try {
      if (!user) throw new Error("User must be logged in");
      const rowId = ID.unique();
      await databases.createRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.EXPENSES,
        rowId,
        data: {
          title: data.title,
          amount: data.amount ?? 0,
          paid_by: data.paid_by ?? "",
          split_with: data.split_with ?? "",
          date: data.date ?? new Date().toLocaleDateString(),
          userId: user.$id,
          team_id: houseTeamId ?? "",
        },
        permissions: [
          Permission.read(Role.user(user.$id)),
          Permission.write(Role.user(user.$id)),
          // All house members can read; only the creator can write
          ...(houseTeamId ? [Permission.read(Role.team(houseTeamId))] : []),
        ],
      });
      setExpenses(prev => (prev ?? []).some(e => e.$id === rowId) ? (prev ?? []) : [
        { $id: rowId, title: data.title, amount: data.amount ?? 0, paid_by: data.paid_by ?? "", split_with: data.split_with ?? "", date: data.date ?? new Date().toLocaleDateString(), userId: user.$id, team_id: houseTeamId ?? "" } as Models.Row,
        ...(prev ?? []),
      ]);
      return { data: {} };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function deleteExpense(expenseId: string): Promise<{ data?: {}; error?: Error }> {
    try {
      await databases.deleteRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.EXPENSES,
        rowId: expenseId,
      });
      setExpenses(prev => (prev ?? []).filter(e => e.$id !== expenseId));
      return { data: {} };
    } catch (error) {
      return { error: error as Error };
    }
  }

  useEffect(() => {
    if (!houseTeamId) {
      setExpenses([]);
      return;
    }
    getExpenses();
  }, [houseTeamId]);

  useEffect(() => {
    if (!houseTeamId) return;
    const base = Channel.tablesdb(DatabaseIDs.DATABASE).table(DatabaseIDs.EXPENSES).toString();
    const unsubscribe = client.subscribe([base, `${base}.rows`], (response) => {
      const events = response.events as string[];
      const payload = response.payload as Models.Row;
      if (!payload || payload.team_id !== houseTeamId) return;
      if (events.some(e => e.endsWith('.create'))) {
        setExpenses(prev => prev?.some(e => e.$id === payload.$id) ? prev : [payload, ...(prev ?? [])]);
      } else if (events.some(e => e.endsWith('.update'))) {
        setExpenses(prev => (prev ?? []).map(e => e.$id === payload.$id ? { ...e, ...payload } : e));
      } else if (events.some(e => e.endsWith('.delete'))) {
        setExpenses(prev => (prev ?? []).filter(e => e.$id !== payload.$id));
      }
    });
    return () => unsubscribe();
  }, [houseTeamId]);

  return (
    <ExpensesContext.Provider value={{ expenses, addExpense, deleteExpense }}>
      {props.children}
    </ExpensesContext.Provider>
  );
}

export const useExpenses = () => {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within an ExpensesProvider");
  return ctx;
};
