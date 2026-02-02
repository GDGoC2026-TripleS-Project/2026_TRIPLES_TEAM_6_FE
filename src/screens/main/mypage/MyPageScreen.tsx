import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/colors';

import GoogleLogin from '../../../assets/ComponentsImage/GoogleLogin.svg';
import KakaoLogin from '../../../assets/ComponentsImage/KakaoLogin.svg';
import AppleLogin from '../../../assets/ComponentsImage/AppleLogin.svg';

// (선택) 네비게이션 쓸 거면 주석 해제
// import { useNavigation } from '@react-navigation/native';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import type { RootStackParamList } from '../../types/navigation';

type LoginProvider = 'google' | 'kakao' | 'apple';

type RowItem = {
  label: string;
  subLabel?: string;
  onPress: () => void;
  danger?: boolean;
  hideIcon?: boolean;
};

const ProviderIconMap = {
  google: GoogleLogin,
  kakao: KakaoLogin,
  apple: AppleLogin,
} as const;

function SettingRow({ label, subLabel, onPress, danger, hideIcon }: RowItem) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
        {!!subLabel && <Text style={styles.rowSub}>{subLabel}</Text>}
      </View>

      {!hideIcon && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.grayscale[100]}
        />
      )}
    </Pressable>
  );
}

export default function MyPageScreen() {

  const user = {
    name: '라스트컵',
    provider: 'kakao' as LoginProvider, 
    criteriaText: '카페인 400mg, 당류 25g', // 하드코딩 나중에 수정할게요
  };

  const ProviderIcon = ProviderIconMap[user.provider];

  const rows: RowItem[] = [
    {
      label: '기준 수정',
      subLabel: user.criteriaText,
      onPress: () => console.log('기준 수정 이동'),
    },
    {
      label: '비밀번호 변경',
      onPress: () => console.log('비밀번호 변경 이동'),
    },
    {
      label: '알림 설정',
      onPress: () => console.log('알림 설정 이동'),
    },
    {
      label: '로그아웃',
      onPress: () => console.log('로그아웃'),
      hideIcon: true, 
    },
    {
      label: '회원 탈퇴',
      onPress: () => console.log('회원 탈퇴'),
      danger: true,
      hideIcon: true, 
    },
  ];

  return (
    <View style={styles.container}>

      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>로고</Text>
      </View>

      <Pressable style={styles.profileRow} onPress={() => console.log('프로필')}>
        <View style={styles.avatar} />

        <View style={styles.nameRow}>
          <Text style={styles.profileName}>{user.name}</Text>
          <ProviderIcon width={20} height={20} style={styles.providerIcon} />
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.grayscale[100]} />
      </Pressable>

      <View style={styles.dividerFull} />

      <View style={styles.listBox}>
        {rows.map((item, idx) => (
          <View key={item.label}>
            <SettingRow {...item} />
            {idx !== rows.length - 1 && <View style={styles.dividerInset} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grayscale[1000] },

  topBar: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayscale[800],
  },
  topBarTitle: {
    color: colors.grayscale[600],
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.grayscale[700],
    marginRight: 12,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    color: colors.grayscale[100],
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
  },
  providerIcon: {
    marginLeft: 7,
  },

  dividerFull: {
    height: 1,
    backgroundColor: colors.grayscale[900],
  },

  listBox: {
    borderTopWidth: 0,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  rowLeft: { flex: 1 },
  rowLabel: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    marginBottom: 5,
  },
  rowSub: {
    color: colors.grayscale[500],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
  dividerInset: {
    height: 1,
    backgroundColor: colors.grayscale[900],
    marginLeft: 16,
  },
  dangerText: {
    color: colors.grayscale[100], 
  },
});