import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, BookOpen, CalendarCheck, User } from 'lucide-react-native';
import { useApp } from '../../store/AppContext';

export default function TabLayout() {
  const { t } = useTranslation();
  const { visits, theme } = useApp();
  const insets = useSafeAreaInsets();
  const plannedCount = visits.filter((v) => v.status === 'planned').length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('nav.search'),
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: t('nav.guide'),
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="visits"
        options={{
          title: t('nav.visits'),
          tabBarBadge: plannedCount > 0 ? plannedCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.primary,
            fontSize: 10,
            fontWeight: '700',
          },
          tabBarIcon: ({ color, size }) => (
            <CalendarCheck size={size} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2.2} />,
        }}
      />
    </Tabs>
  );
}
