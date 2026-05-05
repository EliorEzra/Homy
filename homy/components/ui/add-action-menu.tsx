import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { lightModePalette } from '@/theme/palette';
import { CheckSquare, Calendar, TrendingUp, BarChart3, AlertCircle, ShoppingCart } from 'lucide-react-native';

interface AddActionMenuProps {
  visible: boolean;
  onDismiss: () => void;
  onAddTask?: () => void;
  onAddEvent?: () => void;
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onAddBill?: () => void;
  onAddShoppingList?: () => void;
}

const menuItems = [
  { id: 'task', label: 'Add Task', icon: CheckSquare },
  { id: 'event', label: 'Add Event', icon: Calendar },
  { id: 'expense', label: 'Add Expense', icon: TrendingUp },
  { id: 'income', label: 'Add Income', icon: BarChart3 },
  { id: 'bill', label: 'Add Upcoming Bill', icon: AlertCircle },
  { id: 'shopping', label: 'Add Shopping List', icon: ShoppingCart },
];

export function AddActionMenu({
  visible,
  onDismiss,
  onAddTask,
  onAddEvent,
  onAddExpense,
  onAddIncome,
  onAddBill,
  onAddShoppingList,
}: AddActionMenuProps) {
  if (!visible) return null;

  const handlers: Record<string, () => void> = {
    task: onAddTask || (() => {}),
    event: onAddEvent || (() => {}),
    expense: onAddExpense || (() => {}),
    income: onAddIncome || (() => {}),
    bill: onAddBill || (() => {}),
    shopping: onAddShoppingList || (() => {}),
  };

  return (
    <TouchableOpacity
      style={styles.overlay}
      onPress={onDismiss}
      activeOpacity={1}
    >
      <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
        <ThemedView style={[styles.menu, shadows.lg]}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  handlers[item.id]?.();
                  onDismiss();
                }}
              >
                <Icon size={24} color={lightModePalette.primary.DEFAULT} />
                <ThemedText style={styles.menuItemText}>
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  menu: {
    backgroundColor: lightModePalette.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    minWidth: 280,
  },
  menuItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  menuItemText: {
    ...typography.body.md,
    color: lightModePalette.onSurface,
    marginLeft: spacing.lg,
  },
});
