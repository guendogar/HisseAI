import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useColors } from '../theme';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import WatchlistScreen from '../screens/Watchlist/WatchlistScreen';
import NewsScreen from '../screens/News/NewsScreen';
import AIScreen from '../screens/AI/AIScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import StockDetailScreen from '../screens/StockDetail/StockDetailScreen';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

export type RootStackParamList = {
  Main: undefined;
  StockDetail: { stockId: string; symbol: string };
  AIReport: undefined;
  Notifications: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Watchlist: undefined;
  News: undefined;
  AI: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Home: '🏠',
    Watchlist: '⭐',
    News: '📰',
    AI: '🤖',
    Settings: '⚙️',
  };
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '●'}
    </Text>
  );
};

const MainTabs: React.FC = () => {
  const colors = useColors();
  return (
    <Tab.Navigator
      id="MainTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={{
            fontSize: 10,
            color: focused ? colors.primary : colors.textMuted,
            fontWeight: focused ? '600' : '400',
          }}>
            {route.name === 'Home' ? 'Ana Sayfa'
              : route.name === 'Watchlist' ? 'Takip'
              : route.name === 'News' ? 'Haberler'
              : route.name === 'AI' ? 'Yapay Zeka'
              : 'Ayarlar'}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="AI" component={AIScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AuthNavigator: React.FC = () => {
  const colors = useColors();
  return (
    <AuthStack.Navigator
      id="AuthStack"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const colors = useColors();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator
          id="RootStack"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="StockDetail" component={StockDetailScreen} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
