import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { colors } from '../../constants/colors';

type TabKey = string;

type TabProps = {
  tabs: { key: TabKey; label: string }[];
  value: TabKey;
  onChange: (next: TabKey) => void;
};

function Tab({ tabs, value, onChange }: TabProps) {
  return (
    <View style={styles.container}>
      {tabs.map((t) => {
        const active = t.key === value;

        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={styles.item}
          >
            <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
              {t.label}
            </Text>
            <View style={[styles.indicator, active ? styles.indicatorActive : styles.indicatorInactive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

Tab.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

Tab.defaultProps = {};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.grayscale[1000],
    borderBottomWidth: 1,
    borderBottomColor: colors.grayscale[800],
    marginHorizontal: 10,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },

  label: {
    fontSize: 15,
    marginBottom: 0,
  },

  labelInactive: {
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-Regular',
  },

  labelActive: {
    color: colors.primary[500],
    fontFamily: 'Pretendard-SemiBold',
  },

  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },

  indicatorActive: {
    backgroundColor: colors.primary[500],
  },

  indicatorInactive: {
    backgroundColor: 'transparent',
  },
});

export default Tab;
