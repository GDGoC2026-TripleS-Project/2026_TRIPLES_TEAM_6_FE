import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Record: { date?: string } | undefined;
  RecordDetail: { brandName: string; brandId: string };
  RecordDrinkDetail: { drinkName: string; drinkId: string };
  RecordingDetail: {
    drinkName: string;
    drinkId: string;
    brandName: string;
    temperature: 'hot' | 'ice';
    size: string;
    options: {
      coffee?: Record<string, number>;
      syrup?: Record<string, number>;
      milk?: string[];
    };
    optionLabelMap?: Record<string, string>;
  };
  Send: undefined;
  MyPage: undefined;
  EditCriteria: undefined;
  ChangePassword: undefined;
  NotificationSetting: undefined;
  DropCompleteScreen: undefined;
  PeriodSearchScreen: { startDate: string; endDate: string };
  GoalEditScreen: undefined;
  PasswordResetScreen: undefined;
  PasswordResetInputScreen: undefined;
  ProfileSettingScreen: undefined;
  AlarmSettingScreen: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Plus: undefined;
  Heart: undefined;
  Profile: undefined;
};

export type MainTabNavigationProp<T extends keyof MainTabParamList> =
  CompositeNavigationProp<
    NativeStackNavigationProp<RootStackParamList>,
    BottomTabNavigationProp<MainTabParamList, T>
  >;
