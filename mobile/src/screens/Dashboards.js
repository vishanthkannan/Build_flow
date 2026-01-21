import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

export const ManagerDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome Manager {user?.username}</Text>
            <Button mode="contained" onPress={logout}>Logout</Button>
        </View>
    );
};

export const SupervisorDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome Supervisor {user?.username}</Text>
            <Button mode="contained" onPress={logout}>Logout</Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { marginBottom: 20, fontSize: 18 }
});
