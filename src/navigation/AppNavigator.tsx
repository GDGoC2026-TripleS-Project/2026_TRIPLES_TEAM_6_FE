import React from 'react';
import { Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';

import { tabs } from './config/tabs';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_CONFIG = {
  headerShown: true,
  headerTitle: '로고',
  headerStyle: {
    backgroundColor: "#0B0B0B",
    borderBottomColor: colors.grayscale[800],
    borderBottomWidth: 1,
  },
  headerTintColor: colors.grayscale[100],
  headerTitleStyle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitleAlign: 'left',
  tabBarActiveTintColor: colors.grayscale[100],
  tabBarInactiveTintColor: colors.grayscale[600],
  tabBarStyle: {
    backgroundColor: colors.grayscale[1000],
    borderTopColor: colors.grayscale[700],
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
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
  const navigation = useNavigation<any>(); 

  return (
    <Tab.Navigator screenOptions={TAB_BAR_CONFIG} initialRouteName="Home">
      {tabs.map(({ name, component, title, icon, isPlus }) =>
        isPlus ? (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            options={{
              title: '',
              headerShown: false, 
              tabBarButton: () => (
                <Pressable
                  onPress={() => navigation.navigate('Record')}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {React.createElement(icon)}
                </Pressable>
              ),
            }}
          />
        ) : (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            options={{
              title,
              tabBarIcon: createTabIcon(icon),
            }}
          />
        )
      )}
    </Tab.Navigator>
  );
}