import { StyleSheet, View, Text } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Chek from '../../../../assets/check-box.svg';
import { colors } from "../../../constants/colors";
import Button from "../../../components/common/Button";
import { RootStackParamList } from '../../../types/navigation';

type SendScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Send'>;

const SendScreen = () => {
    const navigation = useNavigation<SendScreenNavigationProp>();

    const handleAddMore = () => {
        navigation.navigate('Record');
    };

    const handleGoHome = () => {
        navigation.navigate('MainTabs', { screen: 'Home' });
    };

    return (
        <View style={styles.container}>
            <Chek width={48} height={48} />
            <View style={styles.textContainer}>
                <Text style={styles.title}>기록 완료</Text>
                <Text style={styles.subTitle}>더 기록하실 음료가 있나요?</Text>
            </View>
            <View style={styles.buttonContainer}>
                <Button title="더 등록하기" onPress={handleAddMore} />
                <Button title="홈 화면으로 돌아가기" variant="dark" onPress={handleGoHome} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        paddingHorizontal: 16
    },
    textContainer: {
        gap: 8,
        marginBottom: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        color: colors.grayscale[100],
        fontFamily: "Pretendard-SemiBold",
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 16,
        color: colors.grayscale[500],
        fontFamily: "Pretendard-Medium",
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 8,
    }
});

export default SendScreen;