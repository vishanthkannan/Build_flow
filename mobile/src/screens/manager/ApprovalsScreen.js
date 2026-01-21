import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput as PaperInput, DataTable } from 'react-native-paper';
import api from '../../services/api';

const ApprovalsScreen = () => {
    const [expenses, setExpenses] = useState([]);

    // Rejection Logic
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/expenses?status=Pending');
            setExpenses(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.put(`/expenses/${id}/status`, { status: 'Approved' });
            Alert.alert('Success', 'Expense Approved');
            fetchExpenses();
        } catch (e) {
            Alert.alert('Error', 'Failed to approve');
        }
    };

    const handleRejectInit = (id) => {
        setRejectId(id);
        setRejectReason('');
        setModalVisible(true);
    };

    const handleRejectConfirm = async () => {
        if (!rejectReason) {
            Alert.alert('Error', 'Reason is mandatory');
            return;
        }
        try {
            await api.put(`/expenses/${rejectId}/status`, {
                status: 'Rejected',
                rejection_reason: rejectReason
            });
            setModalVisible(false);
            setRejectId(null);
            fetchExpenses();
            Alert.alert('Success', 'Expense Rejected');
        } catch (e) {
            Alert.alert('Error', 'Failed to reject');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.headerTitle}>Pending Approvals</Title>

            {expenses.length === 0 ? (
                <Paragraph>No pending expenses.</Paragraph>
            ) : (
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title>Date</DataTable.Title>
                        <DataTable.Title>Material</DataTable.Title>
                        <DataTable.Title numeric>Amount</DataTable.Title>
                        <DataTable.Title>Actions</DataTable.Title>
                    </DataTable.Header>

                    {expenses.map(expense => (
                        <DataTable.Row key={expense._id}>
                            <DataTable.Cell>{new Date(expense.date).toLocaleDateString()}</DataTable.Cell>
                            <DataTable.Cell>
                                <View>
                                    <Paragraph style={{ fontSize: 12 }}>{expense.material_name}</Paragraph>
                                    <Paragraph style={{ fontSize: 10, color: 'gray' }}>{expense.site?.name}</Paragraph>
                                    <Paragraph style={{ fontSize: 10, color: 'gray' }}>{expense.supervisor?.username}</Paragraph>
                                    {expense.is_price_changed && (
                                        <Paragraph style={{ fontSize: 10, color: 'red' }}>Price Warn</Paragraph>
                                    )}
                                </View>
                            </DataTable.Cell>
                            <DataTable.Cell numeric>₹{expense.total_amount}</DataTable.Cell>
                            <DataTable.Cell>
                                <View style={styles.actionButtons}>
                                    <Button
                                        icon="check"
                                        mode="text"
                                        compact
                                        color="green"
                                        onPress={() => handleApprove(expense._id)}
                                        labelStyle={{ fontSize: 16, marginHorizontal: 0 }}
                                    ></Button>
                                    <Button
                                        icon="close"
                                        mode="text"
                                        compact
                                        color="red"
                                        onPress={() => handleRejectInit(expense._id)}
                                        labelStyle={{ fontSize: 16, marginHorizontal: 0 }}
                                    ></Button>
                                </View>
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}
                </DataTable>
            )}

            {/* Rejection Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Title>Reject Reason</Title>
                        <PaperInput
                            mode="outlined"
                            label="Reason"
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            style={{ marginBottom: 10 }}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Button onPress={() => setModalVisible(false)}>Cancel</Button>
                            <Button onPress={handleRejectConfirm}>Confirm</Button>
                        </View>
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 10, paddingBottom: 50 },
    headerTitle: { marginBottom: 15 },
    actionButtons: { flexDirection: 'row' },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white', padding: 20, width: '80%', borderRadius: 5
    }
});

export default ApprovalsScreen;
