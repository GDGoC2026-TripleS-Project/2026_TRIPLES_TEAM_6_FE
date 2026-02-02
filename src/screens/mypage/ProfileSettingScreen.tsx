import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

import TextField from '../../components/common/TextField';
import Button from '../../components/common/Button';

import PreProfileImg from '../../../assets/ComponentsImage/preProfile.svg';

// 네비게이션
// import { useNavigation } from '@react-navigation/native';

export default function ProfileSettingScreen() {
  // const navigation = useNavigation();

  const [nickname, setNickname] = useState('');
  const [touched, setTouched] = useState(false);

const trimmed = nickname.trim();

  const isNicknameValid = 
  nickname.length >= 2 && nickname.length <= 10;

  const nicknameError =
  touched && trimmed.length > 0 && !isNicknameValid
    ? '2~10자 이내로 입력해 주세요.'
    : undefined;

  const canSave = !nicknameError;

  const onPickImage = () => {
    console.log('프로필 이미지 변경');
    // TODO: 이미지 피커 연결 (expo-image-picker 등)
  };

  const onSave = () => {
    console.log('저장하기', { nickname });
    // TODO: 저장 API 호출 or store 업데이트
    // navigation.goBack();
  };

  return (
    <View style={styles.container}>

      <View style={styles.divider} />

      <View style={styles.profileArea}>
        <Pressable onPress={onPickImage} style={styles.profilePress}>
          <PreProfileImg width={120} height={120} />
        </Pressable>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>닉네임</Text>

        <TextField
  value={nickname}
  onChangeText={(text) => {
    setNickname(text);
    if (!touched) setTouched(true); 
  }}
  onBlur={() => setTouched(true)}
  isValid={trimmed.length > 0 && isNicknameValid} 
  error={nicknameError}
/>

        <Text style={styles.helperText}>2~10자 이내로 언제든지 변경할 수 있습니다.</Text>
      </View>

      <View style={styles.bottom}>
        <Button title="저장하기" onPress={onSave} disabled={!isNicknameValid} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  backText: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
  },

  headerTitle: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },

  headerRightSpace: {
    width: 44,
    height: 44,
  },

  divider: {
    height: 1,
    backgroundColor: colors.grayscale[900],
    marginTop: 10,
  },

  profileArea: {
    alignItems: 'center',
    marginTop: 34,
  },

  profilePress: {
    borderRadius: 999,
  },

  form: {
    marginTop: 32,
  },

  label: {
    color: colors.grayscale[100],
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    marginBottom: 10,
    marginTop: 40,
  },

  textField: {
    width: '100%', 
  },

  helperText: {
    marginTop: 10,
    color: colors.grayscale[600],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },

  bottom: {
    marginTop: 'auto',
    paddingBottom: 60,
  },
});
