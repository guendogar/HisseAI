import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '../../theme';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { useStocks, useStockSearch, useMarketMovers } from '../../hooks/useStocks';
import StockCard from '../../components/stock/StockCard';
import MiniStockCard from '../../components/stock/MiniStockCard';
import SearchBar from '../../components/common/SearchBar';
import CategoryFilter, { Category } from '../../components/common/CategoryFilter';
import SortPicker, { SortKey } from '../../components/common/SortPicker';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Stock } from '../../types';
import { Market } from '../../constants';
import { formatPrice, formatPercent } from '../../utils';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

type MoverTab = 'gainers' | 'losers' | 'active';

const MOVER_TABS: { key: MoverTab; label: string; icon: string }[] = [
  { key: 'gainers', label: 'Yükselenler', icon: '📈' },
  { key: 'losers', label: 'Düşenler', icon: '📉' },
  { key: 'active', label: 'En Aktif', icon: '🔥' },
];

const HomeScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<Nav>();

  const [category, setCategory] = useState<Category>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('change');
  const [query, setQuery] = useState('');
  const [moverTab, setMoverTab] = useState<MoverTab>('gainers');

  const market = category === 'ALL' ? undefined : (category as Market);
  const { gainers, losers, active, loading: moversLoading, refresh: refreshMovers } = useMarketMovers(market);
  const { results: searchResults, loading: searchLoading, search, clear } = useStockSearch();

  // Per-market stock lists
  const bist = useStocks('BIST');
  const nasdaq = useStocks('NASDAQ');
  const nyse = useStocks('NYSE');
  const europe = useStocks('EUROPE');

  const [refreshing, setRefreshing] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const allStocks = useMemo(() => {
    const combined = [
      ...bist.stocks,
      ...nasdaq.stocks,
      ...nyse.stocks,
      ...europe.stocks,
    ];
    // Deduplicate by id
    const seen = new Set<string>();
    return combined.filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [bist.stocks, nasdaq.stocks, nyse.stocks, europe.stocks]);

  const displayedStocks = useMemo(() => {
    let list = category === 'ALL' ? allStocks : allStocks.filter(s => s.market === category);
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case 'change': return (b.price?.changePercent ?? 0) - (a.price?.changePercent ?? 0);
        case 'price': return (b.price?.current ?? 0) - (a.price?.current ?? 0);
        case 'volume': return (b.price?.volume ?? 0) - (a.price?.volume ?? 0);
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    return list;
  }, [allStocks, category, sortKey]);

  const movers = useMemo(
    () => ({ gainers, losers, active }[moverTab]),
    [moverTab, gainers, losers, active],
  );

  const onSearchChange = useCallback(
    (text: string) => {
      setQuery(text);
      search(text, market);
    },
    [search, market],
  );

  const onClearSearch = useCallback(() => {
    setQuery('');
    clear();
  }, [clear]);

  const navigateToStock = useCallback(
    (stock: Stock) => {
      navigation.navigate('StockDetail', { stockId: stock.id, symbol: stock.symbol });
    },
    [navigation],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([bist.refresh(), nasdaq.refresh(), nyse.refresh(), europe.refresh(), refreshMovers()]);
    setRefreshing(false);
  }, [bist, nasdaq, nyse, europe, refreshMovers]);

  const isLoading = bist.loading || nasdaq.loading || nyse.loading || europe.loading;
  const listData = query.length > 0 ? searchResults : displayedStocks;

  const renderItem = useCallback(
    ({ item }: { item: Stock }) => (
      <StockCard stock={item} onPress={() => navigateToStock(item)} />
    ),
    [navigateToStock],
  );

  const keyExtractor = useCallback((item: Stock) => item.id, []);

  const ListHeader = (
    <View>
      {/* Hero Header */}
      <Animated.View
        style={[
          styles.heroHeader,
          {
            backgroundColor: colors.background,
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          },
        ]}
      >
        <View style={styles.heroRow}>
          <View>
            <Text style={[styles.heroGreeting, { color: colors.textSecondary }]}>Merhaba 👋</Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Hisse Takibi</Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.heroBadgeText, { color: colors.primary }]}>🌐 Canlı</Text>
          </View>
        </View>
      </Animated.View>

      {/* Search */}
      <SearchBar value={query} onChangeText={onSearchChange} onClear={onClearSearch} />

      {/* Market Movers */}
      {query.length === 0 && (
        <View style={styles.moversSection}>
          <View style={styles.moverTabRow}>
            {MOVER_TABS.map(t => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setMoverTab(t.key)}
                style={[
                  styles.moverTab,
                  {
                    borderBottomColor: moverTab === t.key ? colors.primary : 'transparent',
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.moverTabText,
                    { color: moverTab === t.key ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {t.icon} {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {moversLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: Spacing.base }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moversScroll}>
              {movers.slice(0, 10).map(stock => (
                <MiniStockCard
                  key={stock.id}
                  stock={stock}
                  onPress={() => navigateToStock(stock)}
                />
              ))}
              {movers.length === 0 && (
                <Text style={[styles.emptyMovers, { color: colors.textMuted }]}>Veri bekleniyor...</Text>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Divider */}
      <View style={[styles.divider, { borderBottomColor: colors.border }]} />

      {/* Category Filter */}
      {query.length === 0 && (
        <>
          <CategoryFilter selected={category} onSelect={setCategory} />
          <SortPicker selected={sortKey} onSelect={setSortKey} />
        </>
      )}

      {/* Section Title */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {query.length > 0
            ? `Arama: "${query}" (${listData.length})`
            : `${category === 'ALL' ? 'Tüm Hisseler' : category} (${listData.length})`}
        </Text>
        {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>
    </View>
  );

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      {searchLoading || isLoading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {query.length > 0 ? 'Sonuç bulunamadı.' : 'Yükleniyor...'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
        contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroHeader: {
    paddingTop: Spacing.xl + 8,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroGreeting: { fontSize: FontSizes.sm },
  heroTitle: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold, marginTop: 2 },
  heroBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  heroBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  moversSection: { marginBottom: Spacing.sm },
  moverTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  moverTab: { marginRight: Spacing.base, paddingBottom: Spacing.xs },
  moverTabText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  moversScroll: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xs },
  emptyMovers: { fontSize: FontSizes.sm, paddingHorizontal: Spacing.base },
  divider: { borderBottomWidth: 1, marginVertical: Spacing.sm },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
  },
  sectionTitle: { fontSize: FontSizes.base, fontWeight: FontWeights.bold },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: Spacing['5xl'] },
  emptyText: { fontSize: FontSizes.base },
});

export default HomeScreen;
