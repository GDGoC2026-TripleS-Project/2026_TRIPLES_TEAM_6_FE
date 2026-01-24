import React, { useState } from 'react';
import { View, Image, StyleSheet, ImageSourcePropType, Pressable } from 'react-native';

interface ToggleButtonProps {
  image1: ImageSourcePropType;
  image2: ImageSourcePropType;
  initialImage?: 1 | 2;
  onToggle?: (isImage2: boolean) => void;
  onPress?: () => void;
}

const ToggleButton = ({
  image1,
  image2,
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

  const currentImage = isImage2 ? image2 : image1;

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleImage} onPressIn={onPress}>
        <Image source={currentImage} style={styles.image} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default ToggleButton;

