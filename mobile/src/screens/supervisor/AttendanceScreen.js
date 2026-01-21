import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import api from '../../services/api';

const AttendanceScreen = () => {
    const [numberOfDays, setNumberOfDays] = useState('');
    const [wagePerDay, setWagePerDay] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const calculateTotal = () => {
        const days = parseFloat(numberOfDays) || 0;
        const wage = parseFloat(wagePerDay) || 0;
        return (days * wage).toFixed(2);
    };

    const handleSubmit = async () => {
        if (!numberOfDays || !wagePerDay) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/attendance', {
                number_of_days: parseFloat(numberOfDays),
                wage_per_day: parseFloat(wagePerDay)
            });
            Alert.alert('Success', 'Attendance submitted for approval');
            setNumberOfDays('');
            setWagePerDay('');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title>Mark Daily Attendance / Wages</Title>

            <TextInput
                label="Number of Days/Workers"
                value={numberOfDays}
                onChangeText={setNumberOfDays}
                keyboardType="numeric"
                style={styles.input}
            />

            <TextInput
                label="Wage Per Day"
                value={wagePerDay}
                onChangeText={setWagePerDay}
                keyboardType="numeric"
                style={styles.input}
            />

            <Title style={{ alignSelf: 'flex-end', marginBottom: 20 }}>Total: ₹{calculateTotal()}</Title>

            <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
                Submit for Approval
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: 'white' }
});

export default AttendanceScreen;
