import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import AppNavigator from "./AppNavigator";
import RecordScreen from "../screens/main/record/ReocrdScreen";
import RecordDetailScreen from "../screens/main/record/RecordDetail";
import RecordDrinkDetail from "../screens/main/record/RecordDrinkDetail";
import RecordingDetail from "../screens/main/record/RecordingDetail";
import IntakeDetailScreen from "../screens/main/record/IntakeDetailScreen";
import SendScreen from "../screens/main/record/SendScreen";
import HeaderDetail from "../components/common/HeaderDetail";
import { RootStackParamList } from "../types/navigation";
import { colors } from "../constants/colors";
import DropCompleteScreen from "../screens/main/mypage/DropCompleteScreen";
import PeriodSearchScreen from "../screens/main/PeriodSearchScreen";
import GoalEditScreen from "../screens/main/mypage/GoalEditScreen";
import PasswordResetScreen from "../screens/main/sign/PasswordResetScreen";
import PasswordResetInputScreen from "../screens/main/sign/PasswordResetInputScreen";
import FindPasswordScreen from "../screens/main/sign/FindPasswordScreen";
import ResetLinkScreen from "../screens/main/sign/ResetLinkScreen";
import ProfileSettingScreen from "../screens/main/mypage/ProfileSettingScreen";
import AlarmSettingScreen from "../screens/main/mypage/AlarmSettingScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.grayscale[1000] },
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
            <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.grayscale[1000] }}>
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
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="RecordDrinkDetail"
        component={RecordDrinkDetail}
        options={({ navigation }) => ({
          headerShown: true,
          header: () => (
            <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.grayscale[1000] }}>
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
            <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.grayscale[1000] }}>
              <HeaderDetail
                title="음료 기록하기"
                onBack={() => navigation.goBack()}
                initialRightType="none"
              />
            </SafeAreaView>
          ),
        })}
      />

      <Stack.Screen name="IntakeDetail" component={IntakeDetailScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Send" component={SendScreen} options={{ headerShown: false }} />

      <Stack.Screen name="DropCompleteScreen" component={DropCompleteScreen} options={{ headerShown: false }} />

      <Stack.Screen name="PeriodSearchScreen" component={PeriodSearchScreen} options={{ headerShown: false }} />

      <Stack.Screen
        name="GoalEditScreen"
        component={GoalEditScreen}
        options={{
          headerShown: true,
          title: "기준 수정",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: colors.grayscale[1000] },
          headerShadowVisible: false,
          headerTintColor: colors.grayscale[100],
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: "Pretendard-SemiBold",
          },
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <Stack.Screen
        name="PasswordResetScreen"
        component={PasswordResetScreen}
        options={{
          headerShown: true,
          title: "재설정 완료",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: colors.grayscale[1000] },
          headerShadowVisible: false,
          headerTintColor: colors.grayscale[100],
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: "Pretendard-SemiBold",
          },
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <Stack.Screen
        name="FindPasswordScreen"
        component={FindPasswordScreen}
        options={({ route }) => {
          const isFromMyPage = route?.params?.redirectTo === "MyPage";
          return {
            headerShown: true,
            title: isFromMyPage ? "비밀번호 변경" : "비밀번호 찾기",
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: colors.grayscale[1000] },
            headerShadowVisible: false,
            headerTintColor: colors.grayscale[100],
            headerTitleStyle: {
              fontSize: 14,
              fontFamily: "Pretendard-SemiBold",
            },
            headerBackButtonDisplayMode: "minimal",
          };
        }}
      />
      <Stack.Screen
        name="ResetLinkScreen"
        component={ResetLinkScreen}
        options={{
          headerShown: true,
          title: "인증 코드",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: colors.grayscale[1000] },
          headerShadowVisible: false,
          headerTintColor: colors.grayscale[100],
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: "Pretendard-SemiBold",
          },
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <Stack.Screen
        name="PasswordResetInputScreen"
        component={PasswordResetInputScreen}
        options={{
          headerShown: true,
          title: "비밀번호 변경",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: colors.grayscale[1000] },
          headerShadowVisible: false,
          headerTintColor: colors.grayscale[100],
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: "Pretendard-SemiBold",
          },
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <Stack.Screen
        name="ProfileSettingScreen"
        component={ProfileSettingScreen}
        options={{
          headerShown: true,
          title: "프로필 설정",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: colors.grayscale[1000] },
          headerShadowVisible: false,
          headerTintColor: colors.grayscale[100],
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: "Pretendard-SemiBold",
          },
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <Stack.Screen
        name="AlarmSettingScreen"
        component={AlarmSettingScreen}
        options={{
          headerShown: true,
          title: "알림 설정",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: colors.grayscale[1000] },
          headerShadowVisible: false,
          headerTintColor: colors.grayscale[100],
          headerTitleStyle: {
            fontSize: 14,
            fontFamily: "Pretendard-SemiBold",
          },
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack.Navigator>
  );
}
