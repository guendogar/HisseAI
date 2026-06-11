// ─── Mock Data ────────────────────────────────────────────────────────────────
// Backend hazır olana kadar tüm API çağrılarının yerine geçen mock veriler.
// Backend hazır olduğunda bu dosyayı silerek gerçek API çağrılarını aktif edin.

import { Stock, StockPrice, StockHistory, NewsArticle, User, AuthTokens } from '../../types';
import { Market } from '../../constants';

// ─── Mock Auth ────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'demo@hisseai.com',
  displayName: 'Demo Kullanıcı',
  createdAt: new Date().toISOString(),
};

export const MOCK_TOKENS: AuthTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: Date.now() + 3_600_000,
};

// ─── Mock Stocks ──────────────────────────────────────────────────────────────

function makePrice(current: number, change: number): StockPrice {
  const changePercent = (change / (current - change)) * 100;
  return {
    current,
    open: current - change * 0.5,
    high: Math.max(current, current - change * 0.5) * (1 + Math.random() * 0.01),
    low: Math.min(current, current - change * 0.5) * (1 - Math.random() * 0.01),
    close: current,
    previousClose: current - change,
    changeAmount: change,
    changePercent,
    volume: Math.floor(Math.random() * 10_000_000) + 500_000,
    avgVolume: Math.floor(Math.random() * 8_000_000) + 400_000,
    marketCap: current * (Math.floor(Math.random() * 5_000_000_000) + 1_000_000_000),
    timestamp: Date.now(),
  };
}

