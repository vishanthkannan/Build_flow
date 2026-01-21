import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';

const ManagerDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const navigation = useNavigation();
    const [summary, setSummary] = useState({
        totalAllocated: 0,
        approvedExpenses: 0,
        pendingCount: 0
    });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                // Fetch basic stats
                const allocationsRes = await api.get('/allocations');
                const expensesRes = await api.get('/expenses');

                const allocations = allocationsRes.data || [];
                const expenses = expensesRes.data || [];

                const totalAllocated = allocations.reduce((acc, curr) => acc + curr.amount, 0);
                const approvedExpenses = expenses
                    .filter(e => e.status === 'Approved')
                    .reduce((acc, curr) => acc + curr.total_amount, 0);

                const pendingCount = expenses.filter(e => e.status === 'Pending').length;

                setSummary({ totalAllocated, approvedExpenses, pendingCount });
            } catch (error) {
                console.error(error);
            }
        };
        fetchSummary();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Title>Manager Dashboard</Title>
                <Button onPress={logout}>Logout</Button>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Overview</Title>
                    <Paragraph>Total Allocated: ₹{summary.totalAllocated}</Paragraph>
                    <Paragraph>Approved Expenses: ₹{summary.approvedExpenses}</Paragraph>
                    <Paragraph style={{ color: summary.pendingCount > 0 ? 'red' : 'green' }}>
                        Pending Requests: {summary.pendingCount}
                    </Paragraph>
                </Card.Content>
                <Card.Actions>
                    <Button onPress={() => navigation.navigate('Approvals')}>View Requests</Button>
                </Card.Actions>
            </Card>

            <View style={styles.grid}>
                {/* Row 1 */}
                <View style={styles.row}>
                    <Button mode="contained" style={styles.gridButton} onPress={() => Alert.alert('Info', 'Daily Expense Report Feature')}>
                        Daily Expense
                    </Button>
                    <Button mode="contained" style={styles.gridButton} onPress={() => navigation.navigate('SitesMaterials', { viewMode: 'materials' })}>
                        Material Rate
                    </Button>
                </View>

                {/* Row 2 */}
                <View style={styles.row}>
                    <Button mode="contained" style={styles.gridButton} onPress={() => Alert.alert('Info', 'Daily Wages Feature')}>
                        Daily Wages
                    </Button>
                    <Button mode="contained" style={styles.gridButton} onPress={() => Alert.alert('Info', 'Notifications Feature')}>
                        Notification
                    </Button>
                </View>

                {/* Row 3 */}
                <View style={styles.row}>
                    <Button mode="contained" style={styles.gridButton} onPress={() => Alert.alert('Info', 'Site Location Feature')}>
                        Site Location
                    </Button>
                    <Button mode="contained" style={styles.gridButton} onPress={() => Alert.alert('Info', 'Site Surveillance Feature')}>
                        Site Surv.
                    </Button>
                </View>

                {/* Row 4 */}
                <View style={styles.row}>
                    <Button mode="contained" style={styles.gridButton} onPress={() => navigation.navigate('AddSupervisor')}>
                        Engineers
                    </Button>
                    <Button mode="contained" style={styles.gridButton} onPress={() => navigation.navigate('Approvals')}>
                        Approvals
                    </Button>
                </View>

                {/* Row 5 */}
                <View style={styles.row}>
                    <Button mode="contained" style={styles.gridButton} onPress={() => navigation.navigate('Allocations')}>
                        Petty Cash
                    </Button>
                    <Button mode="contained" style={styles.gridButton} onPress={() => navigation.navigate('SitesMaterials', { viewMode: 'sites' })}>
                        Site Exp.
                    </Button>
                </View>

                {/* Row 6 */}
                <View style={styles.row}>
                    <Button mode="contained" style={styles.gridButton} onPress={() => Alert.alert('Info', 'Circular Announcement Feature')}>
                        Circular
                    </Button>
                    <Button mode="contained" style={styles.gridButton} onPress={() => Alert.alert('Info', 'Daily Activity Feature')}>
                        Activity
                    </Button>
                </View>

                <Button
                    mode="contained"
                    icon="download"
                    style={[styles.fullWidthButton, { backgroundColor: 'gray', marginTop: 10 }]}
                    onPress={() => Linking.openURL('http://10.0.2.2:5000/api/reports/expenses')}
                >
                    Download Report
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    card: { marginBottom: 20 },
    grid: { marginTop: 10, paddingBottom: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    gridButton: { flex: 0.48, marginHorizontal: '1%' },
    fullWidthButton: { width: '100%', marginBottom: 10 }
});

export default ManagerDashboard;
