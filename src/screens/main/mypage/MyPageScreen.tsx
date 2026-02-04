import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabNavigationProp, RootStackParamList } from '../../../types/navigation';
import { useAuthStore } from '../../../app/features/auth/auth.store';
import { useUserStore } from '../../../app/features/user/user.store';

import GoogleLogin from '../../../../assets/ComponentsImage/GoogleLogin.svg';
import KakaoLogin from '../../../../assets/ComponentsImage/KakaoLogin.svg';
import AppleLogin from '../../../../assets/ComponentsImage/AppleLogin.svg';

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
  const navigation = useNavigation<MainTabNavigationProp<'Profile'>>();
  const logout = useAuthStore((s) => s.logout);
  const fetchMe = useUserStore((s) => s.fetchMe);
  const deleteMe = useUserStore((s) => s.deleteMe);
  const me = useUserStore((s) => s.me);
  const userError = useUserStore((s) => s.errorMessage);
  const rootNavigation =
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMe();
    }, [fetchMe])
  );

  type RootNoParam = {
    [K in keyof RootStackParamList]: RootStackParamList[K] extends undefined ? K : never;
  }[keyof RootStackParamList];

  const goRoot = (name: RootNoParam) => {
    if (rootNavigation) {
      rootNavigation.navigate(name);
    } else {
      navigation.navigate(name as never);
    }
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const handleDelete = async () => {
    setDeleteModalVisible(false);
    const ok = await deleteMe();
    if (!ok) {
      Alert.alert('회원 탈퇴 실패', userError ?? '다시 시도해 주세요.');
      return;
    }
    goRoot('DropCompleteScreen');
  };

  const providerRaw =
    me?.socialProvider ??
    me?.loginProvider ??
    me?.provider ??
    'kakao';
  const provider = providerRaw.toLowerCase() as LoginProvider;

  const user = {
    name: me?.nickname ?? '라스트컵',
    provider,
    profileImageUrl: me?.profileImageUrl,
    criteriaText: '카페인 400mg, 당류 25g',
  };

  const ProviderIcon = ProviderIconMap[user.provider] ?? KakaoLogin;

  const rows: RowItem[] = [
    {
      label: '기준 수정',
      subLabel: user.criteriaText,
      onPress: () => goRoot('GoalEditScreen'),
    },
    {
      label: '비밀번호 변경',
      onPress: () => goRoot('PasswordResetInputScreen'),
    },
    {
      label: '알림 설정',
      onPress: () => goRoot('AlarmSettingScreen'),
    },
    {
      label: '로그아웃',
      onPress: () => setLogoutModalVisible(true),
      hideIcon: true, 
    },
    {
      label: '회원 탈퇴',
      onPress: () => setDeleteModalVisible(true),
      danger: true,
      hideIcon: true, 
    },
  ];

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.profileRow}
        onPress={() => goRoot('ProfileSettingScreen')}
      >
        {user.profileImageUrl ? (
          <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar} />
        )}

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

      {/* 로그아웃 모달 */}
      <Modal
        transparent
        visible={logoutModalVisible}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setLogoutModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>로그아웃 하시겠습니까?</Text>
            </View>
            <View style={styles.modalButtonContainer}>
              <View style={styles.modalButtonDivider} />
              <Pressable 
                style={({ pressed }) => [
                  styles.modalHalfButton,
                  styles.modalConfirmButton,
                  pressed && styles.modalConfirmButtonPressed
                ]}
                onPress={handleLogout}
              >
                <Text style={styles.modalConfirmButtonText}>로그아웃</Text>
              </Pressable>
              <Pressable 
                style={({ pressed }) => [
                  styles.modalHalfButton,
                  styles.modalCancelButton,
                  pressed && styles.modalCancelButtonPressed
                ]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 회원 탈퇴 모달 */}
      <Modal
        transparent
        visible={deleteModalVisible}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setDeleteModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>탈퇴하시겠습니까?</Text>
              <Text style={styles.modalSubtitle}>
                탈퇴 시 기록은 복구할 수 없어요.
              </Text>
            </View>
            <View style={styles.modalButtonContainer}>
              <Pressable 
                style={({ pressed }) => [
                  styles.modalHalfButton,
                  styles.modalConfirmButton,
                  pressed && styles.modalConfirmButtonPressed
                ]}
                onPress={handleDelete}
              >
                <Text style={styles.modalConfirmButtonText}>탈퇴하기</Text>
              </Pressable>

              <View style={styles.modalButtonDivider} />

              <Pressable 
                style={({ pressed }) => [
                  styles.modalHalfButton,
                  styles.modalCancelButton,
                  pressed && styles.modalCancelButtonPressed
                ]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </Pressable>
              
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: colors.grayscale[900],
    borderRadius: 15,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  modalTitle: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 5,
  },
  modalSubtitle: {
    color: colors.grayscale[400],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    height: 56,
  },
  modalHalfButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.grayscale[800],
    marginBottom: 13,
    marginLeft: 3,
    marginRight: 10,
    borderRadius: 7,
  },
  modalCancelButtonPressed: {
    backgroundColor: colors.grayscale[700],
  },
  modalConfirmButton: {
    backgroundColor: colors.primary[500],
    marginBottom: 13,
    marginLeft: 10,
    marginRight: 3,
    borderRadius: 7,
  },
  modalConfirmButtonPressed: {
    backgroundColor: colors.primary[600],
  },
  modalButtonDivider: {
    width: 1,
    backgroundColor: colors.grayscale[900],
  },
  modalCancelButtonText: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  modalConfirmButtonText: {
    color: colors.grayscale[1000],
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
});
