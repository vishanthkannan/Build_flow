import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Title, DataTable, Button, Paragraph } from 'react-native-paper';
import api from '../../services/api';

const ManagerWagesScreen = () => {
    const [attendance, setAttendance] = useState([]);

    const fetchAttendance = async () => {
        try {
            const res = await api.get('/attendance');
            setAttendance(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/attendance/${id}/status`, { status });
            Alert.alert('Success', `Wage entry ${status}`);
            fetchAttendance();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.header}>Daily Wages (Attendance)</Title>

            {attendance.length === 0 ? (
                <Paragraph>No records found.</Paragraph>
            ) : (
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title>Date/Sup</DataTable.Title>
                        <DataTable.Title numeric>Days</DataTable.Title>
                        <DataTable.Title numeric>Total</DataTable.Title>
                        <DataTable.Title>Action</DataTable.Title>
                    </DataTable.Header>

                    {attendance.map(item => (
                        <DataTable.Row key={item._id}>
                            <DataTable.Cell>
                                <View>
                                    <Paragraph style={{ fontSize: 12 }}>{new Date(item.date).toLocaleDateString()}</Paragraph>
                                    <Paragraph style={{ fontSize: 10, color: 'gray' }}>{item.supervisor?.username}</Paragraph>
                                </View>
                            </DataTable.Cell>
                            <DataTable.Cell numeric>{item.number_of_days} @ {item.wage_per_day}</DataTable.Cell>
                            <DataTable.Cell numeric>₹{item.total_amount}</DataTable.Cell>
                            <DataTable.Cell>
                                {item.status === 'Pending' ? (
                                    <View style={styles.actions}>
                                        <Button
                                            icon="check"
                                            mode="text"
                                            compact
                                            color="green"
                                            onPress={() => handleStatusUpdate(item._id, 'Approved')}
                                            labelStyle={{ marginHorizontal: 0 }}
                                        />
                                        <Button
                                            icon="close"
                                            mode="text"
                                            compact
                                            color="red"
                                            onPress={() => handleStatusUpdate(item._id, 'Rejected')}
                                            labelStyle={{ marginHorizontal: 0 }}
                                        />
                                    </View>
                                ) : (
                                    <Paragraph style={{ color: item.status === 'Approved' ? 'green' : 'red', fontSize: 12 }}>
                                        {item.status}
                                    </Paragraph>
                                )}
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}
                </DataTable>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 10, paddingBottom: 50 },
    header: { marginBottom: 15 },
    actions: { flexDirection: 'row' }
});

export default ManagerWagesScreen;
