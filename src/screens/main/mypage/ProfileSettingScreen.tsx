import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'; 
import * as ImagePicker from 'expo-image-picker'; 
import { colors } from '../../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

import TextField from '../../../components/common/TextField';
import Button from '../../../components/common/Button';
import PreProfileImg from '../../../../assets/ComponentsImage/preProfile.svg';

export default function ProfileSettingScreen() {
  const [nickname, setNickname] = useState('라스트컵');
  const [profileImage, setProfileImage] = useState<string | null>(null); 
  const [touched, setTouched] = useState(false);

  const isNicknameValid = nickname.length >= 2 && nickname.length <= 10;
  const nicknameError = touched && !isNicknameValid ? '2~10자 이내로 입력해 주세요.' : undefined;

  const onPickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],  
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); 
    }
  };

  const onSave = () => {
    console.log('저장하기', { nickname, profileImage });
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider} />

      <View style={styles.profileArea}>
        <Pressable onPress={onPickImage} style={styles.profilePress}>
 
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImg} />
          ) : (
            <PreProfileImg width={120} height={120} />
          )}
          
          <View style={styles.plusBadge}>
            <Ionicons name="add" size={20} color="white" />
          </View>
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
          isValid={isNicknameValid}
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

  profileArea: {
    alignItems: 'center',
    marginTop: 34,
  },
  profilePress: {
    position: 'relative',
  },
  profileImg: {
    width: 120,
    height: 120,
    borderRadius: 60, 
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary[500],
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.grayscale[1000],
  },
});
