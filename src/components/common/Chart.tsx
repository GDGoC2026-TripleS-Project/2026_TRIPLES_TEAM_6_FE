import { StyleSheet, View, Text } from "react-native";
import { colors } from "../../constants/colors";

interface ChartProps {
  currentIntake?: number;
  dailyLimit?: number;
  title?: string;
  unit?: string;
}

const Chart = ({ 
  currentIntake = 0, 
  dailyLimit = 400, 
  title = "카페인",
  unit = "mg" 
}: ChartProps) => {
  const maxValue = title === "당류" ? 37.5 : 600;
  const displayUnit = title === "당류" ? "g" : unit;
  
  const intakePercent = Math.min(((currentIntake) / maxValue) * 100, 100);
  const limitPercent = currentIntake > 0 
    ? Math.max(Math.min((dailyLimit / currentIntake) * intakePercent, 100), 4)
    : Math.max(Math.min(((dailyLimit) / maxValue) * 100, 100), 4);

  const getScaleValues = () => {
    if (title === "당류") {
      return ['37.5g', '25g', '12.5g'];
    }
    return ['600mg', '400mg', '200mg'];
  };

  const scaleValues = getScaleValues();

  return(
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title} 섭취량</Text>
        <Text style={styles.subTitle}>{currentIntake}{displayUnit}</Text>
      </View>
      <View style={styles.chartWrapper}>
        <View style={styles.chartContainer}>
          <View>
            <View style={styles.barsContainer}>
            <View style={{gap: 3,}}>
              <Text style={styles.barLabel}>{dailyLimit}{displayUnit}</Text>
              <View style={[styles.bar, styles.limitBar, { height: `${limitPercent}%` }]} />
            </View>
            <View style={[styles.bar, styles.intakeBar, { height: `${intakePercent}%` }]} />
          </View>
           <View style={{flexDirection: 'row'}}>
            <View style={styles.line}/>
          </View>
          </View>
          <View style={styles.labelsContainer}>
            <Text style={styles.barLabel}>내 기준량</Text>
            <Text style={styles.barLabel}>내 섭취량</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex: 1,
    flexDirection: 'column',
    textAlign: 'left',
    gap: 20,
    width: 177
  },
  title: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: colors.grayscale[100]
  },
  subTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.primary[500],
  },
  chartWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
  },
  chartContainer : {
    height: 220,
    width: '100%',
    justifyContent: 'space-between',
    position: 'relative',
    gap: 4,
  },
  line : {
    flex: 1,
    height: 1,
    backgroundColor: colors.grayscale[800]
  },
  chartText: {
    fontSize: 8,
    color: colors.grayscale[700]
  },
  barsContainer: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  bar: {
    width: 36,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  limitBar: {
    backgroundColor: colors.grayscale[700],
  },
  intakeBar: {
    backgroundColor: colors.primary[500],
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  barLabel: {
    fontSize: 8,
    fontFamily: 'Pretendard-Regular',
    color: colors.grayscale[300],
    textAlign: 'center',
  }
})

export default Chart;