import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '../../theme';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { useFavorites, useWatchlists } from '../../hooks/useWatchlist';
import { useAppSelector } from '../../hooks/useStore';
import { RootStackParamList } from '../../navigation/AppNavigator';
import StockCard from '../../components/stock/StockCard';
import CreateListModal from '../../components/common/CreateListModal';
import { Stock } from '../../types';
import { WatchList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;
type TabKey = 'favorites' | 'lists';

const WatchlistScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<TabKey>('favorites');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { lists, createList, deleteList, renameList, removeSymbolFromList } = useWatchlists();

  const allStockItems = useAppSelector(s => s.stocks.items);

  const favoriteStocks = useMemo(
    () =>
      favorites
        .map(sym => Object.values(allStockItems).find(s => s.symbol === sym))
        .filter(Boolean) as Stock[],
    [favorites, allStockItems],
  );

  const selectedList = useMemo(
    () => lists.find(l => l.id === selectedListId),
    [lists, selectedListId],
  );

  const selectedListStocks = useMemo(() => {
    if (!selectedList) return [];
    return selectedList.symbols
      .map(sym => Object.values(allStockItems).find(s => s.symbol === sym))
      .filter(Boolean) as Stock[];
  }, [selectedList, allStockItems]);

  const navigateToStock = useCallback(
    (stock: Stock) =>
      navigation.navigate('StockDetail', { stockId: stock.id, symbol: stock.symbol }),
    [navigation],
  );

  const handleDeleteList = useCallback(
    (list: WatchList) => {
      Alert.alert(
        'Listeyi Sil',
        `"${list.name}" listesi silinecek. Onaylıyor musunuz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: () => {
              deleteList(list.id);
              if (selectedListId === list.id) setSelectedListId(null);
            },
          },
        ],
      );
    },
    [deleteList, selectedListId],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(r => setTimeout(() => r(), 500));
    setRefreshing(false);
  }, []);

  const renderFavoriteItem = useCallback(
    ({ item }: { item: Stock }) => (
      <StockCard
        stock={item}
        onPress={() => navigateToStock(item)}
      />
    ),
    [navigateToStock],
  );

  const renderListStockItem = useCallback(
    ({ item }: { item: Stock }) => (
      <View style={styles.swipeRow}>
        <StockCard stock={item} onPress={() => navigateToStock(item)} />
        <TouchableOpacity
          style={[styles.removeBtn, { backgroundColor: colors.danger + '18' }]}
          onPress={() => selectedList && removeSymbolFromList(selectedList.id, item.symbol)}
        >
          <Text style={[styles.removeBtnText, { color: colors.danger }]}>✕</Text>
        </TouchableOpacity>
      </View>
    ),
    [navigateToStock, selectedList, removeSymbolFromList, colors],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Takip Listesi</Text>
        {activeTab === 'lists' && (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addBtnText}>+ Liste</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {(['favorites', 'lists'] as TabKey[]).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => { setActiveTab(tab); setSelectedListId(null); }}
            style={[
              styles.tab,
              { borderBottomColor: activeTab === tab ? colors.primary : 'transparent' },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? colors.primary : colors.textSecondary },
              ]}
            >
              {tab === 'favorites' ? `⭐ Favoriler (${favorites.length})` : `📋 Listelerim (${lists.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <FlatList
          data={favoriteStocks}
          renderItem={renderFavoriteItem}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40 }}>⭐</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Favori Yok</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Hisse detay sayfasından favorilere ekleyebilirsiniz.
              </Text>
            </View>
          }
          contentContainerStyle={favoriteStocks.length === 0 ? { flex: 1 } : { paddingBottom: Spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
        />
      )}

      {/* Lists Tab */}
      {activeTab === 'lists' && !selectedListId && (
        <ScrollView
          contentContainerStyle={[styles.listsContainer, lists.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
        >
          {lists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40 }}>📋</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Liste Yok</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                "+ Liste" butonuyla yeni bir takip listesi oluşturun.
              </Text>
            </View>
          ) : (
            lists.map(list => (
              <TouchableOpacity
                key={list.id}
                style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setSelectedListId(list.id)}
                activeOpacity={0.8}
              >
                <View style={styles.listCardLeft}>
                  <Text style={[styles.listCardName, { color: colors.text }]}>{list.name}</Text>
                  <Text style={[styles.listCardCount, { color: colors.textMuted }]}>
                    {list.symbols.length} hisse
                  </Text>
                </View>
                <View style={styles.listCardRight}>
                  <TouchableOpacity
                    onPress={() => handleDeleteList(list)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.deleteIcon, { color: colors.danger }]}>🗑</Text>
                  </TouchableOpacity>
                  <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* List Detail */}
      {activeTab === 'lists' && selectedListId && selectedList && (
        <View style={{ flex: 1 }}>
          <View style={[styles.listDetailHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setSelectedListId(null)}>
              <Text style={[styles.backBtn, { color: colors.primary }]}>← Listeler</Text>
            </TouchableOpacity>
            <Text style={[styles.listDetailTitle, { color: colors.text }]}>{selectedList.name}</Text>
            <View style={{ width: 80 }} />
          </View>
          <FlatList
            data={selectedListStocks}
            renderItem={renderListStockItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Bu listede henüz hisse yok.
                </Text>
              </View>
            }
            contentContainerStyle={selectedListStocks.length === 0 ? { flex: 1 } : { paddingBottom: Spacing['3xl'] }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Create List Modal */}
      <CreateListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={createList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl + 8,
    paddingBottom: Spacing.md,
  },
  headerTitle: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold },
  addBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.base,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  tabText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  emptyText: { fontSize: FontSizes.sm, textAlign: 'center' },
  listsContainer: { padding: Spacing.base, gap: Spacing.md },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderRadius: 14,
    borderWidth: 1,
  },
  listCardLeft: { flex: 1 },
  listCardName: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold },
  listCardCount: { fontSize: FontSizes.sm, marginTop: 2 },
  listCardRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  deleteIcon: { fontSize: 16 },
  chevron: { fontSize: 22, fontWeight: FontWeights.bold },
  listDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  listDetailTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.bold },
  swipeRow: { flexDirection: 'row', alignItems: 'center' },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  removeBtnText: { fontSize: 14, fontWeight: FontWeights.bold },
});

export default WatchlistScreen;
