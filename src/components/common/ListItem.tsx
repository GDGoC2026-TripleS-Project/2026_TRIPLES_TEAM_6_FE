import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

type ListItemProps = {
  title: string;
  subtitle?: string;
  onPress?: (() => void) | null;
};

const ListItem = ({ title, subtitle = '', onPress = null }: ListItemProps) => {
  return (
    <Pressable onPress={onPress ?? undefined} style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <MaterialIcons name="chevron-right" size={26} color={colors.grayscale[200]} />
    </Pressable>
  );
};

ListItem.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onPress: PropTypes.func,
};

ListItem.defaultProps = {
  subtitle: '',
  onPress: null,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 64,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.grayscale[900],
  },

  left: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 16,
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-SemiBold',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.grayscale[400],
    fontFamily: 'Pretendard-Regular',
  },
});

export default ListItem;