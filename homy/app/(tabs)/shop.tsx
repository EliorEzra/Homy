import { StyleSheet, View, FlatList, Pressable, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FadeScreen } from '@/components/fade-screen';
import { ThemedCard } from '@/components/themed-card';
import { ThemedBadge } from '@/components/themed-badge';
import { ThemedEmptyState } from '@/components/themed-empty-state';
import { spacing } from '@/theme/theme';
import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, ShoppingCart, X } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useShop } from '@/context/shop_db';
import { usePermissions } from '@/hooks/use-permissions';
import { Models } from 'react-native-appwrite';

type Category = 'Produce' | 'Dairy' | 'Meat' | 'Bakery' | 'Frozen' | 'Drinks' | 'Other';
const CATEGORIES: Category[] = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Drinks', 'Other'];

const CATEGORY_COLORS: Record<Category, string> = {
  Produce: '#1fc16b', Dairy: '#106d8f', Meat: '#e03040',
  Bakery: '#c47c2a', Frozen: '#0ea5e9', Drinks: '#7c6bbf', Other: '#6b7280',
};

export default function ShopScreen() {
  const { shopItems, addShopItem, updateShopItem, deleteShopItem, clearCompleted } = useShop();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Other');
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const cardBg = useThemeColor({}, 'cardBackground');
  const inputBg = useThemeColor({}, 'inputBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const textColor = useThemeColor({}, 'text');

  const items = shopItems ?? [];
  const filtered = items.filter(i =>
    filter === 'pending' ? !i.checked : filter === 'done' ? i.checked : true
  );

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const { error } = await addShopItem({ name: newName.trim(), quantity: newQty.trim() || '1', category: newCategory, checked: false });
    if (error) { Alert.alert("Error", error.message); return; }
    setNewName(''); setNewQty(''); setNewCategory('Other'); setAdding(false);
  };

  const handleToggle = async (item: Models.Row) => {
    const { error } = await updateShopItem(item.$id, { checked: !item.checked });
    if (error) Alert.alert("Error", error.message);
  };

  const handleDelete = async (itemId: string) => {
    const { error } = await deleteShopItem(itemId);
    if (error) Alert.alert("Error", error.message);
  };

  const handleClearCompleted = async () => {
    await clearCompleted();
  };

  return (
    <FadeScreen>
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Shopping List</ThemedText>
        {items.some(i => i.checked) && (
          <Pressable onPress={handleClearCompleted} style={[styles.clearBtn, { borderColor }]}>
            <ThemedText style={[styles.clearText, { color: mutedColor }]}>Clear done</ThemedText>
          </Pressable>
        )}
      </ThemedView>

      <View style={styles.filterRow}>
        {(['all', 'pending', 'done'] as const).map(f => (
          <Pressable key={f} onPress={() => setFilter(f)}
            style={[styles.filterChip, { borderColor, backgroundColor: cardBg }, filter === f && { backgroundColor: primaryColor, borderColor: primaryColor }]}>
            <ThemedText style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Done'}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {adding && (
        <ThemedCard variant="elevated" style={styles.addCard}>
          <View style={styles.addRow}>
            <TextInput
              style={[styles.addInput, { flex: 2, backgroundColor: inputBg, borderColor, color: textColor }]}
              placeholder="Item name"
              placeholderTextColor={mutedColor}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              style={[styles.addInput, { flex: 1, backgroundColor: inputBg, borderColor, color: textColor }]}
              placeholder="Qty"
              placeholderTextColor={mutedColor}
              value={newQty}
              onChangeText={setNewQty}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.catRow}>
            {CATEGORIES.map(c => (
              <Pressable key={c} onPress={() => setNewCategory(c)}
                style={[styles.catChip, { borderColor: CATEGORY_COLORS[c], backgroundColor: inputBg }, newCategory === c && { backgroundColor: CATEGORY_COLORS[c] }]}>
                <ThemedText style={[styles.catText, { color: newCategory === c ? 'white' : CATEGORY_COLORS[c] }]}>{c}</ThemedText>
              </Pressable>
            ))}
          </View>
          <View style={styles.addActions}>
            <Pressable onPress={() => setAdding(false)} style={[styles.addBtn, { borderColor }]}>
              <X size={16} color={mutedColor} />
              <ThemedText style={[styles.addBtnText, { color: mutedColor }]}>Cancel</ThemedText>
            </Pressable>
            <Pressable onPress={handleAdd} style={[styles.addBtn, { backgroundColor: primaryColor, borderColor: primaryColor }]}>
              <Plus size={16} color="white" />
              <ThemedText style={[styles.addBtnText, { color: 'white' }]}>Add Item</ThemedText>
            </Pressable>
          </View>
        </ThemedCard>
      )}

      {filtered.length === 0 && !adding ? (
        <ThemedEmptyState
          title={filter === 'all' ? 'List is Empty' : filter === 'pending' ? 'Nothing Pending' : 'Nothing Done Yet'}
          description={filter === 'all' ? 'Tap + to add items to your list' : 'Keep up the great work!'}
          icon={<ShoppingCart size={64} color="#106d8f" opacity={0.5} />}
          action={filter === 'all' && canCreate('shop') ? (
            <Pressable onPress={() => setAdding(true)} style={[styles.emptyAdd, { backgroundColor: primaryColor }]}>
              <ThemedText style={styles.emptyAddText}>+ Add Item</ThemedText>
            </Pressable>
          ) : undefined}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.$id}
          renderItem={({ item }) => (
            <ThemedCard variant="outlined" style={[styles.itemCard, item.checked && styles.checkedCard]}>
              <Pressable
                style={styles.itemLeft}
                onPress={canEdit('shop', item.userId as string) ? () => handleToggle(item) : undefined}
              >
                {item.checked
                  ? <CheckCircle size={22} color={primaryColor} strokeWidth={2.5} />
                  : <Circle size={22} color={mutedColor} strokeWidth={2} />}
                <View style={styles.itemInfo}>
                  <ThemedText style={[styles.itemName, item.checked && styles.struckText]} numberOfLines={1}>{item.name as string}</ThemedText>
                  <View style={styles.itemMeta}>
                    <ThemedText style={[styles.itemQty, { color: mutedColor }]}>x{item.quantity as string}</ThemedText>
                    <ThemedBadge
                      label={item.category as string}
                      variant="primary"
                      size="sm"
                      style={{ backgroundColor: `${CATEGORY_COLORS[item.category as Category] ?? '#6b7280'}20` }}
                    />
                  </View>
                </View>
              </Pressable>
              {canDelete('shop', item.userId as string) && (
                <Pressable onPress={() => handleDelete(item.$id)} hitSlop={8}>
                  <Trash2 size={18} color="#ff3748" />
                </Pressable>
              )}
            </ThemedCard>
          )}
          contentContainerStyle={styles.list}
          style={styles.listFlex}
        />
      )}

      {!adding && canCreate('shop') && (
        <Pressable style={[styles.fab, { backgroundColor: primaryColor }]} onPress={() => setAdding(true)}>
          <Plus size={28} color="white" strokeWidth={3} />
        </Pressable>
      )}
    </ThemedView>
    </FadeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  clearBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 12, borderWidth: 1 },
  clearText: { fontSize: 12, fontWeight: '600' },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: 'white' },
  addCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  addInput: { borderRadius: 8, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontSize: 14 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  catChip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  catText: { fontSize: 11, fontWeight: '600' },
  addActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  addBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm, borderRadius: 8, borderWidth: 1 },
  addBtnText: { fontSize: 14, fontWeight: '600' },
  listFlex: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 80 },
  itemCard: { marginVertical: spacing.sm / 2, flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  checkedCard: { opacity: 0.55 },
  itemLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: '600', fontSize: 15, marginBottom: 2 },
  struckText: { textDecorationLine: 'line-through', opacity: 0.6 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemQty: { fontSize: 12 },
  emptyAdd: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20 },
  emptyAddText: { color: 'white', fontWeight: '700' },
  fab: { position: 'absolute', bottom: spacing.lg, right: spacing.lg, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
});
