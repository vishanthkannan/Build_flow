import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Paragraph, DataTable } from 'react-native-paper';
import api from '../../services/api';

const ManagerActivityScreen = () => {
    const [activities, setActivities] = useState([]);

    const fetchActivities = async () => {
        try {
            const res = await api.get('/activities');
            setActivities(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.header}>All Daily Activities</Title>

            {activities.length === 0 ? (
                <Paragraph>No activities found.</Paragraph>
            ) : (
                activities.map(activity => (
                    <Card key={activity._id} style={styles.card}>
                        <Card.Content>
                            <Paragraph style={styles.supervisor}>Supervisor: {activity.supervisor?.username || 'Unknown'}</Paragraph>
                            <Paragraph>{activity.description}</Paragraph>
                            <Paragraph style={styles.date}>{new Date(activity.date).toDateString()}</Paragraph>
                        </Card.Content>
                    </Card>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 10, paddingBottom: 50 },
    header: { marginBottom: 15 },
    card: { marginBottom: 10 },
    supervisor: { fontWeight: 'bold', marginBottom: 5 },
    date: { fontSize: 12, color: 'gray', marginTop: 5, textAlign: 'right' }
});

export default ManagerActivityScreen;
