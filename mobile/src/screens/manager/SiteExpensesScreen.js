import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Title, Paragraph, DataTable, Card, Button } from 'react-native-paper';
import api, { API_URL } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const SiteExpensesScreen = ({ route }) => {
    const { siteId, siteName } = route.params;
    const { user } = useContext(AuthContext);
    const [expenses, setExpenses] = useState([]);
    const [total, setTotal] = useState(0);

    const fetchExpenses = async () => {
        try {
            // Fetch only Approved expenses for this site
            const res = await api.get(`/expenses?site=${siteId}&status=Approved`);
            const data = res.data || [];
            setExpenses(data);

            const totalAmount = data.reduce((acc, curr) => acc + curr.total_amount, 0);
            setTotal(totalAmount);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.header}>Expenses for {siteName}</Title>

            <Card style={styles.summaryCard}>
                <Card.Content>
                    <Title>Total Approved</Title>
                    <Paragraph style={{ fontSize: 20, fontWeight: 'bold', color: 'green' }}>₹{total}</Paragraph>
                </Card.Content>
                <Card.Actions>
                    <Button
                        icon="download"
                        onPress={() => Linking.openURL(`${API_URL}/reports/expenses?site=${siteId}&token=${user?.token}`)}
                    >
                        Download Report
                    </Button>
                </Card.Actions>
            </Card>

            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Date</DataTable.Title>
                    <DataTable.Title>Material</DataTable.Title>
                    <DataTable.Title numeric>Amount</DataTable.Title>
                </DataTable.Header>

                {expenses.length === 0 ? (
                    <View style={{ padding: 20 }}>
                        <Paragraph>No approved expenses found for this site.</Paragraph>
                    </View>
                ) : (
                    expenses.map(expense => (
                        <DataTable.Row key={expense._id}>
                            <DataTable.Cell>{new Date(expense.date).toLocaleDateString()}</DataTable.Cell>
                            <DataTable.Cell>
                                <View>
                                    <Paragraph style={{ fontSize: 12 }}>{expense.material_name}</Paragraph>
                                    <Paragraph style={{ fontSize: 10, color: 'gray' }}>Qty: {expense.quantity}</Paragraph>
                                    <Paragraph style={{ fontSize: 10, color: 'blue' }}>By: {expense.supervisor?.username || 'Unknown'}</Paragraph>
                                </View>
                            </DataTable.Cell>
                            <DataTable.Cell numeric>₹{expense.total_amount}</DataTable.Cell>
                        </DataTable.Row>
                    ))
                )}
            </DataTable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 10, paddingBottom: 50 },
    header: { marginBottom: 15, textAlign: 'center' },
    summaryCard: { marginBottom: 20, backgroundColor: '#e8f5e9' }
});

export default SiteExpensesScreen;
