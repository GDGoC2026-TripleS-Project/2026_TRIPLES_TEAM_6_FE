import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { useOptionGroup } from '../../hooks/useOptionGroup';

type ChipProps = {
  groupId?: string;
  id: string;
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

const Chip = ({ groupId, id, label, selected: selectedProp, onPress }: ChipProps) => {
  const group = groupId ? useOptionGroup(groupId) : null;
  const selected = selectedProp ?? (group ? group.chipSelected.has(id) : false);
  const handlePress = onPress ?? (group ? () => group.toggleChip(id) : undefined);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.base, selected ? styles.filled : styles.outlined]}
    >
      <Text
        style={[
          styles.text,
          selected ? styles.textFilled : styles.textOutlined,
          { fontFamily: selected ? 'Pretendard-SemiBold' : 'Pretendard-Regular' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: colors.grayscale[600],
  },
  filled: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  text: {
    fontSize: 16,
  },
  textOutlined: {
    color: colors.grayscale[300],
  },
  textFilled: {
    color: colors.grayscale[1000],
  },
});

export default Chip;
