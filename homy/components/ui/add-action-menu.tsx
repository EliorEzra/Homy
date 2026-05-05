import { TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from './card';
import { Body } from './typography';
import { spacing } from '@/theme/spacing';
import { lightModePalette } from '@/theme/palette';
import { LucideIcon } from 'lucide-react-native';

interface ActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onPress?: () => void;
}

interface ActionMenuProps {
  visible: boolean;
  items: ActionItem[];
  onDismiss: () => void;
}

export function ActionMenu({ visible, items, onDismiss }: ActionMenuProps) {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.overlay}
      onPress={onDismiss}
      activeOpacity={1}
    >
      <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
        <Card style={styles.menu} padding="sm" variant="elevated">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index < items.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => {
                  item.onPress?.();
                  onDismiss();
                }}
              >
                <Icon
                  size={24}
                  color={lightModePalette.primary.DEFAULT}
                  strokeWidth={2}
                />
                <Body color={lightModePalette.onSurface} style={styles.menuItemText}>
                  {item.label}
                </Body>
              </TouchableOpacity>
            );
          })}
        </Card>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// Keep old export for backwards compatibility
export function AddActionMenu({
  visible,
  onDismiss,
  onAddTask,
  onAddEvent,
  onAddExpense,
  onAddIncome,
  onAddBill,
  onAddShoppingList,
}: {
  visible: boolean;
  onDismiss: () => void;
  onAddTask?: () => void;
  onAddEvent?: () => void;
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onAddBill?: () => void;
  onAddShoppingList?: () => void;
}) {
  const { CheckSquare, Calendar, TrendingUp, BarChart3, AlertCircle, ShoppingCart } = require('lucide-react-native');

  const items: ActionItem[] = [
    { id: 'task', label: 'Add Task', icon: CheckSquare, onPress: onAddTask },
    { id: 'event', label: 'Add Event', icon: Calendar, onPress: onAddEvent },
    { id: 'expense', label: 'Add Expense', icon: TrendingUp, onPress: onAddExpense },
    { id: 'income', label: 'Add Income', icon: BarChart3, onPress: onAddIncome },
    { id: 'bill', label: 'Add Upcoming Bill', icon: AlertCircle, onPress: onAddBill },
    { id: 'shopping', label: 'Add Shopping List', icon: ShoppingCart, onPress: onAddShoppingList },
  ];

  return <ActionMenu visible={visible} items={items} onDismiss={onDismiss} />;
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
    minWidth: 280,
  },
  menuItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: lightModePalette.surfaceContainer,
  },
  menuItemText: {
    marginLeft: spacing.lg,
  },
});
