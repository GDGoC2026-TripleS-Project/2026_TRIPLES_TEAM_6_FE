import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, PanResponder, Animated } from 'react-native';
import { colors } from '../../constants/colors';
import Calendar from './Calendar';
import Button from './Button';

interface DatePickerFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
}

const DatePickerField = ({ value, onChange, placeholder = '날짜 선택' }: DatePickerFieldProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempSelected, setTempSelected] = useState<string>('');
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: Animated.event(
        [null, { dy: translateY }],
        { useNativeDriver: true }
      ),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.8) {
          Animated.timing(translateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            handleCancel();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 150,
          }).start();
        }
      },
    })
  ).current;

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  const handleConfirm = () => {
    if (tempSelected) {
      const [y, m, d] = tempSelected.split('-').map(Number);
      onChange(new Date(y, m - 1, d));
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setTempSelected('');
    setIsModalVisible(false);
  };

  return (
    <>
      <Pressable style={styles.fieldContainer} onPress={() => setIsModalVisible(true)}>
        <Text style={[styles.fieldText, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>

      <Modal transparent visible={isModalVisible} animationType="fade" onRequestClose={handleCancel}>
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY }] },
            ]}
          >
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>

            <View style={styles.calendarContainer}>
              <Calendar
                startDate={tempSelected || formatDate(value).replace(/\./g, '-')}
                endDate={tempSelected || formatDate(value).replace(/\./g, '-')}
                onDayPress={setTempSelected}
                style={{marginTop: 25}}
                disableTodayHighlight={true}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button title="확인" onPress={handleConfirm} />
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.grayscale[900],
    justifyContent: 'center',
  },
  fieldText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.grayscale[100],
  },
  placeholder: {
    color: colors.grayscale[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.grayscale[900],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 14,
  },
  handleContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 25
  },
  handle: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayscale[700],
  },
  calendarContainer: {
    alignItems: 'center',
  },
  buttonContainer: {
    paddingTop: 16,
    marginBottom: 30
  },
});

export default DatePickerField;
