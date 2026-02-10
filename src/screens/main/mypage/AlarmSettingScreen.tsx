import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../../../constants/colors';
import ToggleSwitch from '../../../components/common/ToggleSwitch';
import Button from '../../../components/common/Button';
import { useUserStore } from '../../../app/features/user/user.store';
import { storage } from '../../../utils/storage';
import { storageKeys } from '../../../constants/storageKeys';

import { syncNotifications } from '../../../notifications/syncNotifications';

type AlarmKey = 'record' | 'daily';

type AlarmState = {
  recordEnabled: boolean;
  recordTime: Date;
  dailyEnabled: boolean;
  dailyTime: Date;
};

const createTime = (hour: number, minute: number) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
};

const formatKoreanTime = (date: Date) => {
  const h = date.getHours();
  const m = date.getMinutes();
  const isAM = h < 12;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(m).padStart(2, '0');
  return `${isAM ? '오전' : '오후'} ${hour12}:${mm}`;
};

const sameTime = (a: Date, b: Date) =>
  a.getHours() === b.getHours() && a.getMinutes() === b.getMinutes();

const toDateFromHHmm = (time: string, fallbackHour: number, fallbackMinute: number) => {
  const d = createTime(fallbackHour, fallbackMinute);
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return d;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const toHHmm = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export default function AlarmSettingScreen() {
  const {
    fetchNotificationSettings,
    updateNotificationSettings,
    notificationSettings,
    isLoading,
    errorMessage,
  } = useUserStore();

  const [state, setState] = useState<AlarmState>({
    recordEnabled: false,
    recordTime: createTime(14, 0),
    dailyEnabled: false,
    dailyTime: createTime(21, 0),
  });

  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const [initialState, setInitialState] = useState<AlarmState | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<AlarmKey>('record');

  const activeDate = activeKey === 'record' ? state.recordTime : state.dailyTime;

  useEffect(() => {
    fetchNotificationSettings();
    (async () => {
      const seen = await storage.get(storageKeys.alarmFirstSeen);
      setIsFirstVisit(seen !== 'true');
    })();
  }, []);

  useEffect(() => {
    if (isFirstVisit === null) return;

    if (isFirstVisit || !notificationSettings) {
      const defaultState: AlarmState = {
        recordEnabled: false,
        recordTime: createTime(14, 0),
        dailyEnabled: false,
        dailyTime: createTime(21, 0),
      };

      setState(defaultState);
      setInitialState(defaultState);

      if (isFirstVisit) {
        void storage.set(storageKeys.alarmFirstSeen, 'true');
        setIsFirstVisit(false);
      }
      return;
    }

    const synced: AlarmState = {
      recordEnabled: notificationSettings.recordEnabled,
      recordTime: toDateFromHHmm(notificationSettings.recordTime, 14, 0),
      dailyEnabled: notificationSettings.dailyEnabled,
      dailyTime: toDateFromHHmm(notificationSettings.dailyTime, 21, 0),
    };

    setState(synced);
    setInitialState(synced);
  }, [notificationSettings, isFirstVisit]);

  const hasChanges = useMemo(() => {
    if (!initialState) return false;
    return (
      state.recordEnabled !== initialState.recordEnabled ||
      state.dailyEnabled !== initialState.dailyEnabled ||
      !sameTime(state.recordTime, initialState.recordTime) ||
      !sameTime(state.dailyTime, initialState.dailyTime)
    );
  }, [state, initialState]);

  const openPicker = (key: AlarmKey) => {
    setActiveKey(key);
    setPickerOpen(true);
  };

  const closePicker = () => setPickerOpen(false);

  const onPick = (_: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === 'android') setPickerOpen(false);
    if (picked) {
      setState((prev) => ({
        ...prev,
        [activeKey === 'record' ? 'recordTime' : 'dailyTime']: picked,
      }));
    }
  };

  const toggleEnabled = (key: AlarmKey, next: boolean) => {
    setState((prev) => ({
      ...prev,
      [key === 'record' ? 'recordEnabled' : 'dailyEnabled']: next,
    }));
  };

  const onSave = async () => {
    const payload = {
      recordEnabled: state.recordEnabled,
      recordTime: toHHmm(state.recordTime),
      dailyEnabled: state.dailyEnabled,
      dailyTime: toHHmm(state.dailyTime),
    };

    const success = await updateNotificationSettings(payload);

    if (success) {
      setInitialState(state);

      await syncNotifications(state);

      Alert.alert('저장 완료', '알림 설정이 업데이트됐어요.');
    } else {
      Alert.alert('저장 실패', errorMessage ?? '다시 시도해 주세요.');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <AlarmSection
          title="기록 유도 알림"
          desc="설정한 시간에 음료 기록을 유도하는 알림을 받아요."
          enabled={state.recordEnabled}
          timeLabel={formatKoreanTime(state.recordTime)}
          onToggle={(v) => toggleEnabled('record', v)}
          onPressTime={() => openPicker('record')}
          isPickerActive={pickerOpen && activeKey === 'record'}
        />

        <View style={{ height: 18 }} />

        <AlarmSection
          title="하루 마무리 알림"
          desc="하루의 기록을 확인하고 마무리하는 알림을 받아요."
          enabled={state.dailyEnabled}
          timeLabel={formatKoreanTime(state.dailyTime)}
          onToggle={(v) => toggleEnabled('daily', v)}
          onPressTime={() => openPicker('daily')}
          isPickerActive={pickerOpen && activeKey === 'daily'}
        />
      </View>

      <View style={styles.bottom}>
        <Button
          title="저장하기"
          disabled={!hasChanges || isLoading}
          onPress={onSave}
          backgroundColor={colors.primary[500]}
        />
      </View>

      {Platform.OS === 'android' && pickerOpen && (
        <DateTimePicker value={activeDate} mode="time" onChange={onPick} />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={pickerOpen} transparent animationType="slide">
          <Pressable style={styles.modalBackdrop} onPress={closePicker} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <DateTimePicker
              value={activeDate}
              mode="time"
              display="spinner"
              onChange={onPick}
              themeVariant="dark"
            />
            <View style={styles.sheetButton}>
              <Button title="확인" onPress={closePicker} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function AlarmSection({
  title,
  desc,
  enabled,
  timeLabel,
  onToggle,
  onPressTime,
  isPickerActive,
}: {
  title: string;
  desc: string;
  enabled: boolean;
  timeLabel: string;
  onToggle: (next: boolean) => void;
  onPressTime: () => void;
  isPickerActive: boolean;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDesc}>{desc}</Text>
        </View>
        <ToggleSwitch value={enabled} onValueChange={onToggle} />
      </View>

      {enabled && (
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>알림 시간</Text>
          <Pressable
            onPress={onPressTime}
            style={[
              styles.timeInput,
              isPickerActive && styles.timeInputActive,
            ]}
          >
            <Text style={styles.timeText}>{timeLabel}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  content: { paddingTop: 18, flex: 1 },
  section: {
    borderRadius: 14,
    backgroundColor: colors.grayscale[1000],
    padding: 16,
  },
  sectionTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  sectionTitle: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 5,
  },
  sectionDesc: {
    color: colors.grayscale[500],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    lineHeight: 16,
  },
  timeBlock: { marginTop: 14, gap: 8 },
  timeLabel: {
    color: colors.grayscale[200],
    fontSize: 12,
    fontFamily: 'Pretendard-SemiBold',
  },
  timeInput: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.grayscale[800],
    borderWidth: 1,
    borderColor: colors.grayscale[800],
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  timeInputActive: { borderColor: colors.primary[500] },
  timeText: {
    color: colors.grayscale[200],
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
  },
  bottom: { paddingBottom: 38 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: colors.grayscale[900],
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayscale[700],
    marginBottom: 12,
  },
  sheetButton: { marginTop: 14, marginBottom: 16 },
});
