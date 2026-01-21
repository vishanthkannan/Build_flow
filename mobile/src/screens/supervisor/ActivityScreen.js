import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Card, Paragraph } from 'react-native-paper';
import api from '../../services/api';

const ActivityScreen = () => {
    const [activities, setActivities] = useState([]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const res = await api.get('/activities');
            setActivities(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleSubmit = async () => {
        if (!description) return;
        setSubmitting(true);
        try {
            await api.post('/activities', { description });
            setDescription('');
            fetchActivities();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit activity');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/activities/${id}`);
            fetchActivities();
        } catch (error) {
            Alert.alert('Error', 'Failed to delete');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title>Daily Work Activity</Title>
            <View style={styles.form}>
                <TextInput
                    label="Description of work"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                />
                <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
                    Submit Activity
                </Button>
            </View>

            <Title style={{ marginTop: 20 }}>Recent Activities</Title>
            {activities.map(activity => (
                <Card key={activity._id} style={styles.card}>
                    <Card.Content>
                        <Paragraph>{activity.description}</Paragraph>
                        <Paragraph style={styles.date}>{new Date(activity.date).toDateString()}</Paragraph>
                    </Card.Content>
                    <Card.Actions>
                        <Button onPress={() => handleDelete(activity._id)}>Delete</Button>
                    </Card.Actions>
                </Card>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    form: { marginBottom: 20 },
    input: { marginBottom: 10, backgroundColor: 'white' },
    card: { marginBottom: 10 },
    date: { fontSize: 12, color: 'gray', marginTop: 5 }
});

export default ActivityScreen;
