import React, { useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../../constants/colors';
import Button from './Button';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = Math.min(520, SCREEN_H * 0.62);

const ESPRESSO_MG = 75;
const SUGAR_CUBE_G = 3;

const formatUnits = (value: number) => String(Math.round(value));

type NutritionRow = { label: string; value: number; unit: string; note?: string };

export type DrinkLike = {
  id: string;
  brandName: string;
  menuName: string;
  caffeineMg?: number;
  sugarG?: number;
  calorieKcal?: number;
  sodiumMg?: number;
  proteinG?: number;
  fatG?: number;
};

type Props = {
  visible: boolean;
  drink: DrinkLike | null;
  onClose: () => void;
  onEdit?: (drink: DrinkLike) => void;
  onDelete?: (drink: DrinkLike) => void;
};

const formatNumber = (n?: number) => (typeof n === 'number' ? n : 0);

export default function DrinkDetailSheet({
  visible,
  drink,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    if (!visible) return;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SHEET_H + 40, 0],
  });

  const rows: NutritionRow[] = useMemo(() => {
    if (!drink) return [];
    return [
      {
        label: '카페인',
        value: formatNumber(drink.caffeineMg),
        unit: 'mg',
        note: '에스프레소 약 2잔',
      },
      {
        label: '당류',
        value: formatNumber(drink.sugarG),
        unit: 'g',
        note: '각설탕 약 1개',
      },
      { label: '칼로리', value: formatNumber(drink.calorieKcal), unit: 'kcal' },
      { label: '나트륨', value: formatNumber(drink.sodiumMg), unit: 'mg' },
      { label: '단백질', value: formatNumber(drink.proteinG), unit: 'g' },
      { label: '지방', value: formatNumber(drink.fatG), unit: 'g' },
    ];
  }, [drink]);

  const handleClose = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  if (!visible || !drink) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>

      <Pressable style={styles.backdrop} onPress={handleClose} />


      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.brand}>{drink.brandName}</Text>
          <Text style={styles.title}>{drink.menuName}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.table}>
          {rows.map((r, idx) => (
            <React.Fragment key={r.label}>
              <View style={styles.row}>
                <Text style={styles.left}>{r.label}</Text>

                <View style={styles.right}>
                  <Text style={styles.value}>
                    {r.value}
                    <Text style={styles.unit}>{r.unit}</Text>
                  </Text>
                  {!!r.note && <Text style={styles.note}>{r.note}</Text>}
                </View>
              </View>
              {idx < rows.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.bottomBtns}>
          <View style={{ flex: 1 }}>
            <Button
              title="수정"
              onPress={() => onEdit?.(drink)}
              backgroundColor={colors.primary[500]}
              pressedBackgroundColor={colors.primary[500]}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1, }}>
            <Button
              title="삭제"
              onPress={() => onDelete?.(drink)}
              variant="dark"
              backgroundColor={colors.grayscale[800] ?? colors.grayscale[800]}
              pressedBackgroundColor={colors.grayscale[800]}
            />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_H,
    backgroundColor: colors.grayscale[900],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayscale[700],
    marginBottom: 14,
  },
  header: {
    gap: 6,
  },
  brand: {
    color: colors.grayscale[400],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },
  title: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.grayscale[800] ?? colors.grayscale[800],
    marginTop: 16,
    marginBottom: 12,
  },
  table: {
    gap: 14,
    paddingTop: 6,
    marginBottom: 24
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.grayscale[800],
  },
  left: {
    color: colors.grayscale[200],
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    paddingVertical: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  value: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  unit: {
    color: colors.grayscale[200],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
  note: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },
  bottomBtns: {
    flexDirection: 'row',
    marginBottom: 30,
  },
});
