import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '../../theme';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { FontSizes, FontWeights } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useStockDetail, useStockHistory } from '../../hooks/useStockDetail';
import { useRealTimePrices } from '../../hooks/useRealTimePrices';
import { useAppSelector } from '../../hooks/useStore';
import { useAIPrediction } from '../../hooks/useAIPrediction';
import { useNews } from '../../hooks/useNews';
import StockHeaderInfo from '../../components/stock/StockHeaderInfo';
import PriceChart from '../../components/chart/PriceChart';
import StockNewsTab from '../../components/stock/StockNewsTab';
import StockAITab from '../../components/stock/StockAITab';
import TechnicalAnalysisTab from '../../components/stock/TechnicalAnalysisTab';
import PredictionModal from '../../components/stock/PredictionModal';
import { useFavorites } from '../../hooks/useWatchlist';

type RouteType = RouteProp<RootStackParamList, 'StockDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'StockDetail'>;

type Period = '1D' | '1W' | '1M' | '1Y';
type TabKey = 'overview' | 'news' | 'ai' | 'technical';

const PERIODS: { key: Period; label: string }[] = [
  { key: '1D', label: '1G' },
  { key: '1W', label: '1H' },
  { key: '1M', label: '1A' },
  { key: '1Y', label: '1Y' },
];

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Genel' },
  { key: 'news', label: 'Haberler' },
  { key: 'ai', label: '🤖 Yapay Zeka' },
  { key: 'technical', label: 'Teknik' },
];

const StockDetailScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { stockId, symbol } = route.params;

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { stock, loading: stockLoading, error, refresh } = useStockDetail(stockId);
  const { history, loading: historyLoading, period, changePeriod } = useStockHistory(symbol);

  // Real-time price subscription
  useRealTimePrices([symbol]);

  // Get live price from Redux store
  const liveStock = useAppSelector(s => {
    const item = s.stocks.items[stockId];
    return item ?? stock;
  });
  const displayStock = liveStock ?? stock;

  // Real data hooks
  const { articles: news, loading: newsLoading } = useNews({ symbol, autoLoad: true });
  const { history: predHistory, loading: predictionsLoading } = useAIPrediction(stockId, symbol);
  const [predModalVisible, setPredModalVisible] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handlePredictPress = useCallback(() => setPredModalVisible(true), []);

  if (stockLoading && !displayStock) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{symbol} yükleniyor...</Text>
      </View>
    );
  }

  if (error && !displayStock) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 40 }}>⚠️</Text>
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          onPress={refresh}
        >
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartColor =
    (displayStock?.price?.changePercent ?? 0) >= 0 ? colors.positive : colors.negative;

  return (
    <Animated.View style={[styles.root, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" />

      {/* Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surfaceElevated }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerSymbol, { color: colors.text }]}>{symbol}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                {
                  borderBottomColor: activeTab === tab.key ? colors.primary : 'transparent',
                  borderBottomWidth: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? colors.primary : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {activeTab === 'overview' && (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}
        >
          {/* Stock Info */}
          {displayStock ? (
            <StockHeaderInfo stock={displayStock} />
          ) : (
            <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
          )}

          {/* Period Selector */}
          <View style={[styles.periodRow, { backgroundColor: colors.surfaceElevated }]}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p.key}
                onPress={() => changePeriod(p.key as Period)}
                style={[
                  styles.periodBtn,
                  {
                    backgroundColor: period === p.key ? colors.primary : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    { color: period === p.key ? '#fff' : colors.textSecondary },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart */}
          <PriceChart
            data={history}
            loading={historyLoading}
            currency={displayStock?.currency ?? 'TRY'}
            color={chartColor}
          />
        </ScrollView>
      )}

      {activeTab === 'news' && (
        <StockNewsTab news={news} loading={newsLoading} />
      )}

      {activeTab === 'ai' && (
        <StockAITab
          predictions={predHistory}
          loading={predictionsLoading}
          onPredictPress={handlePredictPress}
        />
      )}

      {activeTab === 'technical' && (
        <TechnicalAnalysisTab symbol={symbol} />
      )}

      {displayStock && (
        <PredictionModal
          visible={predModalVisible}
          onClose={() => setPredModalVisible(false)}
          stockId={stockId}
          symbol={symbol}
          stockName={displayStock.name}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: { fontSize: FontSizes.base, marginTop: Spacing.sm },
  errorText: { fontSize: FontSizes.base, textAlign: 'center', marginHorizontal: Spacing.xl },
  retryBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  retryText: { color: '#fff', fontWeight: FontWeights.semibold },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Platform.OS === 'ios' ? 52 : Spacing.xl + 8,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18, fontWeight: FontWeights.bold },
  headerSymbol: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  tabBar: {
    borderBottomWidth: 1,
  },
  tabScroll: { paddingHorizontal: Spacing.base },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginRight: Spacing.xs,
  },
  tabText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  periodRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
    borderRadius: 12,
    padding: 3,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
});

export default StockDetailScreen;
