import React, { createContext, useContext, useEffect, useState } from "react";
import { databases, client } from "@/lib/appwrite";
import { ID, Permission, Role, Channel } from "react-native-appwrite";
import { CalEvent, DatabaseIDs } from "./db_models";
import { useAuth } from "./auth";
import { useHouse } from "./house";

interface ProviderProps {
  children: React.ReactNode;
}

interface EventsDBContextValue {
  addEvent: (data: CalEvent, permissions: string[]) => Promise<{ error?: Error }>;
  updateEvent: (eventId: string, data: Partial<CalEvent>) => Promise<{ error?: Error }>;
  deleteEvent: (eventId: string) => Promise<{ error?: Error }>;
  events: CalEvent[] | null;
}

const EventsContext = createContext<EventsDBContextValue | undefined>(undefined);

export function EventsProvider(props: ProviderProps) {
  const [events, setEvents] = useState<CalEvent[] | null>([]);
  const { user } = useAuth();
  const { houseTeamId } = useHouse();

  async function addEvent(data: CalEvent, permissions: string[]): Promise<{ error?: Error }> {
    if (!data.title) throw new Error("Event title cannot be empty");
    try {
      if (user === null) throw new Error("User must be logged in before creating events");
      const rowId = ID.unique();
      await databases.createRow<CalEvent>({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.EVENTS,
        rowId,
        data: {
          title: data.title,
          date: data.date ?? "",
          time: data.time ?? "",
          description: data.description ?? "",
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
      setEvents(prev => (prev ?? []).some(e => e.$id === rowId) ? (prev ?? []) : [...(prev ?? []), 
      { 
        $id: rowId, 
        title: data.title, 
        date: data.date ?? "", 
        time: data.time ?? "", 
        description: data.description ?? "", 
        assigned_to: data.assigned_to ?? "", 
        userId: user.$id, 
        team_id: houseTeamId ?? "" 
      } as CalEvent]);
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function updateEvent(eventId: string, data: Partial<CalEvent>): Promise<{ error?: Error }> {
    try {
      await databases.updateRow<CalEvent>({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.EVENTS,
        rowId: eventId,
        data,
      });
      setEvents(prev => (prev ?? []).map(e => e.$id === eventId ? { ...e, ...data } : e));
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function deleteEvent(eventId: string): Promise<{ error?: Error }> {
    try {
      await databases.deleteRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.EVENTS,
        rowId: eventId,
      });
      setEvents(prev => (prev ?? []).filter(e => e.$id !== eventId));
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  useEffect(() => {
    if (!houseTeamId) {
      setEvents([]);
      return;
    }
    (() => {
      databases.listRows<CalEvent>({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.EVENTS,
      }).then((response) => {
        const filtered = houseTeamId
        ? response.rows.filter((r: CalEvent) => r.team_id === houseTeamId)
        : [];
        setEvents(filtered);
      }).catch((error) => {
        console.log("error fetching events", error);
        setEvents(null);
      })
    })();
  }, [houseTeamId]);

  useEffect(() => {
    if (!houseTeamId) return;
    const base = Channel.tablesdb(DatabaseIDs.DATABASE).table(DatabaseIDs.EVENTS).toString();
    const unsubscribe = client.subscribe([base, `${base}.rows`], (response) => {
      const events = response.events;
      const payload = response.payload as CalEvent;
      if (!payload || payload.team_id !== houseTeamId) return;
      if (events.some(e => e.endsWith('.create'))) {
        setEvents(prev => prev?.some(ev => ev.$id === payload.$id) ? prev : [...(prev ?? []), payload]);
      } else if (events.some(e => e.endsWith('.update'))) {
        setEvents(prev => (prev ?? []).map(ev => ev.$id === payload.$id ? { ...ev, ...payload } : ev));
      } else if (events.some(e => e.endsWith('.delete'))) {
        setEvents(prev => (prev ?? []).filter(ev => ev.$id !== payload.$id));
      }
    });
    return () => unsubscribe();
  }, [houseTeamId]);

  return (
    <EventsContext.Provider value={{ addEvent, updateEvent, deleteEvent, events }}>
      {props.children}
    </EventsContext.Provider>
  );
}

export const useEvents = () => {
  const eventsContext = useContext(EventsContext);
  if (!eventsContext) throw new Error("useEvents must be used within an EventsProvider");
  return eventsContext;
};
