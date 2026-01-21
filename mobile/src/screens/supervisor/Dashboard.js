import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Text, FAB, List } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';

const SupervisorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigation = useNavigation();
    const [dashboardData, setDashboardData] = useState({
        totalAllocated: 0,
        approvedSpent: 0,
        remainingBalance: 0,
        recentExpenses: []
    });
    const [loading, setLoading] = useState(false);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Need a dashboard endpoint or aggregate data from existing endpoints
            // For now, let's fetch allocations and expenses and calculate locally
            // Ideally backend should provide a summary endpoint

            const allocationsRes = await api.get('/allocations');
            const expensesRes = await api.get('/expenses');

            const allocations = allocationsRes.data || [];
            const expenses = expensesRes.data || [];

            const totalAllocated = allocations.reduce((acc, curr) => acc + curr.amount, 0);

            // "Approved amount spent"
            const approvedExpenses = expenses.filter(e => e.status === 'Approved');
            const approvedSpent = approvedExpenses.reduce((acc, curr) => acc + curr.total_amount, 0);

            // "Remaining balance" requirement: "Prevent submitting expenses beyond balance" usually implies 
            // balance considers pending too? But display says "Approved amount spent".
            // Let's display Balance = Total - Approved.
            // But for validation we might use pending too.
            const remainingBalance = totalAllocated - approvedSpent;

            setDashboardData({
                totalAllocated,
                approvedSpent,
                remainingBalance,
                recentExpenses: expenses.slice(0, 5)
            });

        } catch (error) {
            console.error('Error fetching dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />
                }
            >
                <View style={styles.header}>
                    <Title>Welcome, {user?.username}</Title>
                    <Button onPress={logout}>Logout</Button>
                </View>

                <Card style={styles.card}>
                    <Card.Content>
                        <Title>Financial Summary</Title>
                        <View style={styles.row}>
                            <Paragraph>Allocated:</Paragraph>
                            <Title style={{ color: 'green' }}>₹{dashboardData.totalAllocated}</Title>
                        </View>
                        <View style={styles.row}>
                            <Paragraph>Approved Spent:</Paragraph>
                            <Title style={{ color: 'orange' }}>₹{dashboardData.approvedSpent}</Title>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.row}>
                            <Paragraph>Balance:</Paragraph>
                            <Title style={{ color: 'blue' }}>₹{dashboardData.remainingBalance}</Title>
                        </View>
                    </Card.Content>
                </Card>

                <Title style={styles.sectionTitle}>Material Submitted</Title>
                {dashboardData.recentExpenses.map((expense) => (
                    <Card key={expense._id} style={styles.expenseCard}>
                        <Card.Content>
                            <View style={styles.row}>
                                <Text style={{ fontWeight: 'bold' }}>{expense.material_name}</Text>
                                <Text>₹{expense.total_amount}</Text>
                            </View>
                            <Text style={{ color: expense.status === 'Approved' ? 'green' : expense.status === 'Rejected' ? 'red' : 'orange' }}>
                                {expense.status}
                            </Text>
                        </Card.Content>
                    </Card>
                ))}

                <View style={styles.grid}>
                    {/* Row 1 */}
                    <View style={styles.row}>
                        <Button mode="contained" style={styles.gridButton} onPress={() => navigation.navigate('AddExpense')}>
                            Daily Expense
                        </Button>
                        <Button mode="contained" style={styles.gridButton} onPress={() => Alert.alert('Info', 'Material Rates Feature')}>
                            Material Rates
                        </Button>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.row}>
                        <Button mode="contained" style={styles.gridButton} onPress={() => navigation.navigate('Attendance')}>
                            Daily Attendance
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
                        <Button mode="contained" style={styles.gridButton} onPress={() => Alert.alert('Info', 'Circular Announcement Feature')}>
                            Circular
                        </Button>
                    </View>

                    {/* Row 4 */}
                    <View style={styles.row}>
                        <Button mode="contained" style={styles.gridButton} onPress={() => navigation.navigate('Activity')}>
                            Daily Activity
                        </Button>
                        <Button mode="contained" style={styles.gridButton} onPress={() => Alert.alert('Info', 'Site Surveillance Feature')}>
                            Site Surv.
                        </Button>
                    </View>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    card: { marginBottom: 20, elevation: 4 },
    expenseCard: { marginBottom: 10 },
    sectionTitle: { marginVertical: 10 },
    grid: { marginTop: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
    gridButton: { flex: 0.48, marginHorizontal: '1%' },
    separator: { height: 1, backgroundColor: '#ccc', marginVertical: 5 },
});

export default SupervisorDashboard;
