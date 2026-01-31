import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import api from '../../services/api';

const AddSupervisorScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [supervisors, setSupervisors] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editPassword, setEditPassword] = useState('');
    const [editPhone, setEditPhone] = useState('');

    const fetchSupervisors = async () => {
        try {
            const res = await api.get('/users/supervisors');
            setSupervisors(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSupervisors();
    }, []);

    const handleCreate = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                username,
                password,
                phone,
                role: 'supervisor'
            });
            Alert.alert('Success', 'Supervisor created successfully');
            setUsername('');
            setPassword('');
            setPhone('');
            fetchSupervisors();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Failed to create supervisor';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/users/${id}`);
                        fetchSupervisors();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete');
                    }
                }
            }
        ]);
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        try {
            const body = {};
            if (editPassword) body.password = editPassword;
            if (editPhone) body.phone = editPhone;

            if (Object.keys(body).length === 0) {
                setEditingUser(null);
                return;
            }

            await api.put(`/users/${editingUser._id}`, body);
            Alert.alert('Success', 'Supervisor updated');
            setEditingUser(null);
            setEditPassword('');
            setEditPhone('');
            fetchSupervisors();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || 'Failed to update';
            Alert.alert('Error', msg);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title>Create New Supervisor</Title>

            <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                autoCapitalize="none"
            />

            <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
            />

            <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
            />

            <Button
                mode="contained"
                onPress={handleCreate}
                loading={loading}
                disabled={loading}
                style={{ marginBottom: 20 }}
            >
                Create Supervisor
            </Button>

            <Title style={{ marginBottom: 10 }}>Existing Supervisors</Title>
            {supervisors.map(s => (
                <View key={s._id} style={styles.card}>
                    <View style={{ flex: 1 }}>
                        <Title style={{ fontSize: 16 }}>{s.username}</Title>
                        <TextInput
                            mode="outlined"
                            label="Phone"
                            value={s.phone || 'N/A'}
                            editable={false}
                            style={{ height: 40, backgroundColor: '#f0f0f0' }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Button onPress={() => {
                            setEditingUser(s);
                            setEditPhone(s.phone || '');
                            setEditPassword('');
                        }}>Edit</Button>
                        <Button color="red" onPress={() => handleDelete(s._id)}>Del</Button>
                    </View>
                </View>
            ))}

            {/* Edit Modal / Section */}
            {editingUser && (
                <View style={styles.editContainer}>
                    <Title>Edit {editingUser.username}</Title>
                    <TextInput
                        label="New Password (leave blank to keep)"
                        value={editPassword}
                        onChangeText={setEditPassword}
                        secureTextEntry
                        style={styles.input}
                    />
                    <TextInput
                        label="Phone Number"
                        value={editPhone}
                        onChangeText={setEditPhone}
                        style={styles.input}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Button onPress={() => setEditingUser(null)}>Cancel</Button>
                        <Button mode="contained" onPress={handleUpdate}>Update</Button>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: 'white' },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 1
    },
    editContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#e6f7ff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1890ff'
    }
});

export default AddSupervisorScreen;
