import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../../types/navigation';
import { colors } from '../../../constants/colors';
import List from "../../../components/common/List";
import TemperatureButton from "../../../components/common/TemperatureButton";
import SizeButton from "../../../components/common/SizeButton";
import AccordionItem from "../../../components/common/AccordionItem";
import StepperOptions from "../../../components/common/StepperOptions";
import ChipOptions from "../../../components/common/ChipOptions";
import Info from "../../../../assets/info.svg"
import Button from "../../../components/common/Button";

type RecordDrinkDetailRouteProp = RouteProp<RootStackParamList, 'RecordDrinkDetail'>;

const RecordDrinkDetail = () => {
    const route = useRoute<RecordDrinkDetailRouteProp>();
    const { drinkId, drinkName } = route.params;

    return (
        <View style={styles.wrapper}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.container}>
                    <List title={drinkName}/>
                    <View style={{flexDirection: 'column', padding: 16, gap: 24, paddingBottom: 8}}>
                        <View style={styles.listWrap}>
                            <View style={styles.subTitleWrap}>
                                <Text style={styles.subTitle}>온도</Text>
                                <Text style={[styles.subTitle, {color: colors.primary[500]}]}>*</Text>
                            </View>
                            <TemperatureButton value={"hot"} onChange={()=>{}} />
                        </View>

                        <View style={styles.listWrap}>
                            <View style={styles.subTitleWrap}>
                                <Text style={styles.subTitle}>사이즈</Text>
                                <Text style={[styles.subTitle, {color: colors.primary[500]}]}>*</Text>
                            </View>
                            <View style={{gap: 8, flexDirection: 'row'}}>
                                <SizeButton title={"Tall"} volume={"355ml"} selected={true} />
                                <SizeButton title={"Grande"} volume={"473ml"} selected={false} />
                                <SizeButton title={"Venti"} volume={"591ml"} selected={false} />
                            </View>
                        </View>
                        <Text style={styles.subTitle}>옵션</Text>
                    </View>
                    <View>
                        <AccordionItem id="extra1-option" title="커피">
                            <StepperOptions
                                groupId="extra1-option"
                                options={[
                                { id: 'shot', title: '샷 추가' },
                                { id: 'syrup', title: '시럽 추가' },
                                { id: 'ice', title: '얼음 조절' },
                                ]}
                            />
                        </AccordionItem>
                        <AccordionItem id="extra2-option" title="시럽">
                            <StepperOptions
                                groupId="extra2-option"
                                options={[
                                { id: 'shot', title: '설탕 시럽' },
                                { id: 'syrup', title: '바닐라 시럽' },
                                { id: 'ice', title: '헤이즐럿 시럽' },
                                ]}
                            />
                        </AccordionItem>
                        <View>
                            <AccordionItem id="extra3-option" title="우유">
                                <ChipOptions 
                                    groupId="extra3-option"
                                    options={[
                                    { id: 'shot', label: '두유' },
                                    { id: 'syrup', label: '아몬드 브리즈' },
                                    ]}
                                />
                            </AccordionItem>
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <Info width={24} height={24}/>
                        <Text style={styles.info}>커피를 제외한 옵션은 기록용 메모이며, 영양정보 계산에는 포함되지 않아요.</Text>
                    </View>
                </View>
            </ScrollView>
            
            <View style={styles.floatingButtonContainer}>
                <Button title="다음"/>
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
    listWrap: {
        gap: 8
    },
    subTitleWrap: {
        flexDirection: 'row',
        gap: 4
    },
    subTitle: {
        fontSize: 14,
        color: colors.grayscale[100],
        fontFamily: 'Pretendard-Bold'
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 8, 
        padding: 12,
        margin: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary[500],
        backgroundColor: '#10447A'
    },
    info: {
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