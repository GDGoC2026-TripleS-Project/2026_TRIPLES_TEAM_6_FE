import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../../../constants/colors';
import Button from '../../../components/common/Button';
import { useGoalStore } from '../../../store/goalStore';

type Unit = 'mg' | 'g';

type GoalSectionProps = {
  title: string;
  subtitle: string;
  unit: Unit;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function GoalSection({
  title,
  subtitle,
  unit,
  min,
  max,
  value,
  onChange,
}: GoalSectionProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(String(value));
  const inputRef = useRef<TextInput>(null);

  const valueLabel = useMemo(() => `${Math.round(value)}${unit}`, [value, unit]);

  const openEdit = () => {
    setText(String(Math.round(value)));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeEdit = () => {
    setEditing(false);
    Keyboard.dismiss();

    const parsed = Number(text);
    if (Number.isFinite(parsed)) {
      onChange(clamp(parsed, min, max));
    } else {
      setText(String(Math.round(value)));
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>

      <Pressable
        onPress={openEdit}
        style={({ pressed }) => [
          styles.valueBox,
          pressed && { opacity: 0.92 },
          editing && styles.valueBoxActive,
        ]}
      >
        {editing ? (
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={(t) => setText(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={closeEdit}
            onBlur={closeEdit}
            style={styles.valueInput}
            placeholderTextColor={colors.grayscale[500]}
          />
        ) : (
          <Text style={styles.valueText}>{valueLabel}</Text>
        )}
      </Pressable>

      <View style={styles.minMaxTopRow}>
        <Text style={styles.minMaxText}>
          {min}
          {unit}
        </Text>
        <Text style={styles.minMaxText}>
          {max}
          {unit}
        </Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary[500]}
        maximumTrackTintColor={colors.grayscale[700]}
        thumbTintColor={'#fff'}
      />
    </View>
  );
}

export default function GoalEditScreen({ navigation }: { navigation?: any }) {
  const initialCaffeine = useGoalStore((s) => s.caffeine);
  const initialSugar = useGoalStore((s) => s.sugar);

  const [caffeine, setCaffeine] = useState(initialCaffeine);
  const [sugar, setSugar] = useState(initialSugar);

  const initialGoalsRef = useRef({
    caffeine: initialCaffeine,
    sugar: initialSugar,
  });
  const hasChanges =
    caffeine !== initialGoalsRef.current.caffeine ||
    sugar !== initialGoalsRef.current.sugar;

  const onSave = () => {
    // TODO: 저장 로직 연결 (zustand / api)
    navigation?.goBack?.();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >

      <View style={styles.content}>
        <GoalSection
          title="카페인 기준"
          subtitle="성인 카페인 권장량 400mg"
          unit="mg"
          min={0}
          max={600}
          value={caffeine}
          onChange={(v) => setCaffeine(Math.round(v))}
        />

        <GoalSection
          title="당류 기준"
          subtitle="성인 당류 권장량 25g"
          unit="g"
          min={0}
          max={50}
          value={sugar}
          onChange={(v) => setSugar(Math.round(v))}
        />

        <Text style={styles.footerHint}>
            기존 기준값은 유지되고, 새 기준은 이후 기록부터 적용됩니다.
        </Text>
      </View>

      <View style={styles.bottom}>
        <Button
          title="저장하기"
          onPress={onSave}
          variant="primary"
          disabled={!hasChanges}
          backgroundColor={colors.primary[500]}
          disabledBackgroundColor={colors.grayscale[600]}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
  },

  header: {
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backText: {
    color: colors.grayscale[100],
    fontSize: 28,
    marginTop: -4,
    width: 24,
    textAlign: 'left',
  },

  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  section: {
    marginTop: 30,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: colors.grayscale[100],
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 5,
  },

  sectionSubtitle: {
    color: colors.grayscale[500],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },

  valueBox: {
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.grayscale[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  valueBoxActive: {
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },

  valueText: {
    color: colors.grayscale[100],
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },

  valueInput: {
    width: '100%',
    textAlign: 'center',
    color: colors.grayscale[100],
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    padding: 0,
  },

  minMaxTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },

  minMaxText: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },

  slider: {
    width: '100%',
  },

  footerHint: {
    color: colors.grayscale[500],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
    marginTop: 300,
  },

  bottom: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
});
