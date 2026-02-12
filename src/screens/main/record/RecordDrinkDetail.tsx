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
import { useEffect, useMemo, useRef, useState } from "react";
import { useOptionStore } from '../../../store/useOptionStore';
import { useFavoriteMenus } from '../../../hooks/useFavoriteMenus';
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

const INFO_MESSAGE = '커피를 제외한 옵션은 기록용 메모이며, 영양정보 계산에는 포함되지 않아요.';

const RecordDrinkDetail = () => {
    const route = useRoute<RecordDrinkDetailRouteProp>();
    const navigation = useNavigation<RecordDrinkDetailNavigationProp>();
    const { drinkId, drinkName, selectedDate, edit } = route.params;

    const [temperature, setTemperature] = useState<'hot' | 'ice'>('hot');
    const [selectedSize, setSelectedSize] = useState<string>('Tall');
    const [menuDetail, setMenuDetail] = useState<MenuDetail | null>(null);
    const [sizes, setSizes] = useState<MenuSize[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [sizeLoadError, setSizeLoadError] = useState<string | null>(null);
    const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
    const [optionsLoadError, setOptionsLoadError] = useState<string | null>(null);

    const getGroupData = useOptionStore(state => state.getGroupData);
    const resetGroup = useOptionStore(state => state.resetGroup);
    const setGroupInfo = useOptionStore(state => state.setGroupInfo);
    const { isFavorite, toggleFavorite } = useFavoriteMenus();
    const editAppliedRef = useRef(false);

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
                        setSelectedSize((prev) => {
                            if (!prev) return next;
                            const exists = res.data.some((s) => s.sizeName === prev);
                            return exists ? prev : next;
                        });
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
        setOptionsLoadError(null);
        fetchBrandOptions(menuDetail.brandId)
            .then((res) => {
                if (!isMounted) return;
                if (res.success && res.data) {
                    setBrandOptions(res.data);
                } else {
                    setBrandOptions([]);
                    setOptionsLoadError(res.error?.message ?? '옵션 정보를 불러오지 못했어요.');
                }
            })
            .catch(() => {
                if (!isMounted) return;
                setBrandOptions([]);
                setOptionsLoadError('옵션 정보를 불러오지 못했어요.');
            });
        return () => {
            isMounted = false;
        };
    }, [menuDetail?.brandId]);

    useEffect(() => {
        resetGroup('extra1-option');
        resetGroup('extra2-option');
        resetGroup('extra3-option');
        editAppliedRef.current = false;
    }, [drinkId, resetGroup]);

    useEffect(() => {
        if (!edit || editAppliedRef.current) return;
        if (!menuDetail) return;
        if (!sizes.length) return;

        if (edit.temperature) {
            setTemperature(apiToTemp(edit.temperature));
        }

        if (edit.sizeName) {
            const exists = sizes.some((s) => s.sizeName === edit.sizeName);
            if (exists) setSelectedSize(edit.sizeName);
        } else if (edit.menuSizeId) {
            const match = sizes.find((s) => s.menuSizeId === edit.menuSizeId);
            if (match) setSelectedSize(match.sizeName);
        }

        const hasEditOptions = (edit.options ?? []).length > 0;
        if (hasEditOptions && brandOptions.length === 0) return;

        if (brandOptions.length > 0 && hasEditOptions) {
            const coffeeCounts: Record<string, number> = {};
            const syrupCounts: Record<string, number> = {};
            const milkSelected = new Set<string>();

            (edit.options ?? []).forEach((opt) => {
                const id = String(opt.optionId);
                const count = opt.quantity ?? opt.count ?? 1;
                const option = brandOptions.find((o) => String(o.id) === id);
                const category = (option?.category ?? '').toUpperCase();
                if (category === 'COFFEE' || category === 'SHOT') {
                    coffeeCounts[id] = count;
                    return;
                }
                if (category === 'SYRUP') {
                    syrupCounts[id] = count;
                    return;
                }
                if (category === 'MILK') {
                    if (milkSelected.size === 0) milkSelected.add(id);
                }
            });

            setGroupInfo('extra1-option', { stepperCounts: coffeeCounts, chipSelected: new Set() });
            setGroupInfo('extra2-option', { stepperCounts: syrupCounts, chipSelected: new Set() });
            setGroupInfo('extra3-option', { chipSelected: milkSelected, stepperCounts: {} });
        }

        editAppliedRef.current = true;
    }, [edit, menuDetail, sizes, brandOptions, setGroupInfo, apiToTemp]);

    const handleTemperatureChange = (next: 'hot' | 'ice') => {
        if (!allowedTemps.has(next)) return;
        setTemperature(next);
    };

    const handleTitlePress = () => {
        if (!edit?.intakeId) return;
        if (!menuDetail?.brandId) return;
        navigation.navigate('RecordDetail', {
            brandId: String(menuDetail.brandId),
            brandName: menuDetail.brandName ?? '',
            selectedDate,
            isFavorite: undefined,
            edit,
        });
    };

    const optionMaps = useMemo(() => {
        const optionNames = brandOptions.reduce<Record<string, string>>((acc, option) => {
            acc[String(option.id)] = option.name;
            return acc;
        }, {});
        const optionNutrition = brandOptions.reduce<
            Record<string, { caffeineMg?: number; sugarG?: number }>
        >((acc, option) => {
            const hasCaffeine = option.caffeineMg !== undefined && option.caffeineMg !== null;
            const hasSugar = option.sugarG !== undefined && option.sugarG !== null;
            if (hasCaffeine || hasSugar) {
                acc[String(option.id)] = {
                    caffeineMg: option.caffeineMg ?? 0,
                    sugarG: option.sugarG ?? 0,
                };
            }
            return acc;
        }, {});
        return { optionNames, optionNutrition };
    }, [brandOptions]);

    const handleNext = () => {
        const coffeeGroup = getGroupData('extra1-option');
        const syrupGroup = getGroupData('extra2-option');
        const milkGroup = getGroupData('extra3-option');
        const selectedSizeInfo = sizes.find((s) => s.sizeName === selectedSize);
        const coffeeCounts = { ...(coffeeGroup?.stepperCounts ?? {}) };
        const syrupCounts = { ...(syrupGroup?.stepperCounts ?? {}) };

        coffeeGroup?.chipSelected?.forEach((id) => {
            if (!coffeeCounts[id]) coffeeCounts[id] = 1;
        });
        syrupGroup?.chipSelected?.forEach((id) => {
            if (!syrupCounts[id]) syrupCounts[id] = 1;
        });

        navigation.navigate('RecordingDetail', {
            drinkName,
            drinkId,
            brandName: menuDetail?.brandName ?? '',
            brandId: menuDetail?.brandId,
            selectedDate,
            edit: edit?.intakeId ? { intakeId: edit.intakeId } : undefined,
            temperature,
            size: selectedSize,
            menuSizeId: selectedSizeInfo?.menuSizeId,
            baseNutrition: selectedSizeInfo?.nutrition,
            optionNames: optionMaps.optionNames,
            optionNutrition: optionMaps.optionNutrition,
            options: {
                coffee: coffeeCounts,
                syrup: syrupCounts,
                milk: milkGroup ? Array.from(milkGroup.chipSelected) : [],
            },
        });
    };

    const groupedOptions = useMemo(() => {
        const buckets = {
            coffee: [] as BrandOption[],
            syrup: [] as BrandOption[],
            milk: [] as BrandOption[],
        };

        brandOptions.forEach((option) => {
            const category = (option.category ?? '').toUpperCase();
            if (category === 'COFFEE' || category === 'SHOT') {
                buckets.coffee.push(option);
                return;
            }
            if (category === 'SYRUP') {
                buckets.syrup.push(option);
                return;
            }
            if (category === 'MILK') {
                buckets.milk.push(option);
            }
        });

        return {
            coffeeOptions: buckets.coffee.map((o) => ({ id: String(o.id), title: o.name })),
            syrupOptions: buckets.syrup.map((o) => ({ id: String(o.id), title: o.name })),
            milkOptions: buckets.milk.map((o) => ({ id: String(o.id), label: o.name })),
        };
    }, [brandOptions]);

    return (
        <View style={styles.wrapper}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                    <View style={styles.container}>
                    <List
                        title={drinkName}
                        onPress={handleTitlePress}
                        liked={menuDetail ? isFavorite(menuDetail.id) : false}
                        onToggle={(nextLiked) => {
                            if (!menuDetail) return;
                            toggleFavorite(
                                {
                                    id: menuDetail.id,
                                    name: menuDetail.name,
                                    brandId: menuDetail.brandId,
                                    brandName: menuDetail.brandName,
                                    imageUrl: menuDetail.imageUrl,
                                    category: menuDetail.category,
                                },
                                nextLiked
                            );
                        }}
                    />
                    <View style={styles.requiredOptionsSection}>
                        <TemperatureSection 
                            temperature={temperature}
                            onTemperatureChange={handleTemperatureChange}
                            hotEnabled={allowedTemps.has('hot')}
                            iceEnabled={allowedTemps.has('ice')}
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
                    </View>
                    
                    {!!optionsLoadError && (
                        <Text style={[styles.errorText, styles.optionsError]}>{optionsLoadError}</Text>
                    )}
                    <AdditionalOptionsSection
                        coffeeOptions={groupedOptions.coffeeOptions}
                        syrupOptions={groupedOptions.syrupOptions}
                        milkOptions={groupedOptions.milkOptions}
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
    onTemperatureChange,
    hotEnabled,
    iceEnabled,
}: { 
    temperature: 'hot' | 'ice'; 
    onTemperatureChange: (temp: 'hot' | 'ice') => void;
    hotEnabled: boolean;
    iceEnabled: boolean;
}) => {
    return (
        <View style={styles.optionGroup}>
            <SectionTitle title="온도" required />
            <TemperatureButton
                value={temperature}
                onChange={onTemperatureChange}
                hotEnabled={hotEnabled}
                iceEnabled={iceEnabled}
            />
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
    coffeeOptions: { id: string; title: string }[];
    syrupOptions: { id: string; title: string }[];
    milkOptions: { id: string; label: string }[];
}) => (
    <View>
        {coffeeOptions.length > 0 && (
            <AccordionItem id="extra1-option" title="커피">
                <StepperOptions
                    groupId="extra1-option"
                    options={coffeeOptions}
                />
            </AccordionItem>
        )}
        
        {syrupOptions.length > 0 && (
            <AccordionItem id="extra2-option" title="시럽">
                <StepperOptions
                    groupId="extra2-option"
                    options={syrupOptions}
                />
            </AccordionItem>
        )}
        
        {milkOptions.length > 0 && (
            <AccordionItem id="extra3-option" title="우유">
                <ChipOptions 
                    groupId="extra3-option"
                    options={milkOptions}
                    singleSelect
                />
            </AccordionItem>
        )}
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
    optionsError: {
        paddingHorizontal: 16,
        marginBottom: 8,
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
