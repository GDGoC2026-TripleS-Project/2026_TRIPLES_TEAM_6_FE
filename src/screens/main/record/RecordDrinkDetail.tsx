import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { colors } from '../../../constants/colors';
import List from "../../../components/common/List";
import TemperatureButton from "../../../components/common/TemperatureButton";
import SizeButton from "../../../components/common/SizeButton";
import AccordionItem from "../../../components/common/AccordionItem";
import StepperOptions from "../../../components/common/StepperOptions";
import ChipOptions from "../../../components/common/ChipOptions";
import Info from "../../../../assets/info.svg";
import Button from "../../../components/common/Button";
import { useEffect, useMemo, useState } from "react";
import { useOptionStore } from '../../../store/useOptionStore';
import {
    fetchMenuDetail,
    fetchMenuSizes,
    type MenuDetail,
    type MenuSize,
    type MenuTemperature,
} from '../../../api/record/menu.api';
import { fetchBrandOptions, type BrandOption } from '../../../api/record/brand.api';

type RecordDrinkDetailRouteProp = RouteProp<RootStackParamList, 'RecordDrinkDetail'>;
type RecordDrinkDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecordDrinkDetail'>;

const COFFEE_OPTIONS = [
    { id: 'shot', title: '샷 추가' },
    { id: 'decafaine', title: '샷 추가(디카페인)' },
];

const SYRUP_OPTIONS = [
    { id: 'sugar', title: '설탕 시럽' },
    { id: 'vanilla', title: '바닐라 시럽' },
    { id: 'hazelnut', title: '헤이즐럿 시럽' },
];

const MILK_OPTIONS = [
    { id: 'soy', label: '두유' },
    { id: 'almond', label: '아몬드 브리즈' },
];

const INFO_MESSAGE = '커피를 제외한 옵션은 기록용 메모이며, 영양정보 계산에는 포함되지 않아요.';

type StepperOption = { id: string; title: string };
type ChipOption = { id: string; label: string };

const normalizeOptionType = (value: string) => {
    const normalized = value.trim().toUpperCase();

    if (normalized.includes('MILK')) return 'milk';
    if (normalized.includes('SYRUP')) return 'syrup';
    if (normalized.includes('COFFEE') || normalized.includes('SHOT')) return 'coffee';

    return 'coffee';
};

