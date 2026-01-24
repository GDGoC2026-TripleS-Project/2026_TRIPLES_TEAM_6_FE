import React from 'react';

import HomeScreen from '../../screens/main/HomeScreen';
import ProfileScreen from '../../screens/main/ProfileScreen';
import CalendarScreen from '../../screens/main/CalendarScreen';
import HeartScreen from '../../screens/main/HeartScreen';

import HomeIcon from '../../../assets/home.svg';
import ProfileIcon from '../../../assets/person.svg';
import CalendarIcon from '../../../assets/calendar.svg';
import HeartIcon from '../../../assets/heart.svg';
import PlusIcon from '../../../assets/plus.svg';

import { MainTabParamList } from '../../types/navigation';

export type TabConfig = {
  name: keyof MainTabParamList;
  component: React.ComponentType<any>;
  title: string;
  icon: React.ComponentType<{ color?: string }>;
  isPlus?: boolean;
};

export const tabs: readonly TabConfig[] = [
  {
    name: 'Home',
    component: HomeScreen,
    title: '홈',
    icon: HomeIcon,
  },
  {
    name: 'Calendar',
    component: CalendarScreen,
    title: '캘린더',
    icon: CalendarIcon,
  },
  {
    name: 'Plus',
    component: HomeScreen,
    title: '',
    icon: PlusIcon,
    isPlus: true,
  },
  {
    name: 'Heart',
    component: HeartScreen,
    title: '즐겨찾기',
    icon: HeartIcon,
  },
  {
    name: 'Profile',
    component: ProfileScreen,
    title: '마이페이지',
    icon: ProfileIcon,
  },
];
