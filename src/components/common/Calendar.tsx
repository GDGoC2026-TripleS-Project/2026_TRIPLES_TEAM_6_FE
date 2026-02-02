import { View, StyleSheet, Text,  ViewStyle } from "react-native";
import { Calendar as RNCalendar, LocaleConfig, DateData } from 'react-native-calendars';
import { colors } from "../../constants/colors";

LocaleConfig.locales['ko'] = {
    monthNames: [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ],
    monthNamesShort: [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

type CalendarProps = {
    events?: string[];
    selected?: string;
    onDayPress?: (dateString: string) => void;
    style?: ViewStyle
};

const Calendar = ({ events = [], selected, onDayPress, style }: CalendarProps) => {
    
    const getMarkedDates = () => {
        const marked: any = {};
        
        events.forEach(date => {
            marked[date] = {
                marked: true,
                dotColor: colors.primary[500],
            };
        });
        
        if (selected) {
            marked[selected] = {
                ...marked[selected],
                selected: true,
                selectedColor: colors.grayscale[600],
            };
        }
        
        return marked;
    };

    const handleDayPress = (day: DateData) => {
        if (onDayPress) {
            onDayPress(day.dateString);
        }
    };

    return (
        <View style={styles.container}>
            <RNCalendar
                onDayPress={handleDayPress}
                markedDates={getMarkedDates()}
                markingType="dot"
                renderHeader={(date) => {
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    return (
                        <View style={styles.header}>
                            <Text style={styles.headerText}>{year}년 {month}월</Text>
                        </View>
                    );
                }}
                theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: colors.grayscale[300],
                    selectedDayBackgroundColor: colors.grayscale[600],
                    selectedDayTextColor: colors.grayscale[100],
                    todayTextColor: '#0B0B0B',
                    todayBackgroundColor: colors.primary[500],
                    dayTextColor: colors.grayscale[100],
                    textDisabledColor: colors.grayscale[600],
                    monthTextColor: colors.grayscale[100],
                    arrowColor: colors.grayscale[600],
                    textMonthFontFamily: 'Pretendard-Bold',
                    textDayFontFamily: 'Pretendard-Regular',
                    textDayHeaderFontFamily: 'Pretendard-Medium',
                    textMonthFontSize: 16,
                    textDayFontSize: 14,
                    textDayHeaderFontSize: 12,
                    'stylesheet.day.basic': {
                        selected: {
                            backgroundColor: colors.grayscale[600],
                            borderRadius: 14,
                            width: 28,
                            height: 28,
                        },
                        today: {
                            backgroundColor: colors.primary[500],
                            borderRadius: 14,
                            width: 28,
                            height: 28,
                        },
                    },
                    'stylesheet.dot': {
                        dot: {
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            marginTop: 10, 
                        },
                    },
                    'stylesheet.calendar.header': {
                        week: {
                            marginTop: 7,
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            borderBottomWidth: 1,
                            borderBottomColor: colors.grayscale[800],
                            paddingBottom: 7,
                            ...(style ?? {}), 
                        },
                    },
                    'stylesheet.calendar.main': {
                        week: {
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            borderBottomWidth: 1,
                            borderBottomColor: colors.grayscale[800],
                            paddingTop: 5,
                            paddingBottom: 14,
                        },
                    },
                } as any}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: 'transparent',
    },
    headerText: {
        fontSize: 16,
        fontFamily: 'Pretendard-Bold',
        color: colors.grayscale[100],
    },
});

export default Calendar;