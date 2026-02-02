import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, Animated, Easing, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput as PaperInput, Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';

// Green Linear Loader
const GreenProgressBarLoader = ({ visible }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            anim.setValue(0);
            Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false
                })
            ).start();
        } else {
            anim.stopAnimation();
        }
    }, [visible]);

    if (!visible) return null;

    const width = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0%', '100%', '0%']
    });

    return (
        <Modal transparent={true} animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.loaderContainer}>
                    <View style={styles.loaderTrack}>
                        <Animated.View style={[styles.activeBar, { width }]} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const ApprovalsScreen = () => {
    const [expenses, setExpenses] = useState([]);

    // Rejection Logic
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
        setSubmitting(true);
        try {
            await Promise.all([
                api.put(`/expenses/${id}/status`, { status: 'Approved' }),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            Alert.alert('Success', 'Expense Approved');
            fetchExpenses();
        } catch (e) {
            Alert.alert('Error', 'Failed to approve');
        } finally {
            setSubmitting(false);
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
        setSubmitting(true);
        try {
            await Promise.all([
                api.put(`/expenses/${rejectId}/status`, {
                    status: 'Rejected',
                    rejection_reason: rejectReason
                }),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            setModalVisible(false);
            setRejectId(null);
            fetchExpenses();
            Alert.alert('Success', 'Expense Rejected');
        } catch (e) {
            Alert.alert('Error', 'Failed to reject');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
                <Title style={styles.headerTitle}>Pending Approvals</Title>

                {expenses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="check-all" size={48} color="#cbd5e1" />
                        <Paragraph style={{ color: '#64748b', marginTop: 10 }}>No pending expenses.</Paragraph>
                    </View>
                ) : (
                    expenses.map(expense => (
                        <Surface key={expense._id} style={styles.card} elevation={2}>
                            <View style={styles.cardHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name="cube-outline" size={20} color="#6366f1" />
                                    </View>
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={styles.materialName}>{expense.material_name}</Text>
                                        <Text style={styles.siteName}>{expense.site?.name}</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.amount}>₹{expense.total_amount}</Text>
                                    <Text style={styles.date}>{new Date(expense.date).toLocaleDateString()}</Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <View style={styles.detailRow}>
                                    <MaterialCommunityIcons name="account" size={14} color="#64748b" />
                                    <Text style={styles.detailText}>{expense.supervisor?.username}</Text>
                                </View>
                                {expense.is_price_changed && (
                                    <View style={[styles.detailRow, { marginLeft: 12 }]}>
                                        <MaterialCommunityIcons name="alert-circle" size={14} color="#ef4444" />
                                        <Text style={[styles.detailText, { color: '#ef4444' }]}>Price Change Alert</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.actionRow}>
                                <Button
                                    mode="outlined"
                                    color="#ef4444"
                                    style={[styles.actionBtn, { borderColor: '#fecaca', backgroundColor: '#fef2f2' }]}
                                    labelStyle={{ color: '#ef4444' }}
                                    onPress={() => handleRejectInit(expense._id)}
                                >
                                    Reject
                                </Button>
                                <Button
                                    mode="contained"
                                    color="#10b981"
                                    style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                                    onPress={() => handleApprove(expense._id)}
                                >
                                    Approve
                                </Button>
                            </View>
                        </Surface>
                    ))
                )}
            </ScrollView>

            {/* Rejection Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBg}>
                    <Surface style={styles.modalContent} elevation={5}>
                        <Title style={{ marginBottom: 10 }}>Reject Expense</Title>
                        <Text style={{ marginBottom: 15, color: '#666' }}>Please provide a reason for rejection.</Text>
                        <PaperInput
                            mode="outlined"
                            label="Reason"
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            style={{ marginBottom: 20, backgroundColor: '#fff' }}
                            multiline
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Button onPress={() => setModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
                            <Button mode="contained" onPress={handleRejectConfirm} color="#ef4444">Confirm Reject</Button>
                        </View>
                    </Surface>
                </View>
            </Modal>

            <GreenProgressBarLoader visible={submitting} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#f8fafc', minHeight: '100%' },
    headerTitle: { marginBottom: 20, fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
    emptyState: { alignItems: 'center', marginTop: 50 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    materialName: { fontSize: 16, fontWeight: '700', color: '#333' },
    siteName: { fontSize: 13, color: '#64748b', marginTop: 2 },
    amount: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
    date: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    detailText: { marginLeft: 4, fontSize: 13, color: '#64748b' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBtn: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 8,
    },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white', padding: 24, width: '100%', borderRadius: 16
    },
    // LOADER STYLES
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderTrack: {
        width: '60%',
        height: 10,
        borderRadius: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden',
    },
    activeBar: {
        height: '100%',
        backgroundColor: 'rgb(9, 188, 9)',
        borderRadius: 2,
        shadowColor: 'rgb(9, 188, 9)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 10,
    }
});

export default ApprovalsScreen;
