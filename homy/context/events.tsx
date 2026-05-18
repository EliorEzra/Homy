import React, { createContext, useContext, useState } from "react";

export type CalEvent = { id: string; title: string; date: string; time: string; description: string };

interface EventsContextValue {
  events: CalEvent[];
  addEvent: (event: CalEvent) => void;
  deleteEvent: (id: string) => void;
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalEvent[]>([]);

  const addEvent = (event: CalEvent) => setEvents(prev => [...prev, event]);
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  return (
    <EventsContext.Provider value={{ events, addEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
};
