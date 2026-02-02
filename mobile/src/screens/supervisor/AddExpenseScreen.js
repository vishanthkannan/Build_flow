import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, Animated, Easing } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useRef } from 'react';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

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

const AddExpenseScreen = () => {
    const navigation = useNavigation();
    const [sites, setSites] = useState([]);
    const [materials, setMaterials] = useState([]);

    const [form, setForm] = useState({
        site_id: '',
        material_id: '',
        material_name: '',
        quantity: '',
        price_per_unit: '',
        bill_number: '',
        bill_name: '',
        bill_type: '',
    });

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [sitesRes, materialsRes] = await Promise.all([
                    api.get('/sites'),
                    api.get('/materials')
                ]);
                setSites(sitesRes.data || []);
                setMaterials(materialsRes.data || []);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleMaterialChange = (itemValue) => {
        if (itemValue === 'manual') {
            setForm({
                ...form,
                material_id: '',
                material_name: '',
                price_per_unit: '',
                bill_name: '' // Clear shop name for manual
            });
        } else {
            const selected = materials.find(m => m._id === itemValue);
            if (selected) {
                setForm({
                    ...form,
                    material_id: selected._id,
                    material_name: selected.name,
                    price_per_unit: selected.base_price ? selected.base_price.toString() : '',
                    bill_name: selected.shop_name || '' // Auto-fill shop name if available
                });
            }
        }
    };

    const handleSubmit = async () => {
        if (!form.site_id || !form.material_name || !form.quantity || !form.price_per_unit) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }

        setSubmitting(true);
        try {
            await Promise.all([
                api.post('/expenses', {
                    ...form,
                    quantity: parseFloat(form.quantity),
                    price_per_unit: parseFloat(form.price_per_unit)
                }),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            Alert.alert('Success', 'Expense submitted successfully');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit expense');
        } finally {
            setSubmitting(false);
        }
    };

    const calculateTotal = () => {
        const q = parseFloat(form.quantity) || 0;
        const p = parseFloat(form.price_per_unit) || 0;
        return (q * p).toFixed(2);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView style={styles.screen} contentContainerStyle={styles.container}>

                <Text style={styles.screenTitle}>New Expense</Text>

                <View style={styles.formSection}>

                    {/* Site Selection */}
                    <Text style={styles.inputLabel}>Site *</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={form.site_id}
                            onValueChange={(val) => handleChange('site_id', val)}
                            style={styles.picker}
                            mode="dropdown"
                        >
                            <Picker.Item label="Select Site..." value="" color="#94a3b8" />
                            {sites.map(s => <Picker.Item key={s._id} label={s.name} value={s._id} color="#0f172a" />)}
                        </Picker>
                    </View>

                    {/* Material Selection */}
                    <Text style={styles.inputLabel}>Material *</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={form.material_id || (form.material_name ? 'manual' : '')}
                            onValueChange={handleMaterialChange}
                            style={styles.picker}
                            mode="dropdown"
                        >
                            <Picker.Item label="Select Material..." value="" color="#94a3b8" />
                            {materials.map(m => <Picker.Item key={m._id} label={m.name} value={m._id} color="#0f172a" />)}
                            <Picker.Item label="+ Manual Entry" value="manual" color="#2563eb" />
                        </Picker>
                    </View>

                    {/* Manual Material Name */}
                    {!form.material_id && (
                        <TextInput
                            mode="outlined"
                            label="Material Name *"
                            value={form.material_name}
                            onChangeText={(text) => handleChange('material_name', text)}
                            style={styles.input}
                            outlineColor="#cbd5e1"
                            activeOutlineColor="#334155"
                        />
                    )}

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <TextInput
                                mode="outlined"
                                label="Quantity *"
                                value={form.quantity}
                                onChangeText={(text) => handleChange('quantity', text)}
                                keyboardType="numeric"
                                style={styles.input}
                                outlineColor="#cbd5e1"
                                activeOutlineColor="#334155"
                            />
                        </View>
                        <View style={styles.col}>
                            <TextInput
                                mode="outlined"
                                label="Price per Unit *"
                                value={form.price_per_unit}
                                onChangeText={(text) => handleChange('price_per_unit', text)}
                                keyboardType="numeric"
                                style={styles.input}
                                outlineColor="#cbd5e1"
                                activeOutlineColor="#334155"
                                left={<TextInput.Affix text="₹" />}
                            />
                        </View>
                    </View>

                    <Surface style={styles.totalBanner} elevation={0}>
                        <Text style={styles.totalLabel}>ESTIMATED TOTAL</Text>
                        <Text style={styles.totalValue}>₹ {calculateTotal()}</Text>
                    </Surface>

                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionHeader}>Bill Details (Optional)</Text>

                <TextInput
                    mode="outlined"
                    label="Bill Number"
                    value={form.bill_number}
                    onChangeText={(text) => handleChange('bill_number', text)}
                    style={styles.input}
                    outlineColor="#cbd5e1"
                    activeOutlineColor="#334155"
                />

                <TextInput
                    mode="outlined"
                    label="Shop / Vendor Name"
                    value={form.bill_name}
                    onChangeText={(text) => handleChange('bill_name', text)}
                    style={styles.input}
                    outlineColor="#cbd5e1"
                    activeOutlineColor="#334155"
                />

                <TextInput
                    mode="outlined"
                    label="Bill Type (Clean/Raw)"
                    value={form.bill_type}
                    onChangeText={(text) => handleChange('bill_type', text)}
                    style={styles.input}
                    outlineColor="#cbd5e1"
                    activeOutlineColor="#334155"
                />

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={submitting}
                    disabled={submitting}
                    style={styles.submitBtn}
                    contentStyle={{ paddingVertical: 6 }}
                    labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                >
                    Submit Expense
                </Button>
            </View>
            <GreenProgressBarLoader visible={submitting} />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        padding: 24,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 24,
        marginTop: 10,
    },
    formSection: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        marginTop: 4,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 4,
        backgroundColor: '#fff',
        marginBottom: 16,
        height: 54,
        justifyContent: 'center',
    },
    picker: {
        height: 54,
        width: '100%',
    },
    input: {
        backgroundColor: '#fff',
        marginBottom: 16,
        fontSize: 15,
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: -6,
    },
    col: {
        flex: 1,
        paddingHorizontal: 6,
    },
    totalBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 16,
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    submitBtn: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
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

export default AddExpenseScreen;
