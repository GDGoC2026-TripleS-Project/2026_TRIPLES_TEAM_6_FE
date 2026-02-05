import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { colors } from '../../../constants/colors';
import Button from '../../../components/common/Button';
import { useState } from 'react';
import MenuItemRow from "../../../components/common/MenuItem";
import DatePickerField from "../../../components/common/DatePickerField";
import { useOptionStore } from '../../../store/useOptionStore';

type RecordingDetailRouteProp = RouteProp<RootStackParamList, 'RecordingDetail'>;
type RecordingDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecordingDetail'>;

const OPTION_NAMES: Record<string, string> = {
    shot: '샷 추가',
    syrup: '시럽 추가',
    decafaine: '샷 추가(디카페인)',
    sugar: '설탕 시럽',
    vanilla: '바닐라 시럽',
    hazelnut: '헤이즐럿 시럽',
    soy: '두유',
    almond: '아몬드 브리즈',
};

const RecordingDetail = () => {
    const route = useRoute<RecordingDetailRouteProp>();
    const navigation = useNavigation<RecordingDetailNavigationProp>();
    const { drinkName, brandName, temperature, size, options, optionLabelMap } = route.params;
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const setGroupInfo = useOptionStore(state => state.setGroupInfo);
    const optionNames = { ...OPTION_NAMES, ...(optionLabelMap ?? {}) };

    const optionText = `${temperature === 'hot' ? 'Hot' : 'Ice'} | ${size}`;

    // 카페인과 당류 계산 (실제로는 메뉴 데이터에서 가져와야 함)
    const baseCaffeine = 150; // 기본 카페인
    const baseSugar = 3;      // 기본 당류

    const handleComplete = () => {
        const groupId = `drink_${Date.now()}`;
        
        const chipSelected = new Set<string>();
        const stepperCounts: Record<string, number> = {};

        // 옵션별 추가 카페인/당류 계산
        let totalCaffeine = baseCaffeine;
        let totalSugar = baseSugar;

        if (options.milk && options.milk.length > 0) {
            options.milk.forEach(milkId => chipSelected.add(milkId));
        }

        if (options.coffee && Object.keys(options.coffee).length > 0) {
            Object.entries(options.coffee).forEach(([key, count]) => {
                if (count > 0) {
                    stepperCounts[key] = count;
                    // 샷 추가 시 카페인 증가 (샷당 75mg 가정)
                    if (key === 'shot' || key === 'decafaine') {
                        totalCaffeine += count * (key === 'decafaine' ? 5 : 75);
                    }
                }
            });
        }

        if (options.syrup && Object.keys(options.syrup).length > 0) {
            Object.entries(options.syrup).forEach(([key, count]) => {
                if (count > 0) {
                    stepperCounts[key] = count;
                    // 시럽 추가 시 당류 증가 (펌프당 5g 가정)
                    totalSugar += count * 5;
                }
            });
        }

        setGroupInfo(groupId, {
            brandName,
            menuName: drinkName,
            temperature,
            size,
            date: selectedDate,
            chipSelected,
            stepperCounts,
            caffeine: totalCaffeine,
            sugar: totalSugar,
        });

        console.log('Recording complete:', {
            groupId,
            drinkName,
            brandName,
            temperature,
            size,
            options,
            date: selectedDate,
            caffeine: totalCaffeine,
            sugar: totalSugar,
        });
        
        navigation.navigate('Send');
    };

    const formatAdditionalOptions = () => {
        const parts: string[] = [];

        if (options.coffee && Object.keys(options.coffee).length > 0) {
            Object.entries(options.coffee).forEach(([key, count]) => {
                if (count > 0) {
                    const optionName = optionNames[key] || key;
                    parts.push(`${optionName} ${count}`);
                }
            });
        }

        if (options.syrup && Object.keys(options.syrup).length > 0) {
            Object.entries(options.syrup).forEach(([key, count]) => {
                if (count > 0) {
                    const optionName = optionNames[key] || key;
                    parts.push(`${optionName} ${count}`);
                }
            });
        }

        if (options.milk && options.milk.length > 0) {
            const milkNames = options.milk.map(id => optionNames[id] || id);
            parts.push(...milkNames);
        }

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
                        optionText={optionText}
                        pills={[
                            { label: '카페인', value: 150, unit: 'mg' },
                            { label: '당류', value: 3, unit: 'g' },
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
