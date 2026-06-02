import { useMemo, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { Home, ListTodo, Calendar, ShoppingCart, DollarSign } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppHeader } from '@/components/app-header';
import { TasksProvider } from '@/context/tasks_db';
import { EventsProvider } from '@/context/events_db';
import { ShopProvider } from '@/context/shop_db';
import { ExpensesProvider } from '@/context/expenses_db';

function TabIcon({ Icon, color, size }: { Icon: React.ElementType; color: string; size: number }) {
  return <Icon size={size} color={color} />;
}

export default function TabLayout() {
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const defaultColor = useThemeColor({}, 'tabIconDefault');
  const bgColor = useThemeColor({}, 'background');

  const renderHeader = useCallback(() => <AppHeader />, []);

  const tabBarStyle = useMemo(() => ({
    backgroundColor: bgColor,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)' as const,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  }), [bgColor]);

  const tabBarItemStyle = useMemo(() => ({
    flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const,
  }), []);

  const tabBarLabelStyle = useMemo(() => ({
    fontSize: 10, fontWeight: '600' as const, marginTop: 2,
  }), []);

  return (
    <TasksProvider>
      <EventsProvider>
        <ShopProvider>
          <ExpensesProvider>
            <Tabs screenOptions={{ tabBarActiveTintColor: primaryColor, tabBarInactiveTintColor: defaultColor, header: renderHeader, tabBarStyle, tabBarItemStyle, tabBarLabelStyle }}>
              <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <TabIcon Icon={Home} color={color} size={size} /> }} />
              <Tabs.Screen name="tasks" options={{ title: 'Tasks', tabBarIcon: ({ color, size }) => <TabIcon Icon={ListTodo} color={color} size={size} /> }} />
              <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: ({ color, size }) => <TabIcon Icon={ShoppingCart} color={color} size={size} /> }} />
              <Tabs.Screen name="finances" options={{ title: 'Finances', tabBarIcon: ({ color, size }) => <TabIcon Icon={DollarSign} color={color} size={size} /> }} />
              <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: ({ color, size }) => <TabIcon Icon={Calendar} color={color} size={size} /> }} />
              <Tabs.Screen name="settings" options={{ href: null }} />
            </Tabs>
          </ExpensesProvider>
        </ShopProvider>
      </EventsProvider>
    </TasksProvider>
  );
}
