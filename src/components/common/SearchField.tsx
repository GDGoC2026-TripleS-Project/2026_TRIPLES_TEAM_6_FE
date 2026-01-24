import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { colors } from '../../constants/colors';
import SearchIcon from '../../../assets/search.svg';

interface SearchFieldProps extends TextInputProps {}

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 370;

const SearchField = ({ ...props }: SearchFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const widthAnim = useRef(new Animated.Value(COLLAPSED_WIDTH)).current;

  const handlePress = () => {
    if (!isFocused) {
      setIsFocused(true);
      Animated.timing(widthAnim, {
        toValue: EXPANDED_WIDTH,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        inputRef.current?.focus();
      });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(widthAnim, {
      toValue: COLLAPSED_WIDTH,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  return (
    <Pressable onPress={handlePress} style={{ zIndex: 1 }}>
      <Animated.View
        style={[
          styles.container,
          {
            width: widthAnim,
            paddingHorizontal: isFocused ? 16 : 10,
          },
        ]}
      >
        <SearchIcon width={20} height={20} />

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            !isFocused && styles.hiddenInput,
          ]}
          placeholderTextColor={colors.grayscale[600]}
          onBlur={handleBlur}
          editable={isFocused}
          pointerEvents={isFocused ? 'auto' : 'none'}
          {...props}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayscale[900],
    borderRadius: 40,
    gap: 6,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: colors.grayscale[100],
    padding: 0,
  },
  hiddenInput: {
    width: 0,
    opacity: 0,
  },
});

export default SearchField;
