import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

type SvgComp = React.ComponentType<any>;

type SlideBase = {
  id: string;
  type: 'intro' | 'text' | 'caffeine' | 'sugar' | 'done';
  title: string;
  description: string;
  explain?: string;
  mainIllust?: SvgComp;
  icons?: SvgComp[];
};

type SliderSlide = SlideBase & {
  type: 'caffeine' | 'sugar';
  min: number;
  max: number;
  unit: string;
  defaultValue: number;
};

type SlideItemData = SlideBase | SliderSlide;

type SlideItemProps = {
  item: SlideItemData;
  index: number;
};

export default function SlideItem({ item }: SlideItemProps) {
  const hasSlider = item.type === 'caffeine' || item.type === 'sugar';

  const [value, setValue] = useState<number>(
    hasSlider ? (item as SliderSlide).defaultValue : 0
  );

  useEffect(() => {
    if (hasSlider) setValue((item as SliderSlide).defaultValue);
  }, [item, hasSlider]);

  const valueLabel = useMemo(() => {
    if (!hasSlider) return '';
    const s = item as SliderSlide;
    return `${Math.round(value)}${s.unit}`;
  }, [value, item, hasSlider]);

  const isIntro = item.type === 'intro';
  const isDone = item.type === 'done';

  return (
    <View style={[styles.page, { width }]}>
      <View style={styles.textTop}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>
      </View>

      {isIntro && !!item.mainIllust && (
        <View style={styles.introIllustWrap}>
          <item.mainIllust
            width={width * 0.8}
            height={width * 0.8}
          />
        </View>
      )}

      {isIntro && !!item.explain && (
        <View style={styles.explainWrap}>
          <Text style={styles.explainText}>{item.explain}</Text>
        </View>
      )}

      {item.type === 'text' && <View style={{ flex: 1 }} />}

      {hasSlider && (
        <View style={styles.sliderArea}>
          <View style={styles.valueBox}>
            <Text style={styles.valueText}>{valueLabel}</Text>
          </View>

          <View style={styles.sliderRow}>
            <Text style={styles.minMax}>
              {(item as SliderSlide).min}
              {(item as SliderSlide).unit}
            </Text>

            <Slider
              style={{ flex: 1, marginHorizontal: 12, marginTop: 5 }}
              minimumValue={(item as SliderSlide).min}
              maximumValue={(item as SliderSlide).max}
              value={value}
              onValueChange={setValue}
              minimumTrackTintColor={colors.primary[500]}
              maximumTrackTintColor={colors.grayscale[500]}
              thumbTintColor={'#fff'}
            />

            <Text style={styles.minMax}>
              {(item as SliderSlide).max}
              {(item as SliderSlide).unit}
            </Text>
          </View>
        </View>
      )}

      {isDone && !!item.mainIllust && (
        <View style={styles.doneIllustWrap}>
          <item.mainIllust width={width * 0.75} height={width * 0.75} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
    alignItems: 'center',
  },

  textTop: {
    marginTop: height * 0.12,
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  title: {
    color: colors.grayscale[100],
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
    marginBottom: 13,
    marginTop: 48,
  },

  desc: {
    color: colors.grayscale[300],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },

  introIllustWrap: {
    position: 'absolute',
    top: height * 0.3,
  },

  explainWrap: {
    position: 'absolute',
    bottom: 160,
    paddingHorizontal: 18,
    width: '100%',
  },

  explainText: {
    color: colors.primary[500],
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  sliderArea: {
    marginTop: height * 0.12,
    width: '100%',
    paddingHorizontal: 18,
    flex: 1,
  },

  valueBox: {
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.grayscale[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  valueText: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },

  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  minMax: {
    color: colors.grayscale[400],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    marginTop: 5,
  },

  doneIllustWrap: {
    position: 'absolute',
    top: height * 0.33,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
