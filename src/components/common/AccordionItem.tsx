import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
  onToggle?: (expanded: boolean) => void;
};

const AccordionItem = ({ title, children, onToggle }: AccordionItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const next = expanded ? 0 : 1;

    Animated.timing(anim, {
      toValue: next,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setExpanded(!expanded);
    onToggle?.(!expanded);
  };

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const maxHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.header} onPress={toggle}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <MaterialIcons name="keyboard-arrow-down" size={26} color={colors.grayscale[200]} />
        </Animated.View>
      </Pressable>

      <Animated.View style={[styles.body, { maxHeight, opacity: anim }]}>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  header: {
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-SemiBold',
  },
  body: {
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.grayscale[700],
  },
});

export default AccordionItem;

