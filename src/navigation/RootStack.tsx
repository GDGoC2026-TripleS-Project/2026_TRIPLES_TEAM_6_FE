import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './AppNavigator';
import RecordScreen from '../screens/main/record/ReocrdScreen';
import RecordDetailScreen from '../screens/main/record/RecordDetail';
import RecordDrinkDetail from '../screens/main/record/RecordDrinkDetail';
import RecordingDetail from '../screens/main/record/RecordingDetail';
import SendScreen from '../screens/main/record/SendScreen';
import HeaderDetail from '../components/common/HeaderDetail';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../constants/colors';
import DropCompleteScreen from '../screens/main/mypage/DropCompleteScreen';
import PeriodSearchScreen from '../screens/main/PeriodSearchScreen';
import GoalEditScreen from '../screens/main/mypage/GoalEditScreen';
import PasswordResetScreen from '../screens/main/sign/PasswordResetScreen';
import PasswordResetInputScreen from '../screens/main/sign/PasswordResetInputScreen';
import ProfileSettingScreen from '../screens/main/mypage/ProfileSettingScreen';
import AlarmSettingScreen from '../screens/main/mypage/AlarmSettingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: '#0B0B0B' },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={AppNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Record"
        component={RecordScreen}
        options={({ navigation }) => ({
          headerShown: true,
          header: () => (
            <SafeAreaView edges={['top']} style={{ backgroundColor: '#0B0B0B' }}>
              <HeaderDetail
                title="음료 기록하기"
                onBack={() => navigation.goBack()}
                initialRightType="none"
              />
            </SafeAreaView>
          ),
        })}
      />

      <Stack.Screen
        name="RecordDetail"
        component={RecordDetailScreen}
        options={({ navigation, route }) => ({
          headerShown: true,
          header: () => (
            <SafeAreaView edges={['top']} style={{ backgroundColor: '#0B0B0B' }}>
              <HeaderDetail
                title={route.params.brandName}
                onBack={() => navigation.goBack()}
                initialRightType="heart"
              />
            </SafeAreaView>
          ),
        })}
      />

      <Stack.Screen
        name="RecordDrinkDetail"
        component={RecordDrinkDetail}
        options={({ navigation }) => ({
          headerShown: true,
          header: () => (
            <SafeAreaView edges={['top']} style={{ backgroundColor: '#0B0B0B' }}>
              <HeaderDetail
                title="음료 기록하기"
                onBack={() => navigation.goBack()}
                initialRightType="none"
              />
            </SafeAreaView>
          ),
        })}
      />

      <Stack.Screen
        name="RecordingDetail"
        component={RecordingDetail}
        options={({ navigation }) => ({
          headerShown: true,
          header: () => (
            <SafeAreaView edges={['top']} style={{ backgroundColor: '#0B0B0B' }}>
              <HeaderDetail
                title="음료 기록하기"
                onBack={() => navigation.goBack()}
                initialRightType="none"
              />
            </SafeAreaView>
          ),
        })}
      />

      <Stack.Screen
        name="Send"
        component={SendScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="DropCompleteScreen"
        component={DropCompleteScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="PeriodSearchScreen"
        component={PeriodSearchScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="GoalEditScreen"
        component={GoalEditScreen}
        options={{
          headerShown: true,
          title: '기준 수정',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#0B0B0B' },
          headerShadowVisible: false,
          headerTintColor: colors.grayscale[100],
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: 'Pretendard-SemiBold',
          },
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <Stack.Screen
        name="PasswordResetScreen"
        component={PasswordResetScreen}
        options={{ headerShown: true, title: '' }}
      />

      <Stack.Screen
        name="PasswordResetInputScreen"
        component={PasswordResetInputScreen}
        options={{
          headerShown: true,
          title: '비밀번호 변경',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#0B0B0B' },
          headerShadowVisible: false,
          headerTintColor: colors.grayscale[100],
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: 'Pretendard-SemiBold',
          },
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <Stack.Screen
        name="ProfileSettingScreen"
        component={ProfileSettingScreen}
        options={{
          headerShown: true,
          title: '프로필 설정',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#0B0B0B' },
          headerShadowVisible: false,
          headerTintColor: colors.grayscale[100],
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: 'Pretendard-SemiBold',
          },
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <Stack.Screen
        name="AlarmSettingScreen"
        component={AlarmSettingScreen}
        options={{
          headerShown: true,
          title: '알림 설정',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#0B0B0B' },
          headerShadowVisible: false,
          headerTintColor: colors.grayscale[100],
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: 'Pretendard-SemiBold',
          },
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack.Navigator>
  );
}
