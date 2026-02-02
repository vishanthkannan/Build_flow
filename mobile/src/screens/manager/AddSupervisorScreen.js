import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, Animated, Easing } from 'react-native';
import { TextInput, Button, Title, Paragraph, Text } from 'react-native-paper';
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
                    duration: 1000, // Faster (1s)
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false
                })
            ).start();
        } else {
            anim.stopAnimation();
        }
    }, [visible]);

    if (!visible) return null;

    // Simulate "50% { width: 100% }"
    const width = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0%', '100%', '0%'] // Grow then shrink to mimic the cycle
    });

    return (
        <Modal transparent={true} animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                {/* .container */}
                <View style={styles.loaderContainer}>
                    {/* .loader (Track) */}
                    <View style={styles.loaderTrack}>
                        {/* ::before (Green Bar) */}
                        <Animated.View style={[styles.activeBar, { width }]} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const AddSupervisorScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false); // New state for overlay
    const [supervisors, setSupervisors] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editPassword, setEditPassword] = useState('');
    const [editPhone, setEditPhone] = useState('');

    const fetchSupervisors = async () => {
        try {
            const res = await api.get('/users/supervisors');
            setSupervisors(res.data || []);
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error(error);
            }
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

        setSubmitting(true);
        try {
            await Promise.all([
                api.post('/auth/register', {
                    username,
                    password,
                    phone,
                    role: 'supervisor'
                }),
                new Promise(resolve => setTimeout(resolve, 1000)) // 1s
            ]);
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
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    setSubmitting(true);
                    try {
                        await Promise.all([
                            api.delete(`/users/${id}`),
                            new Promise(resolve => setTimeout(resolve, 1000)) // 1s
                        ]);
                        fetchSupervisors();
                    } catch (error) {
                        console.error(error);
                        const msg = error.response?.data?.message || error.message || 'Failed to delete';
                        Alert.alert('Error', msg);
                    } finally {
                        setSubmitting(false);
                    }
                }
            }
        ]);
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        setSubmitting(true);
        try {
            const body = {};
            if (editPassword) body.password = editPassword;
            if (editPhone) body.phone = editPhone;

            if (Object.keys(body).length === 0) {
                setEditingUser(null);
                setSubmitting(false);
                return;
            }

            await Promise.all([
                api.put(`/users/${editingUser._id}`, body),
                new Promise(resolve => setTimeout(resolve, 1000)) // 1s
            ]);

            Alert.alert('Success', 'Supervisor updated');
            setEditingUser(null);
            setEditPassword('');
            setEditPhone('');
            fetchSupervisors();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || 'Failed to update';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
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
                    style={{ marginBottom: 20 }}
                >
                    Create Supervisor
                </Button>

                <Title style={{ marginBottom: 10 }}>Existing Supervisors</Title>
                {supervisors.map(s => (
                    <View key={s._id} style={styles.card}>
                        <View style={{ flex: 1 }}>
                            <Title style={{ fontSize: 16 }}>{s.username}</Title>
                            <Paragraph>Phone: {s.phone ? s.phone : 'N/A'}</Paragraph>
                            <View style={{ marginTop: 6, backgroundColor: '#f0fdf4', padding: 4, borderRadius: 4, alignSelf: 'flex-start' }}>
                                <Text style={{ color: '#16a34a', fontWeight: 'bold', fontSize: 12 }}>
                                    Wallet Balance: ₹{s.balance !== undefined ? s.balance : '...'}
                                </Text>
                            </View>
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

            <GreenProgressBarLoader visible={submitting} />
        </View>
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

export default AddSupervisorScreen;
