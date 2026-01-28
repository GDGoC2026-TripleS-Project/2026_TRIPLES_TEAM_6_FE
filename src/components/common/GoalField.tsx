import { View, StyleSheet, Text } from "react-native";
import TextField from "./TextField";
import { useState } from "react";
import { colors } from "../../constants/colors";
import Bar from "./Bar";

const GoalField = () => {
    const [goal, setGoal] = useState("500mg");
    const [error, setError] = useState("");
    
    const handleTextChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        const numValue = parseInt(numericValue) || 0;
        
        if (numValue > 1000) {
            setError("최대 1000mg까지 입력 가능합니다");
        } else {
            setError("");
        }
        
        setGoal(numericValue);
    };
    
    return (
        <View style={styles.container}>
            <TextField 
                value={goal} 
                onChangeText={handleTextChange} 
                style={styles.filedText}
                keyboardType="numeric"
                error={error}
            /> 
            <View style={styles.textContainer}>
                <Text style={styles.text}>0mg</Text>
                <Text style={styles.text}>1000mg</Text>
            </View>
            <Bar 
                min={0}
                max={1000}
                step={10}
                initialValue={parseInt(goal) || 500}
                onValueChange={(value) => {
                    setGoal(value.toString());
                    setError("");
                }}
            /> 
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 370,
        flexDirection: 'column',
    },
    filedText:{
        textAlign: 'center',
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        marginTop: 16
    },
    text: {
        fontSize: 12,
        fontFamily: "Pretendard-Regular",
        color: colors.grayscale[500]
    },
});

export default GoalField;