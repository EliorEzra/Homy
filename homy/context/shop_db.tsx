import React, { createContext, useContext, useEffect, useState } from "react";
import { databases, client } from "@/lib/appwrite";
import { Models, ID, Permission, Role, Channel } from "react-native-appwrite";
import { ShopItem, DatabaseIDs } from "./db_models";
import { useAuth } from "./auth";
import { useHouse } from "./house";

interface ProviderProps {
  children: React.ReactNode;
}

interface ShopDBContextValue {
  shopItems: Models.Row[] | null;
  addShopItem: (data: ShopItem) => Promise<{ data?: {}; error?: Error }>;
  updateShopItem: (itemId: string, data: Partial<ShopItem>) => Promise<{ data?: {}; error?: Error }>;
  deleteShopItem: (itemId: string) => Promise<{ data?: {}; error?: Error }>;
  clearCompleted: () => Promise<void>;
}

const ShopContext = createContext<ShopDBContextValue | undefined>(undefined);

export function ShopProvider(props: ProviderProps) {
  const [shopItems, setShopItems] = useState<Models.Row[] | null>([]);
  const { user } = useAuth();
  const { houseTeamId } = useHouse();

  async function getShopItems() {
    try {
      const response = await databases.listRows({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.SHOP_ITEMS,
      });
      const filtered = houseTeamId
        ? response.rows.filter((r: Models.Row) => r.team_id === houseTeamId)
        : [];
      setShopItems(filtered);
    } catch (error) {
      console.log("error fetching shop items", error);
      setShopItems(null);
    }
  }

  async function addShopItem(data: ShopItem): Promise<{ data?: {}; error?: Error }> {
    if (!data.name) throw new Error("Item name cannot be empty");
    try {
      if (!user) throw new Error("User must be logged in");
      const rowId = ID.unique();
      await databases.createRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.SHOP_ITEMS,
        rowId,
        data: {
          name: data.name,
          quantity: data.quantity ?? "1",
          category: data.category ?? "Other",
          checked: data.checked ?? false,
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
      setShopItems(prev => (prev ?? []).some(i => i.$id === rowId) ? (prev ?? []) : [
        { $id: rowId, name: data.name, quantity: data.quantity ?? "1", category: data.category ?? "Other", checked: false, userId: user.$id, team_id: houseTeamId ?? "" } as Models.Row,
        ...(prev ?? []),
      ]);
      return { data: {} };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function updateShopItem(itemId: string, data: Partial<ShopItem>): Promise<{ data?: {}; error?: Error }> {
    try {
      await databases.updateRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.SHOP_ITEMS,
        rowId: itemId,
        data,
      });
      setShopItems(prev => (prev ?? []).map(i => i.$id === itemId ? { ...i, ...data } : i));
      return { data: {} };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function deleteShopItem(itemId: string): Promise<{ data?: {}; error?: Error }> {
    try {
      await databases.deleteRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.SHOP_ITEMS,
        rowId: itemId,
      });
      setShopItems(prev => (prev ?? []).filter(i => i.$id !== itemId));
      return { data: {} };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function clearCompleted(): Promise<void> {
    const completed = (shopItems ?? []).filter(i => i.checked);
    await Promise.all(completed.map(i => deleteShopItem(i.$id)));
  }

  useEffect(() => {
    if (!houseTeamId) {
      setShopItems([]);
      return;
    }
    getShopItems();
  }, [houseTeamId]);

  useEffect(() => {
    if (!houseTeamId) return;
    const base = Channel.tablesdb(DatabaseIDs.DATABASE).table(DatabaseIDs.SHOP_ITEMS).toString();
    const unsubscribe = client.subscribe([base, `${base}.rows`], (response) => {
      const events = response.events;
      const payload = response.payload as Models.Row;
      if (!payload || payload.team_id !== houseTeamId) return;
      if (events.some(e => e.endsWith('.create'))) {
        setShopItems(prev => prev?.some(i => i.$id === payload.$id) ? prev : [payload, ...(prev ?? [])]);
      } else if (events.some(e => e.endsWith('.update'))) {
        setShopItems(prev => (prev ?? []).map(i => i.$id === payload.$id ? { ...i, ...payload } : i));
      } else if (events.some(e => e.endsWith('.delete'))) {
        setShopItems(prev => (prev ?? []).filter(i => i.$id !== payload.$id));
      }
    });
    return () => unsubscribe();
  }, [houseTeamId]);

  return (
    <ShopContext.Provider value={{ shopItems, addShopItem, updateShopItem, deleteShopItem, clearCompleted }}>
      {props.children}
    </ShopContext.Provider>
  );
}

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within a ShopProvider");
  return ctx;
};
