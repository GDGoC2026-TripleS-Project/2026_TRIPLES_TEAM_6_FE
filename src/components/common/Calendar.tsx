import React, { useMemo } from 'react';
import { View, StyleSheet, Text, ViewStyle, Pressable } from "react-native";
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
    startDate?: string;
    endDate?: string;
    selecting?: 'start' | 'end';
    showToday?: boolean;
    disableTodayHighlight?: boolean;
    onDayPress?: (dateString: string) => void;
    style?: ViewStyle;
};

const Calendar = ({ 
    events = [], 
    startDate, 
    endDate, 
    showToday = true, 
    disableTodayHighlight = false,
    onDayPress, 
    style 
}: CalendarProps) => {
    const eventSet = useMemo(() => new Set(events), [events]);

    const isSame = (a?: string, b?: string) => !!a && !!b && a === b;
    const isBetween = (d: string, start?: string, end?: string) => {
        if (!start || !end) return false;
        return start < d && d < end;
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
                dayComponent={({ date, state }) => {
                    if (!date) return null;

                    const dateString = date.dateString;
                    const isStart = isSame(dateString, startDate);
                    const isEnd = isSame(dateString, endDate);
                    const hasRange = !!startDate && !!endDate;
                    const isSingleDay = hasRange && startDate === endDate;
                    const isInRange = hasRange && (isBetween(dateString, startDate, endDate) || isStart || isEnd);
                    const isDisabled = state === 'disabled';
                    const isToday = showToday && state === 'today';
                    const isSelected = isStart || isEnd;
                    const hasSelection = !!startDate || !!endDate;

                    return (
                        <Pressable
                            style={styles.dayCell}
                            onPress={() => handleDayPress(date)}
                            disabled={isDisabled}
                        >
                            {isInRange && !isSingleDay && (
                                <View
                                    style={[
                                        styles.rangeBar,
                                        isStart && styles.rangeBarStart,
                                        isEnd && styles.rangeBarEnd,
                                    ]}
                                />
                            )}

                            <View
                                style={[
                                    styles.dayCircle,
                                    disableTodayHighlight
                                        ? isSelected && styles.dayCircleSelected
                                        : [
                                            isToday && isSelected && styles.dayCircleToday,
                                            isToday && !hasSelection && styles.dayCircleToday,
                                            isSelected && !isToday && styles.dayCircleSelected,
                                        ]
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        isDisabled && styles.dayTextDisabled,
                                        disableTodayHighlight
                                            ? isSelected && styles.dayTextSelected
                                            : [
                                                isToday && isSelected && styles.dayTextTodaySelected,
                                                isToday && !hasSelection && styles.dayTextTodaySelected,
                                                isToday && hasSelection && !isSelected && styles.dayTextTodayWithSelection,
                                                isSelected && !isToday && styles.dayTextSelected,
                                            ]
                                    ]}
                                >
                                    {date.day}
                                </Text>
                            </View>

                            {eventSet.has(dateString) && <View style={styles.dot} />}
                        </Pressable>
                    );
                }}
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
                    todayTextColor: colors.grayscale[100],
                    todayBackgroundColor: colors.grayscale[600],
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
                            backgroundColor: colors.primary[500],
                            borderRadius: 14,
                            width: 28,
                            height: 28,
                        },
                        today: {
                            color: colors.primary[500],
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
                            paddingHorizontal: 2,
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
    dayCell: {
        width: '100%',
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rangeBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 30,
        borderRadius: 0,
        backgroundColor: 'rgba(64, 224, 208, 0.22)',
    },
    rangeBarStart: {
        left: '20%',
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
    },
    rangeBarEnd: {
        right: '20%',
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
    },
    rangeBarSingle: {
        left: 0,
        right: 0,
        borderRadius: 18,
    },
    dayCircle: {
        width: 28,
        height: 28,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleToday: {
        backgroundColor: colors.primary[500],
    },
    dayCircleSelected: {
        backgroundColor: colors.primary[500],
    },
    dayText: {
        color: colors.grayscale[200],
        fontFamily: 'Pretendard-Medium',
        fontSize: 14,
    },
    dayTextTodaySelected: {
        color: colors.grayscale[1000],
    },
    dayTextTodayWithSelection: {
        color: colors.primary[500],
    },
    dayTextSelected: {
        color: colors.grayscale[1000],
    },
    dayTextDisabled: {
        color: colors.grayscale[600],
    },
    dot: {
        position: 'absolute',
        bottom: 1,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.primary[500],
    },
});

export default Calendar;