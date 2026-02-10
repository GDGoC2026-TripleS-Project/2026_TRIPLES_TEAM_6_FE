import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';
import SearchIcon from '../../../assets/search.svg';

interface SearchFieldProps extends TextInputProps {
  variant?: 'animated' | 'default';
  onChangeText?: (text: string) => void;
  value?: string;
}

const COLLAPSED_WIDTH = 40;
const EXPANDED_PADDING = 16;
const COLLAPSED_PADDING = 10;
const HORIZONTAL_MARGIN = 32;

const SearchField = ({
  variant = 'default',
  onChangeText,
  value,
  onFocus,
  onBlur,
  ...props
}: SearchFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { width: screenWidth } = useWindowDimensions();
  
  const EXPANDED_WIDTH = screenWidth - HORIZONTAL_MARGIN;

  const widthAnim = useRef(
    new Animated.Value(variant === 'animated' ? COLLAPSED_WIDTH : EXPANDED_WIDTH)
  ).current;

  const paddingAnim = useRef(
    new Animated.Value(variant === 'animated' ? COLLAPSED_PADDING : EXPANDED_PADDING)
  ).current;

  const handlePress = () => {
    if (variant === 'animated' && !isFocused) {
      setIsFocused(true);
      Animated.parallel([
        Animated.timing(widthAnim, {
          toValue: EXPANDED_WIDTH,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(paddingAnim, {
          toValue: EXPANDED_PADDING,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start(() => {
        inputRef.current?.focus();
      });
    } else if (variant === 'default') {
      inputRef.current?.focus();
    }
  };

  const handleBlur = (event: any) => {
    if (variant === 'animated') {
      setIsFocused(false);
      Animated.parallel([
        Animated.timing(widthAnim, {
          toValue: COLLAPSED_WIDTH,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(paddingAnim, {
          toValue: COLLAPSED_PADDING,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }
    onBlur?.(event);
  };

  const isAnimatedVariant = variant === 'animated';
  const iconSize = 24;
  const showValueDot =
    isAnimatedVariant && !isFocused && !!(value && value.trim().length > 0);

  return (
    <Pressable onPress={handlePress} style={styles.wrapper}>
      {showValueDot && <View style={styles.valueDot} pointerEvents="none" />}
      
      <Animated.View
        style={[
          styles.container,
          {
            width: isAnimatedVariant ? widthAnim : EXPANDED_WIDTH,
            paddingHorizontal: isAnimatedVariant ? paddingAnim : EXPANDED_PADDING,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <SearchIcon width={iconSize} height={iconSize} />
        </View>

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            isAnimatedVariant && !isFocused && styles.hiddenInput,
          ]}
          placeholderTextColor={colors.grayscale[600]}
          onBlur={isAnimatedVariant ? handleBlur : onBlur}
          onFocus={onFocus}
          editable={isAnimatedVariant ? isFocused : true}
          pointerEvents={isAnimatedVariant && !isFocused ? 'none' : 'auto'}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 1,
  },
  container: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayscale[900],
    borderRadius: 20,
    gap: 6,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Pretendard-Regular',
    color: colors.grayscale[100],
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  hiddenInput: {
    width: 0,
    opacity: 0,
  },
  valueDot: {
    position: 'absolute',
    zIndex: 2,
    top: 3,
    left: 31,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
  },
});

export default SearchField;