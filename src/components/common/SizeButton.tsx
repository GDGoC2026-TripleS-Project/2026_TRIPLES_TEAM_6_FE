import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

type SizeButtonProps = {
  title: string;
  volume: string;
  selected?: boolean;
  onPress?: (() => void) | null;
};

const SizeButton = ({
  title,
  volume,
  selected = false,
  onPress = null,
}: SizeButtonProps) => {
  return (
    <Pressable
      onPress={onPress ?? undefined}
      style={[
        styles.wrap,
        selected ? styles.active : styles.inactive,
      ]}
    >
      <View style={styles.textGroup}>
        <Text
          style={[
            styles.title,
            selected ? styles.textActive : styles.textInactive,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.volume,
            selected ? styles.textActive : styles.textInactiveSecondary,
          ]}
        >
          {volume}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8, 
    alignItems: 'center',
    justifyContent: 'center',
  },

  inactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.grayscale[700],
  },

  active: {
    backgroundColor: colors.primary[1000],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },

  textGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },

  volume: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },

  textActive: {
    color: colors.grayscale[100],
  },

  textInactive: {
    color: colors.grayscale[100],
    opacity: 0.9,
  },

  textInactiveSecondary: {
    color: colors.grayscale[100],
    opacity: 0.7,
  },
});

export default SizeButton;
