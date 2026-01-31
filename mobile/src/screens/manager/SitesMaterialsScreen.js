import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, List, SegmentedButtons } from 'react-native-paper';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const SitesMaterialsScreen = ({ route, navigation }) => {
    const { viewMode } = route.params || {};
    const [view, setView] = useState(viewMode || 'sites'); // sites | materials
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [siteName, setSiteName] = useState('');
    const [siteLocation, setSiteLocation] = useState('');

    const [matName, setMatName] = useState('');
    const [matUnit, setMatUnit] = useState('');
    const [matPrice, setMatPrice] = useState('');
    const [matShop, setMatShop] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = view === 'sites' ? '/sites' : '/materials';
            const res = await api.get(endpoint);
            setItems(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode) {
            setView(viewMode);
        }
    }, [viewMode]);

    useEffect(() => {
        fetchData();
    }, [view]);

    const handleAddSite = async () => {
        if (!siteName || !siteLocation) return;
        try {
            await api.post('/sites', { name: siteName, location: siteLocation });
            setSiteName('');
            setSiteLocation('');
            fetchData();
            Alert.alert('Success', 'Site added');
        } catch (e) {
            Alert.alert('Error', 'Failed to add site');
        }
    };

    const handleAddMaterial = async () => {
        if (!matName || !matUnit || !matPrice) return;
        try {
            await api.post('/materials', {
                name: matName,
                unit: matUnit,
                base_price: parseFloat(matPrice),
                shop_name: matShop
            });
            setMatName('');
            setMatUnit('');
            setMatPrice('');
            setMatShop('');
            fetchData();
            Alert.alert('Success', 'Material added');
        } catch (e) {
            Alert.alert('Error', 'Failed to add material');
        }
    };

    const { user } = React.useContext(AuthContext);
    const isManager = user?.role === 'manager';

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {isManager && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                    <Button mode={view === 'sites' ? 'contained' : 'outlined'} onPress={() => setView('sites')}>Sites</Button>
                    <Button mode={view === 'materials' ? 'contained' : 'outlined'} onPress={() => setView('materials')}>Materials</Button>
                </View>
            )}

            {view === 'sites' ? (
                <View>
                    <Title>Add New Site</Title>
                    <TextInput label="Site Name" value={siteName} onChangeText={setSiteName} style={styles.input} />
                    <TextInput label="Location" value={siteLocation} onChangeText={setSiteLocation} style={styles.input} />
                    <Button mode="contained" onPress={handleAddSite} style={styles.btn}>Add Site</Button>
                </View>
            ) : (
                <View>
                    <Title>Add New Material</Title>
                    <TextInput label="Material Name" value={matName} onChangeText={setMatName} style={styles.input} />
                    <TextInput label="Unit (kg, bags)" value={matUnit} onChangeText={setMatUnit} style={styles.input} />
                    <TextInput label="Base Price" value={matPrice} onChangeText={setMatPrice} keyboardType="numeric" style={styles.input} />
                    <TextInput label="Shop Name (Optional)" value={matShop} onChangeText={setMatShop} style={styles.input} />
                    <Button mode="contained" onPress={handleAddMaterial} style={styles.btn}>Add Material</Button>
                </View>
            )}

            <Title style={{ marginTop: 20 }}>{view === 'sites' ? 'All Sites' : 'All Materials'}</Title>
            {items.map(item => (
                <List.Item
                    key={item._id}
                    title={item.name}
                    description={view === 'sites' ? item.location : `₹${item.base_price}/${item.unit}`}
                    left={props => <List.Icon {...props} icon={view === 'sites' ? 'map-marker' : 'package-variant'} />}
                    onPress={() => {
                        if (view === 'sites') {
                            navigation.navigate('SiteExpenses', { siteId: item._id, siteName: item.name });
                        }
                    }}
                />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    input: { marginBottom: 10, backgroundColor: 'white' },
    btn: { marginBottom: 10 }
});

export default SitesMaterialsScreen;
