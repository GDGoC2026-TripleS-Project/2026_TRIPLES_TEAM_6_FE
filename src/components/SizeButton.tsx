import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { colors } from '../constants/colors';

type SizeButtonProps = {
  title: string;
  volume: string;
  selected?: boolean;
  onPress?: (() => void) | null;
};

const SizeButton = ({ title, volume, selected = false, onPress = null }: SizeButtonProps) => {
  return (
    <Pressable
      onPress={onPress ?? undefined}
      style={[styles.wrap, selected ? styles.active : styles.inactive]}
    >
      <View style={styles.textGroup}>
        <Text style={[styles.title, selected ? styles.titleActive : styles.titleInactive]}>
          {title}
        </Text>
        <Text style={[styles.volume, selected ? styles.volumeActive : styles.volumeInactive]}>
          {volume}
        </Text>
      </View>
    </Pressable>
  );
};

SizeButton.propTypes = {
  title: PropTypes.string.isRequired,
  volume: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onPress: PropTypes.func,
};

SizeButton.defaultProps = {
  selected: false,
  onPress: null,
};

const styles = StyleSheet.create({
  wrap: {
    width: 126,
    height: 64,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.grayscale[700],
  },

  active: {
    backgroundColor: colors.primary[900],
    borderWidth: 1.2,
    borderColor: colors.primary[600],
  },

  textGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 19,
  },

  volume: {
    marginTop: 6,
    fontSize: 15,
  },

  titleInactive: {
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-Bold',
  },

  volumeInactive: {
    color: colors.grayscale[100],
    opacity: 0.8,
    fontFamily: 'Pretendard-Regular',
  },

  titleActive: {
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-SemiBold',
  },

  volumeActive: {
    color: colors.grayscale[100],
    opacity: 0.85,
    fontFamily: 'Pretendard-Regular',
  },
});

export default SizeButton;