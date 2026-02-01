import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './AppNavigator';
import RecordScreen from '../screens/main/record/ReocrdScreen';
import RecordDetailScreen from '../screens/main/record/RecordDetail';
import HeaderDetail from '../components/common/HeaderDetail';
import { RootStackParamList } from '../types/navigation';
import RecordDrinkDetail from '../screens/main/record/RecordDrinkDetail';

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
        options={({ navigation, route }) => ({
          headerShown: true,
          header: () => (
            <SafeAreaView edges={['top']} style={{ backgroundColor: '#0B0B0B' }}>
              <HeaderDetail
                title="음료 기록하기"
                onBack={() => navigation.goBack()}
              />
            </SafeAreaView>
          ),
        })}
      />
    </Stack.Navigator>
  );
}