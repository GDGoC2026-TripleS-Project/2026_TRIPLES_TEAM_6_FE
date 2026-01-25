import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { useRef, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useOptionGroup } from '../../hooks/useOptionGroup';

type AccordionItemProps = {
  id: string;
  title: string;
  children: React.ReactNode;
};

const AccordionItem = ({ id, title, children }: AccordionItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const { hasChanged } = useOptionGroup(id);

  const toggle = () => {
    Animated.timing(anim, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setExpanded(prev => !prev);
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
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {hasChanged && <View style={styles.dot} />}
        </View>

        <Animated.View style={{ transform: [{ rotate }] }}>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={26}
            color={colors.grayscale[200]}
          />
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
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-SemiBold',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary[500],
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
