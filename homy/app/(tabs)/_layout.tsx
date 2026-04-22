import { Tabs } from 'expo-router'
import { HomeIcon, TasksIcon } from '@/components/ui/icons'


export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({}) => (HomeIcon)
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({}) => (TasksIcon),
        }}
      />
    </Tabs>
  );
}
