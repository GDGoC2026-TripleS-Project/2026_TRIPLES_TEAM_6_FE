import React, { useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import SlideItem from '../../../components/common/SlideItem';
import Button from '../../../components/common/Button';
import { colors } from '../../../constants/colors';

import Beverage1 from '../../../../assets/ComponentsImage/beverage1.svg';
import Beverage2 from '../../../../assets/ComponentsImage/beverage2.svg';
import Criteria1 from '../../../../assets/ComponentsImage/criteria1.svg';
import Criteria2 from '../../../../assets/ComponentsImage/criteria2.svg';
import Chart from '../../../../assets/ComponentsImage/chart.svg';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    type: 'intro',
    title: '오늘 마신 카페 음료를 기록해 보세요!',
    description: '음료만 선택하세요. \n카페인과 당류는 라스트컵이 계산할게요!',
    explain:
      '*표시된 카페인 및 당류 함량은 브랜드 공식 데이터를 기반으로 한 참고치이며,\n실제 제조 방식에 따라 차이가 있을 수 있습니다.',
    mainIllust: Beverage1,
  },

  {
    id: '2',
    type: 'text',
    title: '어려운 단위, 눈에 보이게 바꿨어요!',
    description: '복잡한 수치 대신 그래프 라인으로\n오늘 나의 섭취량을 한눈에 확인해 보세요.',
    criteria: [Criteria1, Criteria2],
  },

  {
    id: '3',
    type: 'text',
    title: '나만의 기준을 정하고, 초과 여부를 확인하세요!',
    description: '라스트컵과 정한 기준이 꼭 정답은 아니에요.\n나에게 맞는 건강한 밸런스를 찾아봐요.',
    chart: Chart,
  },

  {
    id: '4',
    type: 'caffeine',
    title: '나의 하루 카페인 기준을 정해볼까요?',
    titleHighlight: '하루 카페인 기준',
    description:
      '일반적인 성인 권장량은 400mg이에요.\n에스프레소 한 잔에는 약 75mg의 카페인이 들어 있어요.',
    min: 0,
    max: 1000,
    unit: 'mg',
    defaultValue: 400,
  },

  {
    id: '5',
    type: 'sugar',
    title: '나의 하루 당류 기준을 정해볼까요?',
    titleHighlight: '하루 당류 기준',
    description:
      '일반적인 성인 권장량은 25g이에요.\n각설탕 한 개에는 약 3g의 당류가 들어 있어요.',
    min: 0,
    max: 100,
    unit: 'g',
    defaultValue: 25,
  },

  {
    id: '6',
    type: 'done',
    title: '모든 준비가 끝났어요!',
    description:
      '이제 카페 음료를 기록하고,\n나만의 기준으로 카페인과 당류를 관리해보세요.',
    mainIllust: Beverage2,
  },
];

const INDICATOR_COUNT = 5;

function OnboardingScreen({ navigation }: { navigation?: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goTo = (index: number) =>
    flatListRef.current?.scrollToIndex?.({ index, animated: true });

  const handleNext = () => {
    if (currentIndex < slides.length - 1) goTo(currentIndex + 1);
    else navigation?.replace?.('Sign In');
  };

  const handlePrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;

  const isDoneSlide = slides[currentIndex]?.type === 'done';

  // ✅ done은 인디케이터 숨김
  // ✅ 나머지는 점 5개 고정 + active는 currentIndex 기준(0~4)
  const activeIndicatorIndex = Math.min(currentIndex, INDICATOR_COUNT - 1);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <SlideItem item={item} index={index} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
          listener: handleScroll,
        })}
      />

      {!isDoneSlide && (
        <View style={styles.indicatorContainer}>
          {Array.from({ length: INDICATOR_COUNT }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, activeIndicatorIndex === i && styles.dotActive]}
            />
          ))}
        </View>
      )}

      <View style={styles.bottomRow}>
        {!isFirstSlide && (
          <View style={{ flex: 1 }}>
            <Button title="이전" onPress={handlePrev} variant="dark" />
          </View>
        )}

        <View style={{ flex: isFirstSlide ? 1 : 2 }}>
          <Button
            title={isLastSlide ? '시작하기' : '다음'}
            onPress={handleNext}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayscale[1000],
  },

  indicatorContainer: {
    position: 'absolute',
    top: 70,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.grayscale[400],
  },

  dotActive: {
    width: 22,
    backgroundColor: colors.primary[500],
  },

  bottomRow: {
    position: 'absolute',
    bottom: 55,
    width: '100%',
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 12,
  },
});