const RecordDrinkDetail = () => {
    const route = useRoute<RecordDrinkDetailRouteProp>();
    const navigation = useNavigation<RecordDrinkDetailNavigationProp>();
    const { drinkId, drinkName } = route.params;

    const [temperature, setTemperature] = useState<'hot' | 'ice'>('hot');
    const [selectedSize, setSelectedSize] = useState<string>('Tall');
    const [menuDetail, setMenuDetail] = useState<MenuDetail | null>(null);
    const [sizes, setSizes] = useState<MenuSize[]>([]);
    const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [sizeLoadError, setSizeLoadError] = useState<string | null>(null);
    const [optionLoadError, setOptionLoadError] = useState<string | null>(null);

    const getGroupData = useOptionStore(state => state.getGroupData);

    const tempToApi = (t: 'hot' | 'ice'): MenuTemperature => (t === 'hot' ? 'HOT' : 'ICED');
    const apiToTemp = (t: MenuTemperature): 'hot' | 'ice' => (t === 'HOT' ? 'hot' : 'ice');

    const allowedTemps = useMemo(() => {
        const temps = menuDetail?.availableTemperatures ?? ['HOT', 'ICED'];
        return new Set(temps.map(apiToTemp));
    }, [menuDetail]);

    useEffect(() => {
        if (!menuDetail) return;
        if (!allowedTemps.has(temperature)) {
            const first = menuDetail.availableTemperatures?.[0];
            if (first) setTemperature(apiToTemp(first));
        }
    }, [menuDetail, allowedTemps, temperature]);

    useEffect(() => {
        let isMounted = true;
        setLoadError(null);
        fetchMenuDetail(drinkId)
            .then((res) => {
                if (!isMounted) return;
                if (res.success && res.data) {
                    setMenuDetail(res.data);
                } else {
                    setLoadError(res.error?.message ?? '메뉴 정보를 불러오지 못했어요.');
                }
            })
            .catch(() => {
                if (!isMounted) return;
                setLoadError('메뉴 정보를 불러오지 못했어요.');
            })
            .finally(() => undefined);
        return () => {
            isMounted = false;
        };
    }, [drinkId]);

    useEffect(() => {
        if (!menuDetail) return;
        let isMounted = true;
        setSizeLoadError(null);
        fetchMenuSizes(menuDetail.id, tempToApi(temperature))
            .then((res) => {
                if (!isMounted) return;
                if (res.success && res.data) {
                    setSizes(res.data);
                    if (res.data.length > 0) {
                        const next = res.data[0].sizeName;
                        setSelectedSize((prev) => (prev ? prev : next));
                    }
                } else {
                    setSizeLoadError(res.error?.message ?? '사이즈 정보를 불러오지 못했어요.');
                }
            })
            .catch(() => {
                if (!isMounted) return;
                setSizes([]);
                setSizeLoadError('사이즈 정보를 불러오지 못했어요.');
            });
        return () => {
            isMounted = false;
        };
    }, [menuDetail, temperature]);

    useEffect(() => {
        if (!menuDetail?.brandId) return;
        let isMounted = true;
        setOptionLoadError(null);
        fetchBrandOptions(menuDetail.brandId)
            .then((res) => {
                if (!isMounted) return;
                if (res.success && res.data) {
                    setBrandOptions(res.data);
                } else {
                    setBrandOptions([]);
                    setOptionLoadError(res.error?.message ?? '옵션 정보를 불러오지 못했어요.');
                }
            })
            .catch(() => {
                if (!isMounted) return;
                setBrandOptions([]);
                setOptionLoadError('옵션 정보를 불러오지 못했어요.');
            });

        return () => {
            isMounted = false;
        };
    }, [menuDetail?.brandId]);

    const groupedOptions = useMemo(() => {
        const grouped = {
            coffee: [] as StepperOption[],
            syrup: [] as StepperOption[],
            milk: [] as ChipOption[],
        };

        for (const option of brandOptions) {
            const id = String(option.id);
            const name = option.name?.trim();
            if (!name) continue;

            const optionType = normalizeOptionType(option.type ?? '');
            if (optionType === 'milk') {
                grouped.milk.push({ id, label: name });
            } else if (optionType === 'syrup') {
                grouped.syrup.push({ id, title: name });
            } else {
                grouped.coffee.push({ id, title: name });
            }
        }

        return grouped;
    }, [brandOptions]);

    const coffeeOptions = groupedOptions.coffee.length > 0 ? groupedOptions.coffee : COFFEE_OPTIONS;
    const syrupOptions = groupedOptions.syrup.length > 0 ? groupedOptions.syrup : SYRUP_OPTIONS;
    const milkOptions = groupedOptions.milk.length > 0 ? groupedOptions.milk : MILK_OPTIONS;

    const handleTemperatureChange = (next: 'hot' | 'ice') => {
        if (!allowedTemps.has(next)) return;
        setTemperature(next);
    };

    const handleNext = () => {
        const coffeeGroup = getGroupData('extra1-option');
        const syrupGroup = getGroupData('extra2-option');
        const milkGroup = getGroupData('extra3-option');
        const optionLabelMap: Record<string, string> = {};

        coffeeOptions.forEach((option) => {
            optionLabelMap[option.id] = option.title;
        });
        syrupOptions.forEach((option) => {
            optionLabelMap[option.id] = option.title;
        });
        milkOptions.forEach((option) => {
            optionLabelMap[option.id] = option.label;
        });

        navigation.navigate('RecordingDetail', {
            drinkName,
            drinkId,
            brandName: menuDetail?.brandName ?? '',
            temperature,
            size: selectedSize,
            options: {
                coffee: coffeeGroup?.stepperCounts || {},
                syrup: syrupGroup?.stepperCounts || {},
                milk: milkGroup ? Array.from(milkGroup.chipSelected) : [],
            },
            optionLabelMap,
        });
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                    <View style={styles.container}>
                    <List title={drinkName} showToggle={false} />
                    <View style={styles.requiredOptionsSection}>
                        <TemperatureSection 
                            temperature={temperature}
                            onTemperatureChange={handleTemperatureChange}
                        />
                        <SizeSection 
                            sizes={sizes}
                            selectedSize={selectedSize}
                            onSizeChange={setSelectedSize}
                        />
                        {!!sizeLoadError && (
                            <Text style={styles.errorText}>{sizeLoadError}</Text>
                        )}
                        <Text style={styles.subTitle}>옵션</Text>
                        {!!loadError && (
                            <Text style={styles.errorText}>{loadError}</Text>
                        )}
                        {!!optionLoadError && (
                            <Text style={styles.errorText}>{optionLoadError}</Text>
                        )}
                    </View>
                    
                    <AdditionalOptionsSection
                        coffeeOptions={coffeeOptions}
                        syrupOptions={syrupOptions}
                        milkOptions={milkOptions}
                    />
                    
                    <InfoMessage />
                </View>
            </ScrollView>
            
            <FloatingButton onPress={handleNext} />
        </View>
    );
};

