import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text } from "react-native";
import { colors } from "../../constants/colors";

interface TextFieldProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  isValid?: boolean;
  style?: object;
}

const TextField = ({ value, onChangeText, error, isValid, style, ...props }: TextFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return '#FF0000';
    if (isValid) return colors.primary[500];
    if (isFocused) return colors.primary[500]; 
    if (value) return 'transparent';
    return 'transparent';
  };

  const getTextColor = () => {
    if (isFocused || value) return colors.grayscale[100]; 
    return colors.grayscale[600];
  };

  return (
    <View>
      <TextInput 
        style={[
          styles.textInput,
          style,
          {
            borderWidth: 1,
            borderColor: getBorderColor(),
            color: getTextColor(),
          }
        ]}
        placeholderTextColor={colors.grayscale[600]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    width: 370,
    height: 56,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: colors.grayscale[900],
    fontSize: 16,
    fontWeight: '400',
  },
  errorText: {
    color: '#FF0000',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  }
});

export default TextField;
