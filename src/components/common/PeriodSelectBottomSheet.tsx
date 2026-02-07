import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { colors } from '../../constants/colors';
import Calendar from './Calendar';
import Button from './Button';

interface PeriodSelectBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string) => void;
}

type Step = 'start' | 'end';

const toKoreanDate = (dateString: string) => {
  if (!dateString) return 'YYYY.MM.DD';
  const [y, m, d] = dateString.split('-');
  return `${y}.${String(Number(m)).padStart(2, '0')}.${String(Number(d)).padStart(2, '0')}`;
};

export default function PeriodSelectBottomSheet({
  visible,
  onClose,
  onConfirm,
}: PeriodSelectBottomSheetProps) {
  const [step, setStep] = useState<Step>('start');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const normalizedRange = useMemo(() => {
  if (!startDate && !endDate) return { start: '', end: '' };
  if (startDate && !endDate) return { start: startDate, end: '' };

  if (startDate && endDate) {
    return startDate <= endDate
      ? { start: startDate, end: endDate }
      : { start: endDate, end: startDate };
  }

  return { start: '', end: endDate };
}, [startDate, endDate]);

  const canConfirm = useMemo(() => {
    return !!startDate && !!endDate;
  }, [startDate, endDate]);

  const handleDayPress = (date: string) => {
    if (step === 'start') {
      setStartDate(date);
      setEndDate('');
      setStep('end');
      return;
    }

    if (!startDate) {
      setStartDate(date);
      setEndDate('');
      setStep('end');
      return;
    }

    if (date < startDate) {
      setEndDate(startDate);
      setStartDate(date);
      setStep('end');
      return;
    }

    setEndDate(date);
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    
    const [start, end] = startDate <= endDate 
      ? [startDate, endDate] 
      : [endDate, startDate];
    
    onConfirm(start, end);
    handleClose();
  };

  const handleClose = () => {
    setStartDate('');
    setEndDate('');
    setStep('start');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.bottomSheet} onPress={(e) => e.stopPropagation()}>
          
          <View style={styles.handleBar} />

          <View style={styles.dateInputSection}>
            <Pressable
              style={[styles.dateBox, step === 'start' && styles.dateBoxActive]}
              onPress={() => setStep('start')}
            >
              <Text style={styles.dateText}>{toKoreanDate(startDate)}</Text>
            </Pressable>
            <Text style={styles.dateSeparator}>-</Text>
            <Pressable
              style={[styles.dateBox, step === 'end' && styles.dateBoxActive]}
              onPress={() => setStep('end')}
            >
              <Text style={styles.dateText}>{toKoreanDate(endDate)}</Text>
            </Pressable>
          </View>

          <View style={styles.calendarSection}>
            <Calendar 
              events={[]} 
              startDate={normalizedRange.start}
              endDate={normalizedRange.end}
              selecting={step}
              showToday={false}
              onDayPress={handleDayPress}
            />
          </View>

          <View style={styles.buttonSection}>
            <Button
              title="조회하기"
              onPress={handleConfirm}
              disabled={!canConfirm}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.grayscale[1000],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.grayscale[700],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  dateInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  dateBox: {
    flex: 1,
    height: 48,
    backgroundColor: colors.grayscale[900],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.grayscale[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBoxActive: {
    borderColor: colors.primary[500],
  },
  dateText: {
    color: colors.grayscale[100],
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  dateSeparator: {
    color: colors.grayscale[600],
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
  },
  calendarSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  buttonSection: {
    paddingHorizontal: 16,
  },
});
