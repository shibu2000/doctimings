import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Stethoscope, Building2, LayoutGrid } from 'lucide-react-native';
import { Colors, Typography } from '../../constants/theme';
import { usePartner } from '../../store/PartnerContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isDoctor } = usePartner();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
        tabBarLabelStyle: {
          ...Typography.labelSm,
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: 'Doctors',
          href: isDoctor ? null : undefined,
          tabBarIcon: ({ color, size }) => <Stethoscope size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="establishment"
        options={{
          title: isDoctor ? 'Places' : 'Establishment',
          tabBarIcon: ({ color, size }) => <Building2 size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size || 22} color={color} />,
        }}
      />
    </Tabs>
  );
}
