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
import { useState } from "react";
import { useOptionStore } from '../../../store/useOptionStore';

type RecordDrinkDetailRouteProp = RouteProp<RootStackParamList, 'RecordDrinkDetail'>;
type RecordDrinkDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecordDrinkDetail'>;

const SIZES = [
    { title: "Tall", volume: "355ml" },
    { title: "Grande", volume: "473ml" },
    { title: "Venti", volume: "591ml" },
];

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

const RecordDrinkDetail = () => {
    const route = useRoute<RecordDrinkDetailRouteProp>();
    const navigation = useNavigation<RecordDrinkDetailNavigationProp>();
    const { drinkId, drinkName } = route.params;

    const [temperature, setTemperature] = useState<'hot' | 'ice'>('hot');
    const [selectedSize, setSelectedSize] = useState<string>('Tall');

    const getGroupData = useOptionStore(state => state.getGroupData);

    const handleNext = () => {
        const coffeeGroup = getGroupData('extra1-option');
        const syrupGroup = getGroupData('extra2-option');
        const milkGroup = getGroupData('extra3-option');

        navigation.navigate('RecordingDetail', {
            drinkName,
            drinkId,
            brandName: '스타벅스',
            temperature,
            size: selectedSize,
            options: {
                coffee: coffeeGroup?.stepperCounts || {},
                syrup: syrupGroup?.stepperCounts || {},
                milk: milkGroup ? Array.from(milkGroup.chipSelected) : [],
            },
        });
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.container}>
                    <List title={drinkName} />
                    <View style={styles.requiredOptionsSection}>
                        <TemperatureSection 
                            temperature={temperature}
                            onTemperatureChange={setTemperature}
                        />
                        <SizeSection 
                            selectedSize={selectedSize}
                            onSizeChange={setSelectedSize}
                        />
                        <Text style={styles.subTitle}>옵션</Text>
                    </View>
                    
                    <AdditionalOptionsSection />
                    
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
    selectedSize, 
    onSizeChange 
}: { 
    selectedSize: string; 
    onSizeChange: (size: string) => void;
}) => {
    return (
        <View style={styles.optionGroup}>
            <SectionTitle title="사이즈" required />
            <View style={styles.sizeButtonGroup}>
                {SIZES.map(size => (
                    <SizeButton
                        key={size.title}
                        title={size.title}
                        volume={size.volume}
                        selected={selectedSize === size.title}
                        onPress={() => onSizeChange(size.title)}
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

const AdditionalOptionsSection = () => (
    <View>
        <AccordionItem id="extra1-option" title="커피">
            <StepperOptions
                groupId="extra1-option"
                options={COFFEE_OPTIONS}
            />
        </AccordionItem>
        
        <AccordionItem id="extra2-option" title="시럽">
            <StepperOptions
                groupId="extra2-option"
                options={SYRUP_OPTIONS}
            />
        </AccordionItem>
        
        <AccordionItem id="extra3-option" title="우유">
            <ChipOptions 
                groupId="extra3-option"
                options={MILK_OPTIONS}
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