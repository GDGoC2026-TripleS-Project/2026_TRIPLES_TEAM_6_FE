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
  titleHighlight?: string;
  description: string;
  explain?: string;
  mainIllust?: SvgComp;
  icons?: SvgComp[];
  criteria?: SvgComp[];
  chart?: SvgComp;
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
  caffeineValue?: number;
  sugarValue?: number;
  onChangeGoal?: (type: 'caffeine' | 'sugar', value: number) => void;
};

export default function SlideItem({
  item,
  index,
  caffeineValue,
  sugarValue,
  onChangeGoal,
}: SlideItemProps) {
  const hasSlider = item.type === 'caffeine' || item.type === 'sugar';

  const [isSliding, setIsSliding] = useState(false);

  const [value, setValue] = useState<number>(
    hasSlider ? (item as SliderSlide).defaultValue : 0
  );

  useEffect(() => {
    if (!hasSlider) return;

    const sliderItem = item as SliderSlide;

    const next =
      item.type === 'caffeine'
        ? (caffeineValue ?? sliderItem.defaultValue)
        : item.type === 'sugar'
        ? (sugarValue ?? sliderItem.defaultValue)
        : sliderItem.defaultValue;

    setValue((prev) => (prev === next ? prev : next));
  }, [hasSlider, item.type, caffeineValue, sugarValue, item]);

  const valueLabel = useMemo(() => {
    if (!hasSlider) return '';
    const s = item as SliderSlide;
    return `${Math.round(value)}${s.unit}`;
  }, [value, item, hasSlider]);

  const isIntro = item.type === 'intro';
  const isDone = item.type === 'done';

  const titleColor = colors.grayscale[100];

  const renderHighlightedTitle = (title: string, highlight?: string) => {
    if (!highlight || !title.includes(highlight)) {
      return <Text style={[styles.title, { color: titleColor }]}>{title}</Text>;
    }

    const parts = title.split(highlight);

    return (
      <Text style={[styles.title, { color: titleColor }]}>
        {parts[0]}
        <Text style={{ color: colors.primary[500] }}>{highlight}</Text>
        {parts[1]}
      </Text>
    );
  };

  return (
    <View style={[styles.page, { width }]}>
      <View style={styles.textTop}>
        {isDone ? (
          <>
            <Text style={[styles.title, styles.doneTitleSize, { color: titleColor }]}>
              {item.title}
            </Text>
            <Text style={[styles.desc, styles.doneDescSize]}>{item.description}</Text>
          </>
        ) : (
          <>
            {renderHighlightedTitle(item.title, item.titleHighlight)}
            <Text style={styles.desc}>{item.description}</Text>
          </>
        )}
      </View>

      {isIntro && !!item.mainIllust && (
        <View style={styles.introIllustWrap}>
          <item.mainIllust width={width * 0.8} height={width * 0.8} />
        </View>
      )}

      {isIntro && !!item.explain && (
        <View style={styles.explainWrap}>
          <Text style={styles.explainText}>{item.explain}</Text>
        </View>
      )}

      {item.type === 'text' && (
        <View style={styles.textBody}>
          {!!item.criteria?.length && (
            <View style={styles.criteriaWrap}>
              {item.criteria.map((CriteriaSvg, idx) => (
                <View key={idx} style={styles.criteriaItem}>
                  <CriteriaSvg width={width * 0.47} height={width * 0.25} />
                </View>
              ))}
            </View>
          )}

          {!!item.chart && (
            <View style={styles.chartWrap}>
              <item.chart width={width} height={width * 0.77} />
            </View>
          )}
        </View>
      )}

      {hasSlider && (
        <View style={styles.sliderArea}>
          <View style={[styles.valueBox, isSliding && styles.valueBoxActive]}>
            <Text style={styles.valueText}>{valueLabel}</Text>
          </View>

          <View style={styles.sliderRangeRow}>
            <Text style={styles.minMax}>
              {(item as SliderSlide).min}
              {(item as SliderSlide).unit}
            </Text>
            <Text style={styles.minMax}>
              {(item as SliderSlide).max}
              {(item as SliderSlide).unit}
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={{ flex: 1 }}
              minimumValue={(item as SliderSlide).min}
              maximumValue={(item as SliderSlide).max}
              value={value}
              onValueChange={(v) => {
                const next = Math.round(v);
                setValue(next);

                if (item.type === 'caffeine' || item.type === 'sugar') {
                  onChangeGoal?.(item.type, next);
                }
              }}
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={() => setIsSliding(false)}
              minimumTrackTintColor={colors.primary[500]}
              maximumTrackTintColor={colors.grayscale[500]}
              thumbTintColor={'#fff'}
            />
          </View>
        </View>
      )}

      {isDone && !!item.mainIllust && (
        <View style={[styles.doneIllustWrap, { transform: [{ translateY: -66 }] }]}>
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
    marginTop: height * 0.11,
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
    marginBottom: 13,
    marginTop: 48,
  },

  doneTitleSize: {
    fontSize: 24,
    marginTop: 5,
  },

  desc: {
    color: colors.grayscale[300],
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },

  doneDescSize: {
    fontSize: 16,
  },

  introIllustWrap: {
    position: 'absolute',
    top: height * 0.27,
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

  valueBoxActive: {
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },

  valueText: {
    color: colors.grayscale[100],
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },

  sliderRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  sliderContainer: {
    width: '100%',
    paddingHorizontal: 12,
  },

  minMax: {
    color: colors.grayscale[400],
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },

  doneIllustWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textBody: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: -240,
  },

  criteriaWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 30,
  },

  criteriaItem: {
    width: '100%',
    alignItems: 'center',
  },

  chartWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 28,
  },
});
