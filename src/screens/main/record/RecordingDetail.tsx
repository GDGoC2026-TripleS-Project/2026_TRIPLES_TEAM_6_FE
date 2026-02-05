import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { colors } from '../../../constants/colors';
import Button from '../../../components/common/Button';
import { useEffect, useMemo, useState } from 'react';
import MenuItemRow from "../../../components/common/MenuItem";
import DatePickerField from "../../../components/common/DatePickerField";
import { useOptionStore } from '../../../store/useOptionStore';
import { fetchMenuSizeDetail } from '../../../api/record/menu.api';
import {
    buildOptionInfoFromSelections,
    buildOptionPartsFromSelections,
    calculateTotals,
} from '../../../utils/recordOptions';

type RecordingDetailRouteProp = RouteProp<RootStackParamList, 'RecordingDetail'>;
type RecordingDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecordingDetail'>;

const RecordingDetail = () => {
    const route = useRoute<RecordingDetailRouteProp>();
    const navigation = useNavigation<RecordingDetailNavigationProp>();
    const { drinkName, brandName, brandId, temperature, size, options, optionNames, optionNutrition, menuSizeId, baseNutrition } = route.params;
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [baseCaffeine, setBaseCaffeine] = useState(baseNutrition?.caffeineMg ?? 150);
    const [baseSugar, setBaseSugar] = useState(baseNutrition?.sugarG ?? 3);
    
    const setGroupInfo = useOptionStore(state => state.setGroupInfo);

    const optionInfo = useMemo(
        () => buildOptionInfoFromSelections(options, optionNames, temperature, size),
        [options, optionNames, temperature, size]
    );
    const totals = useMemo(
        () =>
            calculateTotals({
                baseCaffeine,
                baseSugar,
                options,
                optionNutrition,
            }),
        [baseCaffeine, baseSugar, options, optionNutrition]
    );

    useEffect(() => {
        if (!menuSizeId || baseNutrition) return;
        let isMounted = true;
        fetchMenuSizeDetail(menuSizeId)
            .then((res) => {
                if (!isMounted) return;
                if (res.success && res.data) {
                    const caffeine = res.data.nutrition?.caffeineMg ?? 150;
                    const sugar = res.data.nutrition?.sugarG ?? 3;
                    setBaseCaffeine(caffeine);
                    setBaseSugar(sugar);
                }
            })
            .catch(() => undefined);
        return () => {
            isMounted = false;
        };
    }, [menuSizeId]);

    const handleComplete = () => {
        const groupId = `drink_${Date.now()}`;
        
        const stepperCounts: Record<string, number> = {};
        Object.entries(options.coffee ?? {}).forEach(([key, count]) => {
            if (count > 0) stepperCounts[key] = count;
        });
        Object.entries(options.syrup ?? {}).forEach(([key, count]) => {
            if (count > 0) stepperCounts[key] = count;
        });

        const chipSelected = new Set<string>(options.milk ?? []);

        setGroupInfo(groupId, {
            brandName,
            brandId,
            menuName: drinkName,
            temperature,
            size,
            date: selectedDate,
            chipSelected,
            stepperCounts,
            optionNames,
            caffeine: totals.caffeine,
            sugar: totals.sugar,
        });

        console.log('Recording complete:', {
            groupId,
            drinkName,
            brandName,
            temperature,
            size,
            options,
            date: selectedDate,
            caffeine: totals.caffeine,
            sugar: totals.sugar,
        });
        
        navigation.navigate('Send');
    };

    const formatAdditionalOptions = () => {
        const parts: string[] = [];

        parts.push(...buildOptionPartsFromSelections(options, optionNames));

        return parts.length > 0 ? parts.join(' | ') : '선택한 옵션이 없습니다';
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.container}>
                    <MenuItemRow
                        brandName={brandName}
                        menuName={drinkName}
                        optionText={
                            <View style={styles.optionWrap}>
                                <Text style={styles.optionBase}>{optionInfo.base}</Text>
                                {optionInfo.extra.length > 0 && (
                                    <Text style={styles.optionExtra}>{optionInfo.extra.join(', ')}</Text>
                                )}
                            </View>
                        }
                        pills={[
                            { label: '카페인', value: totals.caffeine, unit: 'mg' },
                            { label: '당류', value: totals.sugar, unit: 'g' },
                        ]}
                    />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>추가 옵션</Text>
                        <Text style={styles.optionDetail}>{formatAdditionalOptions()}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>섭취 날짜</Text>
                        <DatePickerField
                            value={selectedDate}
                            onChange={setSelectedDate}
                            placeholder="날짜를 선택하세요"
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.floatingButtonContainer}>
                <Button title="등록하기" onPress={handleComplete} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    container: {
        flex: 1,
    },
    section: {
        padding: 16,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayscale[900]
    },
    sectionTitle: {
        fontSize: 14,
        color: colors.grayscale[600],
        fontFamily: 'Pretendard-Bold',
    },
    optionDetail: {
        fontSize: 16,
        color: colors.grayscale[100],
        fontFamily: 'Pretendard',
        fontWeight: '500',
        lineHeight: 24,
    },
    optionWrap: {
        flexDirection: 'row',
        gap: 16,
    },
    optionBase: {
        color: colors.grayscale[600],
        fontSize: 14,
        fontFamily: 'Pretendard-Regular',
    },
    optionExtra: {
        color: colors.grayscale[200],
        fontSize: 14,
        fontFamily: 'Pretendard-Regular',
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 21,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
});

export default RecordingDetail;
