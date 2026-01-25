import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../constants/colors';
import Stepper from './Stteper';
import { useOptionGroup } from '../../hooks/useOptionGroup';

interface StteperItemProps {
  groupId: string;
  id: string;
  optionTitle: string;
}

const StteperItem = ({ groupId, id, optionTitle }: StteperItemProps) => {
  const { stepperCounts, setStepper } = useOptionGroup(groupId);
  const value = stepperCounts[id] ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{optionTitle}</Text>
      <Stepper value={value} onChange={v => setStepper(id, v)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 47,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 14,
    color: colors.grayscale[100],
    fontFamily: 'Pretendard-Medium',
  },
});

export default StteperItem;