const TemperatureSection = ({ 
    temperature, 
    onTemperatureChange 
}: { 
    temperature: 'hot' | 'ice'; 
    onTemperatureChange: (temp: 'hot' | 'ice') => void;
}) => {
    return (
        <View style={styles.optionGroup}>
            <SectionTitle title="온도" required />
            <TemperatureButton value={temperature} onChange={onTemperatureChange} />
        </View>
    );
};

const SizeSection = ({ 
    sizes,
    selectedSize, 
    onSizeChange 
}: { 
    sizes: MenuSize[];
    selectedSize: string; 
    onSizeChange: (size: string) => void;
}) => {
    return (
        <View style={styles.optionGroup}>
            <SectionTitle title="사이즈" required />
            <View style={styles.sizeButtonGroup}>
                {sizes.map(size => (
                    <SizeButton
                        key={size.menuSizeId}
                        title={size.sizeName}
                        volume={`${size.volumeMl}ml`}
                        selected={selectedSize === size.sizeName}
                        onPress={() => onSizeChange(size.sizeName)}
                    />
                ))}
            </View>
        </View>
    );
};

const SectionTitle = ({ title, required = false }: { title: string; required?: boolean }) => (
    <View style={styles.titleContainer}>
        <Text style={styles.subTitle}>{title}</Text>
        {required && <Text style={styles.requiredMark}>*</Text>}
    </View>
);

const AdditionalOptionsSection = ({
    coffeeOptions,
    syrupOptions,
    milkOptions,
}: {
    coffeeOptions: StepperOption[];
    syrupOptions: StepperOption[];
    milkOptions: ChipOption[];
}) => (
    <View>
        <AccordionItem id="extra1-option" title="커피">
            <StepperOptions
                groupId="extra1-option"
                options={coffeeOptions}
            />
        </AccordionItem>
        
        <AccordionItem id="extra2-option" title="시럽">
            <StepperOptions
                groupId="extra2-option"
                options={syrupOptions}
            />
        </AccordionItem>
        
        <AccordionItem id="extra3-option" title="우유">
            <ChipOptions 
                groupId="extra3-option"
                options={milkOptions}
            />
        </AccordionItem>
    </View>
);

const InfoMessage = () => (
    <View style={styles.infoContainer}>
        <Info width={24} height={24} />
        <Text style={styles.infoText}>{INFO_MESSAGE}</Text>
    </View>
);

const FloatingButton = ({ onPress }: { onPress: () => void }) => (
    <View style={styles.floatingButtonContainer}>
        <Button title="다음" onPress={onPress} />
    </View>
);

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
    
    requiredOptionsSection: {
        flexDirection: 'column',
        padding: 16,
        gap: 24,
        paddingBottom: 8,
    },
    optionGroup: {
        gap: 8,
    },
    
    titleContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    subTitle: {
        fontSize: 14,
        color: colors.grayscale[100],
        fontFamily: 'Pretendard-Bold',
    },
    requiredMark: {
        fontSize: 14,
        color: colors.primary[500],
        fontFamily: 'Pretendard-Bold',
    },
    
    sizeButtonGroup: {
        gap: 8,
        flexDirection: 'row',
    },
    
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        padding: 12,
        margin: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary[500],
        backgroundColor: '#10447A',
    },
    infoText: {
        flex: 1,
        color: colors.grayscale[100],
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 21,
        flexShrink: 1,
    },
    errorText: {
        color: colors.grayscale[500],
        fontSize: 12,
        fontFamily: 'Pretendard-Regular',
        marginTop: 4,
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

export default RecordDrinkDetail;
