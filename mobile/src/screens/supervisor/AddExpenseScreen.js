import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

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
            setForm({ ...form, material_id: '', material_name: '', price_per_unit: '' });
        } else {
            const selected = materials.find(m => m._id === itemValue);
            if (selected) {
                setForm({
                    ...form,
                    material_id: selected._id,
                    material_name: selected.name,
                    price_per_unit: selected.base_price.toString()
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
            await api.post('/expenses', {
                ...form,
                quantity: parseFloat(form.quantity),
                price_per_unit: parseFloat(form.price_per_unit)
            });
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
        <ScrollView contentContainerStyle={styles.container}>
            <Title>Add Daily Expense</Title>

            <View style={styles.inputContainer}>
                <Title style={styles.label}>Site *</Title>
                <View style={styles.picker}>
                    <Picker
                        selectedValue={form.site_id}
                        onValueChange={(itemValue) => handleChange('site_id', itemValue)}
                    >
                        <Picker.Item label="Select Site" value="" />
                        {sites.map(s => <Picker.Item key={s._id} label={s.name} value={s._id} />)}
                    </Picker>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Title style={styles.label}>Material *</Title>
                <View style={styles.picker}>
                    <Picker
                        selectedValue={form.material_id || (form.material_name ? 'manual' : '')}
                        onValueChange={handleMaterialChange}
                    >
                        <Picker.Item label="Select Material" value="" />
                        {materials.map(m => <Picker.Item key={m._id} label={m.name} value={m._id} />)}
                        <Picker.Item label="Manual Entry" value="manual" />
                    </Picker>
                </View>
            </View>

            {(!form.material_id) && (
                <TextInput
                    label="Material Name *"
                    value={form.material_name}
                    onChangeText={(text) => handleChange('material_name', text)}
                    style={styles.input}
                />
            )}

            <TextInput
                label="Quantity *"
                value={form.quantity}
                onChangeText={(text) => handleChange('quantity', text)}
                keyboardType="numeric"
                style={styles.input}
            />

            <TextInput
                label="Price per Unit *"
                value={form.price_per_unit}
                onChangeText={(text) => handleChange('price_per_unit', text)}
                keyboardType="numeric"
                style={styles.input}
            />

            <Title style={{ alignSelf: 'flex-end', marginBottom: 10 }}>Total: ₹{calculateTotal()}</Title>

            <TextInput
                label="Bill Number"
                value={form.bill_number}
                onChangeText={(text) => handleChange('bill_number', text)}
                style={styles.input}
            />
            <TextInput
                label="Shop Name"
                value={form.bill_name}
                onChangeText={(text) => handleChange('bill_name', text)}
                style={styles.input}
            />
            <TextInput
                label="Bill Type"
                value={form.bill_type}
                onChangeText={(text) => handleChange('bill_type', text)}
                style={styles.input}
            />

            <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
                Submit Expense
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: 'white' },
    inputContainer: { marginBottom: 15 },
    label: { fontSize: 16, marginBottom: 5 },
    picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, backgroundColor: 'white' }
});

export default AddExpenseScreen;
