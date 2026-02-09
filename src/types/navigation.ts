import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Record: { selectedDate?: string } | undefined;
  RecordDetail: { brandName: string; brandId: string; selectedDate?: string };
  RecordDrinkDetail: {
    drinkName: string;
    drinkId: string;
    selectedDate?: string;
    edit?: {
      intakeId?: number | string;
      menuSizeId?: number;
      intakeDate?: string;
      temperature?: 'HOT' | 'ICED';
      sizeName?: string;
      options?: Array<{ optionId: number | string; quantity?: number; count?: number }>;
    };
  };
  RecordingDetail: {
    drinkName: string;
    drinkId: string;
    brandName: string;
    brandId?: number;
    selectedDate?: string;
    edit?: {
      intakeId?: number | string;
    };
    temperature: 'hot' | 'ice';
    size: string;
    menuSizeId?: number;
    baseNutrition?: { caffeineMg?: number; sugarG?: number };
    optionNames?: Record<string, string>;
    optionNutrition?: Record<string, { caffeineMg?: number; sugarG?: number }>;
    options: {
      coffee?: Record<string, number>;
      syrup?: Record<string, number>;
      milk?: string[];
    };
  };
  IntakeDetail: { intakeId: string | number };
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
  FindPasswordScreen: undefined;
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
