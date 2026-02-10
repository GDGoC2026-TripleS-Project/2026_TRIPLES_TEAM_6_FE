import { Text, View, StyleSheet } from 'react-native';
import Chip from './Chip';
import { colors } from '../../constants/colors';
import { useOptionGroup } from '../../hooks/useOptionGroup';
import { useOptionStore } from '../../store/useOptionStore';

type ChipOption = {
  id: string;
  label: string;
};

type ChipOptionsProps = {
  groupId: string;  
  options: ChipOption[];
  optionText?: string;
  singleSelect?: boolean;
};

const ChipOptions = ({
  groupId,
  options,
  optionText = '(기본 or 추가 옵션 텍스트)',
  singleSelect = false,
}: ChipOptionsProps) => {
  const group = useOptionGroup(groupId);
  const setGroupInfo = useOptionStore(state => state.setGroupInfo);

  const handleSingleSelect = (id: string) => {
    const next = new Set<string>();
    if (!group.chipSelected.has(id)) {
      next.add(id);
    }
    setGroupInfo(groupId, { chipSelected: next });
  };

  return (
    <>
      <Text style={styles.optionText}>{optionText}</Text>
      <View style={styles.chipContainer}>
        {options.map(option => (
          <Chip
            key={option.id}
            groupId={groupId}
            id={option.id}
            label={option.label}
            selected={singleSelect ? group.chipSelected.has(option.id) : undefined}
            onPress={singleSelect ? () => handleSingleSelect(option.id) : undefined}
          />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  optionText: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    marginBottom: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
});

export default ChipOptions;