export const MOCK_STOCKS: Stock[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // BIST - Turkish Stocks (19 stocks - Main & Blue Chips)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'bist-thyao', symbol: 'THYAO', name: 'Türk Hava Yolları', market: 'BIST' as Market, currency: 'TRY', sector: 'Havacılık', description: 'Türkiye\'s leading airline company.', price: makePrice(290.5, 8.2) },
  { id: 'bist-garan', symbol: 'GARAN', name: 'Garanti BBVA', market: 'BIST' as Market, currency: 'TRY', sector: 'Bankacılık', description: 'Leading bank in Turkey.', price: makePrice(116.4, 3.1) },
  { id: 'bist-kchol', symbol: 'KCHOL', name: 'Koç Holding', market: 'BIST' as Market, currency: 'TRY', sector: 'Holding', description: 'Largest industrial conglomerate in Turkey.', price: makePrice(183.7, 5.4) },
  { id: 'bist-akbnk', symbol: 'AKBNK', name: 'Akbank', market: 'BIST' as Market, currency: 'TRY', sector: 'Bankacılık', description: 'Major Turkish bank.', price: makePrice(49.2, -0.8) },
  { id: 'bist-bimas', symbol: 'BIMAS', name: 'BİM Birleşik Mağazalar', market: 'BIST' as Market, currency: 'TRY', sector: 'Perakende', description: 'Retail discount store chain.', price: makePrice(487.5, 12.3) },
  { id: 'bist-tuprs', symbol: 'TUPRS', name: 'Tüpraş', market: 'BIST' as Market, currency: 'TRY', sector: 'Enerji', description: 'Petroleum refining company.', price: makePrice(193.2, 6.8) },
  { id: 'bist-eregl', symbol: 'EREGL', name: 'Ereğli Demir Çelik', market: 'BIST' as Market, currency: 'TRY', sector: 'Sanayi', description: 'Steel manufacturer.', price: makePrice(54.8, -1.2) },
  { id: 'bist-sasa', symbol: 'SASA', name: 'SASA Polyester', market: 'BIST' as Market, currency: 'TRY', sector: 'Kimya', description: 'Chemical and polyester producer.', price: makePrice(72.3, -2.1) },
  { id: 'bist-arclk', symbol: 'ARCLK', name: 'Arçelik', market: 'BIST' as Market, currency: 'TRY', sector: 'Beyaz Eşya', description: 'Home appliances manufacturer.', price: makePrice(38.5, 1.2) },
  { id: 'bist-aksa', symbol: 'AKSA', name: 'Aksa Akrilik', market: 'BIST' as Market, currency: 'TRY', sector: 'Kimya', description: 'Acrylic fiber producer.', price: makePrice(28.7, -0.5) },
  { id: 'bist-tskb', symbol: 'TSKB', name: 'Türkiye Sınai Kalkınma Bankası', market: 'BIST' as Market, currency: 'TRY', sector: 'Finans', description: 'Development and investment bank.', price: makePrice(41.3, 0.8) },
  { id: 'bist-tcell', symbol: 'TCELL', name: 'Turkcell', market: 'BIST' as Market, currency: 'TRY', sector: 'İletişim', description: 'Leading mobile telecommunications operator.', price: makePrice(102.5, 2.1) },
  { id: 'bist-ttkom', symbol: 'TTKOM', name: 'Türk Telekom', market: 'BIST' as Market, currency: 'TRY', sector: 'İletişim', description: 'Fixed-line telecom operator.', price: makePrice(36.8, -0.3) },
  { id: 'bist-otkar', symbol: 'OTKAR', name: 'Otokar', market: 'BIST' as Market, currency: 'TRY', sector: 'Otomotiv', description: 'Bus and commercial vehicle manufacturer.', price: makePrice(152.4, 3.6) },
  { id: 'bist-enka', symbol: 'ENKA', name: 'Enka', market: 'BIST' as Market, currency: 'TRY', sector: 'İnşaat', description: 'Construction and engineering company.', price: makePrice(12.5, 0.3) },
  { id: 'bist-asels', symbol: 'ASELS', name: 'Aselsan', market: 'BIST' as Market, currency: 'TRY', sector: 'Savunma', description: 'Defense and aerospace electronics.', price: makePrice(295.6, 8.4) },
  { id: 'bist-albrk', symbol: 'ALBRK', name: 'Albaraka Türk', market: 'BIST' as Market, currency: 'TRY', sector: 'Finans', description: 'Islamic banking services.', price: makePrice(42.1, 0.9) },
  { id: 'bist-vestl', symbol: 'VESTL', name: 'Vestel', market: 'BIST' as Market, currency: 'TRY', sector: 'Elektronik', description: 'Electronics and consumer appliances.', price: makePrice(18.3, -0.4) },
  { id: 'bist-hlgyo', symbol: 'HLGYO', name: 'Holding Yatırımları', market: 'BIST' as Market, currency: 'TRY', sector: 'Holding', description: 'Investment holding company.', price: makePrice(67.2, 1.5) },

  // ═══════════════════════════════════════════════════════════════════════════
  // NASDAQ - US Technology & Growth (20 stocks)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'nasdaq-aapl', symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Consumer electronics, software and services.', price: makePrice(189.5, 2.3) },
  { id: 'nasdaq-msft', symbol: 'MSFT', name: 'Microsoft Corp.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Software, cloud computing and productivity tools.', price: makePrice(415.2, 5.7) },
  { id: 'nasdaq-googl', symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Search, advertising and cloud services.', price: makePrice(173.8, -1.2) },
  { id: 'nasdaq-nvda', symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'GPU design and AI computing.', price: makePrice(875.4, 23.1) },
  { id: 'nasdaq-amzn', symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Consumer Discretionary', description: 'E-commerce, cloud computing and retail.', price: makePrice(198.7, 3.4) },
  { id: 'nasdaq-meta', symbol: 'META', name: 'Meta Platforms', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Social media and metaverse platforms.', price: makePrice(521.3, -4.2) },
  { id: 'nasdaq-tsla', symbol: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Automotive', description: 'Electric vehicles and renewable energy.', price: makePrice(245.8, 8.2) },
  { id: 'nasdaq-intc', symbol: 'INTC', name: 'Intel Corp.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Semiconductor design and manufacturing.', price: makePrice(28.5, -0.5) },
  { id: 'nasdaq-amd', symbol: 'AMD', name: 'Advanced Micro Devices', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Microprocessor and GPU manufacturer.', price: makePrice(168.3, 4.1) },
  { id: 'nasdaq-qcom', symbol: 'QCOM', name: 'Qualcomm Inc.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Wireless technology and semiconductors.', price: makePrice(182.7, 2.3) },
  { id: 'nasdaq-csco', symbol: 'CSCO', name: 'Cisco Systems', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Networking and cyber security.', price: makePrice(48.2, 0.6) },
  { id: 'nasdaq-nflx', symbol: 'NFLX', name: 'Netflix Inc.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Streaming entertainment platform.', price: makePrice(234.5, 5.8) },
  { id: 'nasdaq-uber', symbol: 'UBER', name: 'Uber Technologies', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Consumer Discretionary', description: 'Ride-sharing and delivery services.', price: makePrice(84.3, 1.2) },
  { id: 'nasdaq-adbe', symbol: 'ADBE', name: 'Adobe Inc.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Software for creative and digital media.', price: makePrice(562.1, 8.4) },
  { id: 'nasdaq-crm', symbol: 'CRM', name: 'Salesforce Inc.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Cloud-based CRM and business applications.', price: makePrice(318.2, 3.5) },
  { id: 'nasdaq-snowflake', symbol: 'SNOW', name: 'Snowflake Inc.', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Cloud data warehouse and analytics.', price: makePrice(156.8, -2.1) },
  { id: 'nasdaq-mstr', symbol: 'MSTR', name: 'MicroStrategy', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Business analytics and intelligence.', price: makePrice(289.4, 12.3) },
  { id: 'nasdaq-zoom', symbol: 'ZM', name: 'Zoom Video Communications', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Video conferencing and communications.', price: makePrice(128.5, 2.1) },
  { id: 'nasdaq-arm', symbol: 'ARM', name: 'ARM Holdings', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Semiconductor IP design.', price: makePrice(142.3, 3.8) },
  { id: 'nasdaq-mrvl', symbol: 'MRVL', name: 'Marvell Technology', market: 'NASDAQ' as Market, currency: 'USD', sector: 'Technology', description: 'Semiconductor solutions.', price: makePrice(65.7, 1.4) },

  // ═══════════════════════════════════════════════════════════════════════════
  // NYSE - US Blue Chips & Financials (15 stocks)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'nyse-jpm', symbol: 'JPM', name: 'JPMorgan Chase', market: 'NYSE' as Market, currency: 'USD', sector: 'Financials', description: 'Global financial services leader.', price: makePrice(201.4, 1.8) },
  { id: 'nyse-ba', symbol: 'BA', name: 'Boeing Co.', market: 'NYSE' as Market, currency: 'USD', sector: 'Aerospace', description: 'Aircraft and defense manufacturer.', price: makePrice(181.2, -3.4) },
  { id: 'nyse-axp', symbol: 'AXP', name: 'American Express', market: 'NYSE' as Market, currency: 'USD', sector: 'Financials', description: 'Payment services and travel company.', price: makePrice(289.6, 4.2) },
  { id: 'nyse-jnj', symbol: 'JNJ', name: 'Johnson & Johnson', market: 'NYSE' as Market, currency: 'USD', sector: 'Healthcare', description: 'Pharmaceuticals and consumer health.', price: makePrice(161.3, -0.8) },
  { id: 'nyse-ko', symbol: 'KO', name: 'Coca-Cola Co.', market: 'NYSE' as Market, currency: 'USD', sector: 'Consumer Staples', description: 'Beverage manufacturer.', price: makePrice(62.8, 0.4) },
  { id: 'nyse-xom', symbol: 'XOM', name: 'Exxon Mobil', market: 'NYSE' as Market, currency: 'USD', sector: 'Energy', description: 'Oil and gas corporation.', price: makePrice(114.2, -0.9) },
  { id: 'nyse-wmt', symbol: 'WMT', name: 'Walmart Inc.', market: 'NYSE' as Market, currency: 'USD', sector: 'Consumer Staples', description: 'Retail and discount stores.', price: makePrice(68.4, 1.1) },
  { id: 'nyse-mcd', symbol: 'MCD', name: 'McDonald\'s Corp.', market: 'NYSE' as Market, currency: 'USD', sector: 'Consumer Discretionary', description: 'Fast food restaurant chain.', price: makePrice(289.5, 2.3) },
  { id: 'nyse-dis', symbol: 'DIS', name: 'Disney Inc.', market: 'NYSE' as Market, currency: 'USD', sector: 'Media', description: 'Entertainment and media conglomerate.', price: makePrice(98.2, -1.2) },
  { id: 'nyse-cat', symbol: 'CAT', name: 'Caterpillar Inc.', market: 'NYSE' as Market, currency: 'USD', sector: 'Industrials', description: 'Heavy equipment manufacturer.', price: makePrice(382.4, 6.8) },
  { id: 'nyse-ge', symbol: 'GE', name: 'General Electric', market: 'NYSE' as Market, currency: 'USD', sector: 'Industrials', description: 'Industrial conglomerate.', price: makePrice(175.3, 2.1) },
  { id: 'nyse-cvx', symbol: 'CVX', name: 'Chevron Corp.', market: 'NYSE' as Market, currency: 'USD', sector: 'Energy', description: 'Oil and gas company.', price: makePrice(156.7, 1.5) },
  { id: 'nyse-gs', symbol: 'GS', name: 'Goldman Sachs', market: 'NYSE' as Market, currency: 'USD', sector: 'Financials', description: 'Investment banking and financial services.', price: makePrice(427.8, 3.2) },
  { id: 'nyse-ms', symbol: 'MS', name: 'Morgan Stanley', market: 'NYSE' as Market, currency: 'USD', sector: 'Financials', description: 'Investment banking and wealth management.', price: makePrice(118.5, 1.3) },
  { id: 'nyse-orcl', symbol: 'ORCL', name: 'Oracle Corp.', market: 'NYSE' as Market, currency: 'USD', sector: 'Technology', description: 'Database and cloud computing software.', price: makePrice(131.8, 2.4) },

  // ═══════════════════════════════════════════════════════════════════════════
  // EUROPE - European Stocks (14 stocks)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'eu-asml', symbol: 'ASML', name: 'ASML Holding', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Technology', description: 'Semiconductor manufacturing equipment.', price: makePrice(924.5, 15.3) },
  { id: 'eu-lvmh', symbol: 'MC', name: 'LVMH Moët Hennessy', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Consumer Discretionary', description: 'Luxury goods conglomerate.', price: makePrice(748.2, -8.4) },
  { id: 'eu-sap', symbol: 'SAP', name: 'SAP SE', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Technology', description: 'Enterprise resource planning software.', price: makePrice(198.4, 3.2) },
  { id: 'eu-siemens', symbol: 'SIE', name: 'Siemens AG', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Industrials', description: 'Electronics and industrial engineering.', price: makePrice(178.5, 2.1) },
  { id: 'eu-allianz', symbol: 'ALV', name: 'Allianz SE', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Financials', description: 'Insurance and asset management.', price: makePrice(285.3, 1.8) },
  { id: 'eu-shell', symbol: 'SHEL', name: 'Shell', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Energy', description: 'Oil and gas multinational.', price: makePrice(28.4, -0.3) },
  { id: 'eu-nestle', symbol: 'NSRGY', name: 'Nestlé', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Consumer Staples', description: 'Food and beverage manufacturer.', price: makePrice(92.8, 1.2) },
  { id: 'eu-roche', symbol: 'RHHBY', name: 'Roche', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Healthcare', description: 'Pharmaceutical and diagnostics company.', price: makePrice(268.5, 2.3) },
  { id: 'eu-airbus', symbol: 'AIR', name: 'Airbus SE', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Aerospace', description: 'Aircraft manufacturer.', price: makePrice(156.8, 2.5) },
  { id: 'eu-nokia', symbol: 'NOK', name: 'Nokia Oyj', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Technology', description: 'Telecommunications equipment.', price: makePrice(4.2, -0.08) },
  { id: 'eu-unilever', symbol: 'UNA', name: 'Unilever', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Consumer Staples', description: 'Consumer goods manufacturer.', price: makePrice(48.3, 0.5) },
  { id: 'eu-bnp', symbol: 'BNP', name: 'BNP Paribas', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Financials', description: 'European banking and financial services.', price: makePrice(62.1, 0.9) },
  { id: 'eu-sanofi', symbol: 'SNY', name: 'Sanofi', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Healthcare', description: 'Pharmaceutical company.', price: makePrice(101.5, 1.3) },
  { id: 'eu-mercedes', symbol: 'DAI', name: 'Daimler AG', market: 'EUROPE' as Market, currency: 'EUR', sector: 'Automotive', description: 'Luxury automotive manufacturer.', price: makePrice(78.2, 0.7) },
];

// ─── Mock History ─────────────────────────────────────────────────────────────

export function generateMockHistory(basePrice: number, days: number): StockHistory[] {
  const history: StockHistory[] = [];
  let price = basePrice * 0.8;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.48) * price * 0.03;
    price = Math.max(price + change, 1);
    const open = price * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(price, open) * (1 + Math.random() * 0.01);
    const low = Math.min(price, open) * (1 - Math.random() * 0.01);
    const dateStr = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    history.push({
      date: dateStr,
      open,
      high,
      low,
      close: price,
      volume: Math.floor(Math.random() * 5_000_000) + 100_000,
    });
  }
  return history;
}

// ─── Mock News ────────────────────────────────────────────────────────────────

export const MOCK_NEWS: NewsArticle[] = [
  { id: 'n1', title: 'BIST 100 Yeni Rekor Kırdı', content: 'Borsa İstanbul ana endeksi yeni bir zirveye ulaştı.', source: 'Borsa Haberleri', sourceUrl: 'https://example.com/n1', publishedAt: new Date(Date.now() - 3_600_000).toISOString(), category: 'macro', sentiment: 'positive', sentimentScore: 0.7, relatedSymbols: ['THYAO', 'GARAN'] },
  { id: 'n2', title: 'Apple Güçlü Satış Rakamları Açıkladı', content: 'Apple, beklentilerin üzerinde iPhone satışı gerçekleştirdi.', source: 'Tech News', sourceUrl: 'https://example.com/n2', publishedAt: new Date(Date.now() - 7_200_000).toISOString(), category: 'earnings', sentiment: 'positive', sentimentScore: 0.8, relatedSymbols: ['AAPL'] },
  { id: 'n3', title: 'Fed Faiz Kararını Açıkladı', content: 'Federal Reserve faiz oranını sabit tutma kararı aldı.', source: 'Bloomberg', sourceUrl: 'https://example.com/n3', publishedAt: new Date(Date.now() - 10_800_000).toISOString(), category: 'macro', sentiment: 'neutral', sentimentScore: 0.0, relatedSymbols: [] },
  { id: 'n4', title: 'NVIDIA Yapay Zeka Çiplerinde Rekor Kırdı', content: 'NVIDIA\'nın yeni AI çipleri talep patlaması yaşıyor.', source: 'Reuters', sourceUrl: 'https://example.com/n4', publishedAt: new Date(Date.now() - 14_400_000).toISOString(), category: 'earnings', sentiment: 'positive', sentimentScore: 0.9, relatedSymbols: ['NVDA'] },
  { id: 'n5', title: 'Türkiye Enflasyon Verisi Açıklandı', content: 'TÜİK Mayıs enflasyon verisini yayımladı.', source: 'AA Finans', sourceUrl: 'https://example.com/n5', publishedAt: new Date(Date.now() - 18_000_000).toISOString(), category: 'macro', sentiment: 'negative', sentimentScore: -0.4, relatedSymbols: [] },
  { id: 'n6', title: 'Garanti BBVA Temettü Açıkladı', content: 'Garanti BBVA güçlü kâr açıkladı ve temettü dağıtacağını bildirdi.', source: 'Borsa Haberleri', sourceUrl: 'https://example.com/n6', publishedAt: new Date(Date.now() - 21_600_000).toISOString(), category: 'dividend', sentiment: 'positive', sentimentScore: 0.6, relatedSymbols: ['GARAN'] },
  { id: 'n7', title: 'Microsoft Bulut Gelirlerini Artırdı', content: 'Microsoft Azure bulut platformu büyümesini sürdürdü.', source: 'CNBC', sourceUrl: 'https://example.com/n7', publishedAt: new Date(Date.now() - 25_200_000).toISOString(), category: 'earnings', sentiment: 'positive', sentimentScore: 0.75, relatedSymbols: ['MSFT'] },
  { id: 'n8', title: 'Petrol Fiyatları Düşüşe Geçti', content: 'Küresel arz artışı petrol fiyatlarını aşağı çekti.', source: 'Reuters', sourceUrl: 'https://example.com/n8', publishedAt: new Date(Date.now() - 28_800_000).toISOString(), category: 'macro', sentiment: 'negative', sentimentScore: -0.5, relatedSymbols: ['XOM', 'TUPRS'] },
];
