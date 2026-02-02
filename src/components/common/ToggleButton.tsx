import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SvgProps } from 'react-native-svg';

interface ToggleButtonProps {
  image1: React.FC<SvgProps>;
  image2: React.FC<SvgProps>;
  initialImage?: 1 | 2;
  onToggle?: (isImage2: boolean) => void;
  onPress?: () => void;
}

const ToggleButton = ({
  image1: Image1,
  image2: Image2,
  initialImage = 1,
  onToggle,
  onPress,
}: ToggleButtonProps) => {
  const [isImage2, setIsImage2] = useState(initialImage === 2);

  const toggleImage = () => {
    setIsImage2(prev => {
      const next = !prev;
      onToggle?.(next);
      return next;
    });
  };

  const CurrentImage = isImage2 ? Image2 : Image1;

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleImage} onPressIn={onPress}>
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