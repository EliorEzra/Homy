import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedCard } from '@/components/themed-card';
import { ThemedEmptyState } from '@/components/themed-empty-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/theme';
import { Plus, Trash2, CheckCircle, Circle, ShoppingCart, X } from 'lucide-react-native';

type GroceryItem = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
};

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Drinks', 'Other'];

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default function ShopScreen() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Other');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'done'>('all');

  const primaryColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const mutedColor = useThemeColor({}, 'tabIconDefault');

  const addItem = () => {
    if (!name.trim()) return;
    setItems(prev => [
      {
        id: generateId(),
        name: name.trim(),
        quantity: quantity.trim() || '1',
        category: selectedCategory,
        checked: false,
      },
      ...prev,
    ]);
    setName('');
    setQuantity('');
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearChecked = () => {
    setItems(prev => prev.filter(item => !item.checked));
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === 'pending') return !item.checked;
    if (activeFilter === 'done') return item.checked;
    return true;
  });

  const checkedCount = items.filter(i => i.checked).length;

  return (
    <ThemedView style={styles.container}>
      {/* Add item row */}
      <ThemedCard variant="elevated" style={styles.addCard}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.nameInput, { color: textColor, borderColor, backgroundColor: bgColor }]}
            placeholder="Add item..."
            placeholderTextColor={mutedColor}
            value={name}
            onChangeText={setName}
            onSubmitEditing={addItem}
            returnKeyType="done"
          />
          <TextInput
            style={[styles.qtyInput, { color: textColor, borderColor, backgroundColor: bgColor }]}
            placeholder="Qty"
            placeholderTextColor={mutedColor}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          <Pressable onPress={addItem} style={[styles.addBtn, { backgroundColor: primaryColor }]}>
            <Plus size={20} color="white" strokeWidth={3} />
          </Pressable>
        </View>

        {/* Category picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                { borderColor },
                selectedCategory === cat && { backgroundColor: primaryColor, borderColor: primaryColor },
              ]}
            >
              <ThemedText
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </ThemedCard>

      {/* Filter + clear */}
      <View style={styles.toolbar}>
        <View style={styles.filters}>
          {(['all', 'pending', 'done'] as const).map(f => (
            <Pressable
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterChip,
                { borderColor },
                activeFilter === f && { backgroundColor: primaryColor, borderColor: primaryColor },
              ]}
            >
              <ThemedText style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Done'}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {checkedCount > 0 && (
          <Pressable onPress={clearChecked} style={styles.clearBtn}>
            <X size={14} color={mutedColor} />
            <ThemedText style={[styles.clearText, { color: mutedColor }]}>Clear done</ThemedText>
          </Pressable>
        )}
      </View>

      {/* List */}
      {filteredItems.length === 0 ? (
        <ThemedEmptyState
          title={activeFilter === 'done' ? 'Nothing checked off' : 'Your list is empty'}
          description={activeFilter === 'all' ? 'Add items above to get started' : ''}
          icon={<ShoppingCart size={52} color={primaryColor} opacity={0.4} />}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ThemedCard variant="outlined" style={[styles.itemCard, item.checked && styles.checkedCard]}>
              <Pressable style={styles.itemRow} onPress={() => toggleItem(item.id)}>
                {item.checked
                  ? <CheckCircle size={22} color={primaryColor} strokeWidth={2.5} />
                  : <Circle size={22} color={mutedColor} strokeWidth={2} />
                }
                <View style={styles.itemInfo}>
                  <ThemedText style={[styles.itemName, item.checked && styles.strikethrough]}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={[styles.itemMeta, { color: mutedColor }]}>
                    {item.quantity} · {item.category}
                  </ThemedText>
                </View>
                <Pressable onPress={() => deleteItem(item.id)} hitSlop={8}>
                  <Trash2 size={16} color="#ff3748" />
                </Pressable>
              </Pressable>
            </ThemedCard>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.md,
  },
  addCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  nameInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    fontSize: 15,
  },
  qtyInput: {
    width: 52,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    fontSize: 15,
    textAlign: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    marginTop: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    fontSize: 12,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  itemCard: {
    marginVertical: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  checkedCard: {
    opacity: 0.6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  itemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
