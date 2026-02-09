import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { colors } from '../../../constants/colors';
import Button from '../../../components/common/Button';
import { useEffect, useMemo, useState } from 'react';
import MenuItemRow from "../../../components/common/MenuItem";
import DatePickerField from "../../../components/common/DatePickerField";
import { fetchMenuSizeDetail } from '../../../api/record/menu.api';
import { createIntakeRecord, updateIntakeRecord } from '../../../api/record/intake.api';
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
    const {
        drinkId,
        drinkName,
        brandName,
        brandId,
        selectedDate: selectedDateParam,
        temperature,
        size,
        options,
        optionNames,
        optionNutrition,
        menuSizeId,
        baseNutrition,
        edit,
    } = route.params;
    const [selectedDate, setSelectedDate] = useState(() => {
        if (!selectedDateParam) return new Date();
        const parsed = new Date(selectedDateParam);
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    });
    const [baseCaffeine, setBaseCaffeine] = useState(baseNutrition?.caffeineMg ?? 150);
    const [baseSugar, setBaseSugar] = useState(baseNutrition?.sugarG ?? 3);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleComplete = async () => {
        if (isSubmitting) return;
        if (!menuSizeId) {
            Alert.alert('섭취 기록 실패', '사이즈 정보를 불러오지 못했어요. 다시 시도해주세요.');
            return;
        }
        setIsSubmitting(true);

        const toNumericId = (value: string) => {
            const parsed = Number(value);
            return Number.isNaN(parsed) ? null : parsed;
        };

        const toQuantityPayload = (entries: Record<string, number>) =>
            Object.entries(entries)
                .filter(([, count]) => count > 0)
                .map(([optionId, count]) => {
                    const id = toNumericId(optionId);
                    return id === null ? null : { optionId: id, quantity: count };
                })
                .filter((v): v is { optionId: number; quantity: number } => v !== null);

        const optionPayload = [
            ...toQuantityPayload(options.coffee ?? {}),
            ...toQuantityPayload(options.syrup ?? {}),
            ...(options.milk ?? [])
                .map((optionId) => {
                    const id = toNumericId(optionId);
                    return id === null ? null : { optionId: id, quantity: 1 };
                })
                .filter((v): v is { optionId: number; quantity: number } => v !== null),
        ];

        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const recordDate = `${yyyy}-${mm}-${dd}`;

        try {
            const payload = {
                menuSizeId,
                intakeDate: recordDate,
                quantity: 1,
                options: optionPayload,
            };

            const res = edit?.intakeId
                ? await updateIntakeRecord(edit.intakeId, payload)
                : await createIntakeRecord(payload);

            if (!res.success) {
                Alert.alert('섭취 기록 실패', res.error?.message ?? '기록 저장에 실패했습니다.');
                return;
            }

            navigation.navigate('Send');
        } catch (e: any) {
            if (__DEV__) {
                console.log('[API ERR] /intakes status:', e?.response?.status);
                console.log('[API ERR] /intakes data:', e?.response?.data);
                console.log('[API ERR] /intakes message:', e?.message);
            }
            Alert.alert('섭취 기록 실패', '기록 저장에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
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
                <Button title="등록하기" onPress={handleComplete} disabled={isSubmitting} />
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
