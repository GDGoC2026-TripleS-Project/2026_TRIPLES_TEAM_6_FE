import React, { useState } from "react";
import { TextInput, StyleSheet, TextInputProps, View, Text } from "react-native";
import { colors } from "../../constants/colors";

interface TextFieldProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  isValid?: boolean;
  hideBorder?: boolean;
  style?: object;
}

const TextField = ({ value, onChangeText, error, isValid, hideBorder, style, onFocus, onBlur, ...props }: TextFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return "#FF0000";
    if (isValid) return colors.primary[500];
    if (isFocused) return colors.primary[500];
    return colors.grayscale[800];
  };

  const getTextColor = () => {
    if (isFocused || value) return colors.grayscale[100];
    return colors.grayscale[600];
  };

  return (
    <View style={{ width: "100%" }}>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[
            styles.textInput,
            style,
            {
              borderWidth: hideBorder === false ? 1 : 0,
              borderColor: getBorderColor(),
              color: getTextColor(),
            },
          ]}
          placeholderTextColor={colors.grayscale[600]}
          value={value}
          onChangeText={onChangeText}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e); 
          }}
          {...props}
        />
        {isValid && !error && value && (
          <View style={styles.validIcon}>
            <Text style={styles.validIconText}>✓</Text>
          </View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: colors.grayscale[900],
    fontSize: 16,
    fontFamily: "Pretendard-Regular",
  },
  errorText: {
    color: "#FF0000",
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    marginTop: 4,
  },
  validIcon: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  validIconText: {
    color: colors.primary[500],
    fontSize: 20,
    fontFamily: "Pretendard-Bold",
  },
});

export default TextField;
