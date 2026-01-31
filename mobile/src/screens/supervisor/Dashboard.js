import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Dimensions, Linking } from 'react-native';
import { Text, Card, Title, Button, TouchableRipple, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import api, { API_URL } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SupervisorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigation = useNavigation();
    const [dashboardData, setDashboardData] = useState({
        totalAllocated: 0,
        approvedSpent: 0,
        remainingBalance: 0
    });
    const [loading, setLoading] = useState(false);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const allocationsRes = await api.get('/allocations');
            const expensesRes = await api.get('/expenses');

            const allocations = allocationsRes.data || [];
            const expenses = expensesRes.data || [];

            const totalAllocated = allocations.reduce((acc, curr) => acc + curr.amount, 0);

            // "Approved amount spent"
            const approvedExpenses = expenses.filter(e => e.status === 'Approved');
            const approvedSpent = approvedExpenses.reduce((acc, curr) => acc + curr.total_amount, 0);

            const remainingBalance = totalAllocated - approvedSpent;

            setDashboardData({
                totalAllocated,
                approvedSpent,
                remainingBalance
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

    const menuItems = [
        { label: 'Daily Expense', icon: 'cash-plus', route: 'AddExpense', color: '#10b981' }, // emerald-500
        { label: 'Attendance', icon: 'account-clock', route: 'Attendance', color: '#3b82f6' }, // blue-500
        { label: 'Activity', icon: 'chart-timeline-variant', route: 'Activity', color: '#f59e0b' }, // amber-500
        { label: 'Material Rate', icon: 'tag-outline', route: 'SitesMaterials', params: { viewMode: 'materials' }, color: '#ec4899' }, // pink-500
        { label: 'Notifications', icon: 'bell-outline', action: () => Alert.alert('Info', 'Notifications Feature'), color: '#eab308' }, // yellow-500
        { label: 'Site Location', icon: 'map-marker-outline', action: () => Alert.alert('Info', 'Site Location Feature'), color: '#f97316' }, // orange-500
        { label: 'Site Surv.', icon: 'cctv', action: () => Alert.alert('Info', 'Site Surveillance Feature'), color: '#64748b' }, // slate-500
        { label: 'Circular', icon: 'bullhorn-outline', action: () => Alert.alert('Info', 'Circular Announcement Feature'), color: '#14b8a6' }, // teal-500
    ];

    const handlePress = (item) => {
        if (item.route) {
            navigation.navigate(item.route, item.params);
        } else if (item.action) {
            item.action();
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: '#f1f5f9' }]}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text variant="headlineSmall" style={styles.welcomeText}>Welcome Check,</Text>
                    <Text variant="titleMedium" style={styles.userName}>{user?.username || 'Supervisor'}</Text>
                </View>
                <TouchableRipple onPress={logout} style={styles.logoutButton}>
                    <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
                </TouchableRipple>
            </View>

            {/* Stats Overview */}
            <Surface style={styles.statsContainer} elevation={2}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Allocated</Text>
                    <Text style={[styles.statValue, { color: '#3b82f6' }]}>₹{dashboardData.totalAllocated}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Spent</Text>
                    <Text style={[styles.statValue, { color: '#10b981' }]}>₹{dashboardData.approvedSpent}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Balance</Text>
                    <Text style={[styles.statValue, { color: dashboardData.remainingBalance < 0 ? '#ef4444' : '#6366f1' }]}>
                        ₹{dashboardData.remainingBalance}
                    </Text>
                </View>
            </Surface>

            {/* Menu Grid */}
            <View style={styles.gridContainer}>
                {menuItems.map((item, index) => (
                    <Surface key={index} style={styles.gridItem} elevation={1}>
                        <TouchableRipple
                            onPress={() => handlePress(item)}
                            style={styles.touchable}
                            rippleColor="rgba(0, 0, 0, .1)"
                        >
                            <View style={styles.itemContent}>
                                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                                    <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
                                </View>
                                <Text style={styles.itemLabel}>{item.label}</Text>
                            </View>
                        </TouchableRipple>
                    </Surface>
                ))}
            </View>

            {/* Recent Activity Section Header (Optional placeholder if we want to restore logic later) */}
            {/* For now keeping it clean as per request "like manager dashboard" */}

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 20,
    },
    welcomeText: {
        color: '#64748b',
        fontWeight: 'bold',
    },
    userName: {
        color: '#1e293b',
        fontWeight: 'bold',
        fontSize: 24,
    },
    logoutButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#fef2f2',
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: '80%',
        backgroundColor: '#e2e8f0',
    },
    statLabel: {
        color: '#64748b',
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
    },
    gridItem: {
        width: (width - 48) / 3,
        height: 110,
        margin: 5,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    touchable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContent: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 12,
        color: '#334155',
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default SupervisorDashboard;
