import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, List } from 'react-native-paper'; // Removed Picker import as it's not in paper, using standard picker
import { Picker } from '@react-native-picker/picker'; // Standard picker
import api from '../../services/api';

// Need to get list of supervisors?
// There isn't a Route to get list of users unless manager.
// Assuming /api/allocations gives manager all allocations and populate supervisor.
// But to Add Allocation, I need to select a supervisor.
// I didn't create a 'list supervisors' route.
// Wait, I can probably get list of users who are supervisors if I add a route or filter.
// For now, I'll rely on the seed data having 'sup1' or just text input for supervisor ID (bad UX).
// I'll update Site/Material routes to be generic CRUD, but User management is missing list.
// I'll fetch allocations and map details? No.
// I'll update backend to have `GET /api/users` for manager.

// But first, let's just assume I can list allocations and maybe just a text input for ID if no route.
// Or better: Use `api.get('/users?role=supervisor')`. I need to implement that.

const AllocationsScreen = () => {
    const [supervisors, setSupervisors] = useState([]);
    const [allocations, setAllocations] = useState([]);

    const [selectedSup, setSelectedSup] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAllocations();
        fetchSupervisors();
    }, []);

    const fetchSupervisors = async () => {
        try {
            const res = await api.get('/users/supervisors');
            setSupervisors(res.data || []);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch supervisors');
        }
    };

    const fetchAllocations = async () => {
        try {
            const res = await api.get('/allocations');
            setAllocations(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAllocate = async () => {
        if (!selectedSup || !amount) {
            Alert.alert('Error', 'Please select a supervisor and enter amount');
            return;
        }
        try {
            await api.post('/allocations', {
                supervisor_id: selectedSup,
                amount: parseFloat(amount)
            });
            setAmount('');
            fetchAllocations();
            Alert.alert('Success', 'Money Allocated');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Allocation failed');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title>Allocate Funds</Title>

            <View style={styles.inputContainer}>
                <Title style={styles.label}>Select Supervisor</Title>
                <View style={{ borderRadius: 4, borderWidth: 1, borderColor: '#ccc', backgroundColor: 'white' }}>
                    <Picker
                        selectedValue={selectedSup}
                        onValueChange={(itemValue) => setSelectedSup(itemValue)}
                    >
                        <Picker.Item label="Select Supervisor" value="" />
                        {supervisors.map(sup => (
                            <Picker.Item key={sup._id} label={sup.username} value={sup._id} />
                        ))}
                    </Picker>
                </View>
            </View>

            <TextInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.input}
            />

            <Button mode="contained" onPress={handleAllocate}>Allocate</Button>

            <Title style={{ marginTop: 20 }}>Allocation History</Title>
            {allocations.map(alloc => (
                <List.Item
                    key={alloc._id}
                    title={`₹${alloc.amount} to ${alloc.supervisor?.username || 'Unknown'}`}
                    description={new Date(alloc.date).toLocaleDateString()}
                    left={props => <List.Icon {...props} icon="cash" />}
                />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: 'white' },
    inputContainer: { marginBottom: 15 },
    label: { fontSize: 16 }
});

export default AllocationsScreen;
