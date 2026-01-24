import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import PropTypes from "prop-types";
import { colors } from "../../constants/colors";

type TemperatureButtonProps = {
    value: 'ice' | 'hot';
    onChange: (next: 'ice' | 'hot') => void;
};

const TemperatureButton = ({ value, onChange}: TemperatureButtonProps) => {
    const isIce = value === 'ice';
    const isHot = value === 'hot';

    return (
  <View style={styles.wrap}>
    <Pressable
      onPress={() => onChange('ice')}
      style={[styles.item, isIce ? styles.active : styles.inactive]}
    >
      <Text style={[styles.text, isIce ? styles.textActive : styles.textInactive]}>Ice</Text>
    </Pressable>

    <View style={styles.separator} />

    <Pressable
      onPress={() => onChange('hot')}
      style={[styles.item, isHot ? styles.active : styles.inactive]}
    >
      <Text style={[styles.text, isHot ? styles.textActive : styles.textInactive]}>Hot</Text>
    </Pressable>
  </View>
);
};

TemperatureButton.propTypes = {
    value: PropTypes.oneOf(['ice', 'hot']).isRequired,
    onChange: PropTypes.func.isRequired,
};

TemperatureButton.defaultProps = {};

const styles = StyleSheet.create({
  wrap: {
  flexDirection: 'row',
  borderWidth: 0.5,
  borderColor: colors.grayscale[700],
  borderRadius: 8,
  overflow: 'hidden',
  backgroundColor: colors.grayscale[1000],
  height: 42,
},

item: {
  flex: 1,
  height: 41,
  alignItems: 'center',
  justifyContent: 'center',
},

separator: {
  width: 1,
  backgroundColor: colors.grayscale[700],
},

    active: {
        backgroundColor: colors.primary[1000],
        borderWidth: 1,
        borderColor: colors.primary[500],
        borderRadius: 8,
    },

    inactive: {
        backgroundColor: 'transparent',
    },

    text: {
        fontSize: 18,
        fontFamily: 'Pretendard-SemiBold',
    },

    textActive: {
        color: colors.grayscale[100],
    },

    textInactive: {
        color: colors.grayscale[100],
        opacity: 0.9,
    },
});

export default TemperatureButton;