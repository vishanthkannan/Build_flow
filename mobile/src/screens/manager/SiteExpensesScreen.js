import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Title, Paragraph, Card, Button, Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
        <ScrollView style={styles.screen} contentContainerStyle={styles.container}>

            {/* Header Summary */}
            <Surface style={styles.summaryCard} elevation={2}>
                <View style={styles.summaryHeader}>
                    <MaterialCommunityIcons name="office-building" size={24} color="#0f172a" />
                    <Title style={styles.siteTitle}>{siteName}</Title>
                </View>
                <View style={styles.divider} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <View>
                        <Text style={styles.totalLabel}>Total Spent</Text>
                        <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                    </View>
                    <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ color: '#166534', fontWeight: 'bold', fontSize: 12 }}>Approved</Text>
                    </View>
                </View>

                <Button
                    mode="contained"
                    icon="download"
                    onPress={() => Linking.openURL(`${API_URL}/reports/expenses?site=${siteId}&token=${user?.token}`)}
                    style={styles.downloadBtn}
                    labelStyle={{ fontSize: 13 }}
                >
                    Download Excel Report
                </Button>
            </Surface>

            <Title style={styles.sectionTitle}>Material Expenses</Title>

            {expenses.length === 0 ? (
                <View style={styles.emptyState}>
                    <Paragraph style={{ color: '#64748b' }}>No approved expenses yet.</Paragraph>
                </View>
            ) : (
                expenses.map(expense => (
                    <Card key={expense._id} style={styles.expenseCard}>
                        <Card.Content style={{ paddingVertical: 10 }}>
                            <View style={styles.row}>
                                {/* Left: Icon & Name */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name="cube" size={18} color="#2563eb" />
                                    </View>
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.itemName}>{expense.material_name}</Text>
                                        <Text style={styles.itemMeta}>Qty: {expense.quantity}</Text>
                                    </View>
                                </View>

                                {/* Right: Price & Date */}
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.itemPrice}>₹{expense.total_amount}</Text>
                                    <Text style={styles.itemDate}>{new Date(expense.date).toLocaleDateString()}</Text>
                                </View>
                            </View>

                            <View style={[styles.row, { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="account-outline" size={14} color="#94a3b8" />
                                    <Text style={styles.supervisorName}>{expense.supervisor?.username || 'Unknown'}</Text>
                                </View>
                                {expense.bill_number ? (
                                    <Text style={styles.billInfo}>Bill #: {expense.bill_number}</Text>
                                ) : null}
                            </View>
                        </Card.Content>
                    </Card>
                ))
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f8fafc' },
    container: { padding: 16 },

    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    siteTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginLeft: 10 },
    divider: { height: 1, backgroundColor: '#e2e8f0', marginBottom: 16 },
    totalLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
    totalValue: { fontSize: 28, fontWeight: '800', color: '#10b981', marginTop: 4 },
    downloadBtn: { borderRadius: 8, backgroundColor: '#334155' },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 16, marginLeft: 4 },
    emptyState: { alignItems: 'center', marginTop: 20 },

    expenseCard: {
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 1,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    itemMeta: { fontSize: 12, color: '#64748b' },
    itemPrice: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    itemDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    supervisorName: { fontSize: 12, color: '#64748b', marginLeft: 4 },
    billInfo: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic' },
});

export default SiteExpensesScreen;
