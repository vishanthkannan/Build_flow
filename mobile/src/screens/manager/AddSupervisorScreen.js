import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import api from '../../services/api';

const AddSupervisorScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            // Role is defaulted to 'supervisor' in backend for register route if not specified, 
            // or we can pass it explicitly.
            await api.post('/auth/register', {
                username,
                password,
                role: 'supervisor'
            });
            Alert.alert('Success', 'Supervisor created successfully');
            setUsername('');
            setPassword('');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Failed to create supervisor';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
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

            <Button
                mode="contained"
                onPress={handleCreate}
                loading={loading}
                disabled={loading}
            >
                Create Supervisor
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: 'white' }
});

export default AddSupervisorScreen;
