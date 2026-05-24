import React, { createContext, useContext, useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { Models, ID, Permission, Role } from "react-native-appwrite";
import { CalEvent, DatabaseIDs } from "./db_models";
import { useAuth } from "./auth";
import { useHouse } from "./house";

interface ProviderProps {
  children: React.ReactNode;
}

interface addEventResponse {
  error: any | undefined;
  data: {} | undefined;
}

interface deleteEventResponse {
  error: any | undefined;
  data: {} | undefined;
}

interface EventsDBContextValue {
  addEvent: (data: CalEvent, permissions: string[]) => Promise<addEventResponse>;
  deleteEvent: (eventId: string) => Promise<deleteEventResponse>;
  events: Models.Row[] | null;
}

const EventsContext = createContext<EventsDBContextValue | undefined>(undefined);

export function EventsProvider(props: ProviderProps) {
  const [events, setEvents] = useState<Models.Row[] | null>([]);
  const { user } = useAuth();
  const { houseTeamId } = useHouse();

  async function getEvents() {
    try {
      const response = await databases.listRows({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.EVENTS,
      });
      const filtered = houseTeamId
        ? response.rows.filter((r: Models.Row) => r.team_id === houseTeamId)
        : [];
      setEvents(filtered);
    } catch (error) {
      console.log("error fetching events", error);
      setEvents(null);
    }
  }

  async function addEvent(data: CalEvent, permissions: string[]): Promise<addEventResponse> {
    if (!data.title) throw new Error("Event title cannot be empty");
    try {
      if (user === null) throw new Error("User must be logged in before creating events");
      const rowId = ID.unique();
      await databases.createRow({
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
      setEvents(prev => [...(prev ?? []), { $id: rowId, title: data.title, date: data.date ?? "", time: data.time ?? "", description: data.description ?? "", assigned_to: data.assigned_to ?? "", userId: user.$id, team_id: houseTeamId ?? "" } as Models.Row]);
      return { data: {}, error: undefined };
    } catch (error) {
      return { data: undefined, error: error as Error };
    }
  }

  async function deleteEvent(eventId: string): Promise<deleteEventResponse> {
    try {
      await databases.deleteRow({
        databaseId: DatabaseIDs.DATABASE,
        tableId: DatabaseIDs.EVENTS,
        rowId: eventId,
      });
      setEvents(prev => (prev ?? []).filter(e => e.$id !== eventId));
      return { data: {}, error: undefined };
    } catch (error) {
      return { data: undefined, error: error as Error };
    }
  }

  useEffect(() => {
    if (!houseTeamId) {
      setEvents([]);
      return;
    }
    (async () => {
      await getEvents();
    })();
  }, [houseTeamId]);

  return (
    <EventsContext.Provider value={{ addEvent, deleteEvent, events }}>
      {props.children}
    </EventsContext.Provider>
  );
}

export const useEvents = () => {
  const eventsContext = useContext(EventsContext);
  if (!eventsContext) throw new Error("useEvents must be used within an EventsProvider");
  return eventsContext;
};
