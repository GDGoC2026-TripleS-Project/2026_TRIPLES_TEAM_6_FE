import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { tabs } from './config/tabs';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_CONFIG = {
  headerShown: false,
  tabBarActiveTintColor: colors.grayscale[100],
  tabBarInactiveTintColor: colors.grayscale[600],
  tabBarStyle: {
    backgroundColor: colors.grayscale[1000],
    borderTopColor: colors.grayscale[700],
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
} as const;

const createTabIcon =
  (Icon: React.ComponentType<{ color?: string }>) =>
  ({ focused }: { focused: boolean }) =>
    (
      <Icon
        color={focused ? colors.grayscale[100] : colors.grayscale[600]}
      />
    );

export default function AppNavigator() {
  return (
    <Tab.Navigator screenOptions={TAB_BAR_CONFIG}>
      {tabs.map(({ name, component, title, icon, isPlus }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            title,
            tabBarIcon: isPlus
              ? () => React.createElement(icon)
              : createTabIcon(icon),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
