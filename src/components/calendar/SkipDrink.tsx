import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../common/Button';

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

export default function SkipDrinkToggle({ value, onChange, disabled }: Props) {
  return (
    <View style={styles.wrap}>
      <Button
        title={value ? '✓ 음료를 마시지 않았어요.' : '음료를 마시지 않았어요.'}
        variant={value ? 'primary' : 'dark'}  
        disabled={disabled}
        onPress={() => onChange(!value)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginTop: 14,
    justifyContent: 'center'
  },
});
