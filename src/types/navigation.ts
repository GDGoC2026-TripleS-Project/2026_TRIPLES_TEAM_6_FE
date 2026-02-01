import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: undefined;
  Record: undefined;
  RecordDetail: { brandName: string; brandId: string };
  RecordDrinkDetail: { drinkName: string, drinkId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Plus: undefined;
  Heart: undefined;
  Profile: undefined;
};
export type MainTabNavigationProp<T extends keyof MainTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;