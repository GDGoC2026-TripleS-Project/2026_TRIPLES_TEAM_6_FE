import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SvgProps } from 'react-native-svg';

interface ToggleButtonProps {
  image1: React.FC<SvgProps>;
  image2: React.FC<SvgProps>;
  isOn?: boolean;
  initialImage?: 1 | 2;
  onToggle?: (isImage2: boolean) => void;
  onPress?: () => void;
}

const ToggleButton = ({
  image1: Image1,
  image2: Image2,
  isOn,
  initialImage = 1,
  onToggle,
  onPress,
}: ToggleButtonProps) => {
  const [internalOn, setInternalOn] = useState(initialImage === 2);
  const isControlled = isOn !== undefined;
  const effectiveOn = isControlled ? isOn : internalOn;

  const toggleImage = () => {
    const next = !effectiveOn;
    if (!isControlled) setInternalOn(next);
    onToggle?.(next);
    onPress?.();
  };

  const CurrentImage = effectiveOn ? Image2 : Image1;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggleImage}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <CurrentImage width={24} height={24} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ToggleButton;
