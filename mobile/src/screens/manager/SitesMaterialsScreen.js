import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Animated, Easing, Modal } from 'react-native';
import { TextInput, Button, Title, Text, Surface, Card, Paragraph } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

// Green Linear Loader
const GreenProgressBarLoader = ({ visible }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            anim.setValue(0);
            Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 1000, // Faster animation (1s)
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

const SitesMaterialsScreen = ({ route, navigation }) => {
    const { viewMode } = route.params || {};
    const [view, setView] = useState(viewMode || 'sites'); // sites | materials
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false); // Initial fetch loading
    const [submitting, setSubmitting] = useState(false); // Action loading

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
        if (!siteName || !siteLocation) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        setSubmitting(true);
        try {
            await Promise.all([
                api.post('/sites', { name: siteName, location: siteLocation }),
                new Promise(resolve => setTimeout(resolve, 1000)) // 1 sec delay
            ]);
            setSiteName('');
            setSiteLocation('');
            fetchData();
            Alert.alert('Success', 'Site added');
        } catch (e) {
            Alert.alert('Error', 'Failed to add site');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddMaterial = async () => {
        if (!matName || !matUnit || !matPrice) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }
        setSubmitting(true);
        try {
            await Promise.all([
                api.post('/materials', {
                    name: matName,
                    unit: matUnit,
                    base_price: parseFloat(matPrice),
                    shop_name: matShop
                }),
                new Promise(resolve => setTimeout(resolve, 1000)) // 1 sec delay
            ]);
            setMatName('');
            setMatUnit('');
            setMatPrice('');
            setMatShop('');
            fetchData();
            Alert.alert('Success', 'Material added');
        } catch (e) {
            Alert.alert('Error', 'Failed to add material');
        } finally {
            setSubmitting(false);
        }
    };

    const { user } = useContext(AuthContext);
    const isManager = user?.role === 'manager';

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
                {isManager && (
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, view === 'sites' && styles.activeTab]}
                            onPress={() => setView('sites')}
                        >
                            <MaterialCommunityIcons name="office-building-marker" size={20} color={view === 'sites' ? '#fff' : '#64748b'} />
                            <Text style={[styles.tabText, view === 'sites' && styles.activeTabText]}>Detailed Sites</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, view === 'materials' && styles.activeTab]}
                            onPress={() => setView('materials')}
                        >
                            <MaterialCommunityIcons name="tools" size={20} color={view === 'materials' ? '#fff' : '#64748b'} />
                            <Text style={[styles.tabText, view === 'materials' && styles.activeTabText]}>Materials</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Surface style={styles.formCard} elevation={2}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name={view === 'sites' ? "plus-circle" : "tag-plus"} size={22} color="#2563eb" />
                        <Title style={styles.cardTitle}>{view === 'sites' ? 'Add New Site' : 'Add New Material'}</Title>
                    </View>

                    {view === 'sites' ? (
                        <View>
                            <TextInput label="Site Name" mode="outlined" value={siteName} onChangeText={setSiteName} style={styles.input} />
                            <TextInput label="Location" mode="outlined" value={siteLocation} onChangeText={setSiteLocation} style={styles.input} />
                            <Button mode="contained" icon="plus" onPress={handleAddSite} style={styles.submitBtn}>Add Site</Button>
                        </View>
                    ) : (
                        <View>
                            <TextInput label="Material Name" mode="outlined" value={matName} onChangeText={setMatName} style={styles.input} />
                            <View style={styles.row}>
                                <TextInput label="Unit (e.g. kg)" mode="outlined" value={matUnit} onChangeText={setMatUnit} style={[styles.input, { flex: 1, marginRight: 5 }]} />
                                <TextInput label="Base Price (₹)" mode="outlined" value={matPrice} onChangeText={setMatPrice} keyboardType="numeric" style={[styles.input, { flex: 1, marginLeft: 5 }]} />
                            </View>
                            <TextInput label="Shop Name (Optional)" mode="outlined" value={matShop} onChangeText={setMatShop} style={styles.input} />
                            <Button mode="contained" icon="plus" onPress={handleAddMaterial} style={styles.submitBtn}>Add Material</Button>
                        </View>
                    )}
                </Surface>

                <Title style={styles.sectionTitle}>{view === 'sites' ? 'Active Sites' : 'Material Catalog'}</Title>

                {items.map(item => (
                    <Card
                        key={item._id}
                        style={styles.itemCard}
                        onPress={() => {
                            if (view === 'sites') {
                                navigation.navigate('SiteExpenses', { siteId: item._id, siteName: item.name });
                            }
                        }}
                    >
                        <Card.Content style={styles.cardContent}>
                            <View style={[styles.iconBox, { backgroundColor: view === 'sites' ? '#dbeafe' : '#fce7f3' }]}>
                                <MaterialCommunityIcons
                                    name={view === 'sites' ? "map-marker" : "package-variant"}
                                    size={24}
                                    color={view === 'sites' ? '#2563eb' : '#db2777'}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 15 }}>
                                <Title style={styles.itemTitle}>{item.name}</Title>
                                <Paragraph style={styles.itemSub}>
                                    {view === 'sites' ? item.location : `Price: ₹${item.base_price} / ${item.unit}`}
                                </Paragraph>
                                {view === 'materials' && item.shop_name && (
                                    <Text style={styles.shopBadge}>{item.shop_name}</Text>
                                )}
                            </View>
                            {view === 'sites' && <MaterialCommunityIcons name="chevron-right" size={24} color="#bdc3c7" />}
                        </Card.Content>
                    </Card>
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Render the full page loader */}
            <GreenProgressBarLoader visible={submitting} />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f8fafc' },
    container: { padding: 16 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 4, marginBottom: 20, elevation: 1 },
    tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
    activeTab: { backgroundColor: '#2563eb' },
    tabText: { marginLeft: 8, fontWeight: '600', color: '#64748b' },
    activeTabText: { color: '#fff' },
    formCard: { padding: 20, borderRadius: 16, backgroundColor: '#fff', marginBottom: 24, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: '700', marginLeft: 8, color: '#334155' },
    input: { marginBottom: 12, backgroundColor: '#fff', fontSize: 14 },
    row: { flexDirection: 'row' },
    submitBtn: { marginTop: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: '#2563eb' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, marginLeft: 4 },
    itemCard: { marginBottom: 12, borderRadius: 12, backgroundColor: '#fff', elevation: 1 },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    itemTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    itemSub: { fontSize: 13, color: '#666' },
    shopBadge: { fontSize: 11, color: '#888', marginTop: 2 },

    // OVERLAY STYLES
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.8)', // Lighter overlay for this style, or keep dark? CSS implies generally light theme compatibility. Let's start with clean white-ish overlay to let colors pop.
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderTrack: {
        width: '60%', // .loader { width: 60% }
        height: 10,
        borderRadius: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden', // to keep inner bar rounded
    },
    activeBar: {
        height: '100%',
        backgroundColor: 'rgb(9, 188, 9)', // The Green
        borderRadius: 2,
        shadowColor: 'rgb(9, 188, 9)', // box-shadow: rgb(9, 188, 9) 0px 2px 29px 0px;
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 15, // Approximation of 29px spread
        elevation: 10, // For Android glow
    }
});

export default SitesMaterialsScreen;
