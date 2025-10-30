// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function HomeScreen({ navigation }) {
    const [quickEntry, setQuickEntry] = useState('');
    const [recentMoods, setRecentMoods] = useState([]);

    useEffect(() => {
        loadRecentMoods();
    }, []);

    const loadRecentMoods = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const q = query(
                collection(db, 'moods'),
                orderBy('timestamp', 'desc'),
                limit(3)
            );
            const snapshot = await getDocs(q);
            const moods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecentMoods(moods);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleQuickEntry = async () => {
        if (!quickEntry.trim()) {
            Alert.alert('Empty', 'Please write something');
            return;
        }

        try {
            const user = auth.currentUser;
            await addDoc(collection(db, 'moods'), {
                userId: user.uid,
                entry: quickEntry,
                timestamp: new Date().toISOString(),
                analyzed: false,
            });

            Alert.alert('Saved!', 'Entry saved successfully');
            setQuickEntry('');
            loadRecentMoods();
        } catch (error) {
            Alert.alert('Error', 'Failed to save');
        }
    };

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🌙 Mood Journal</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Quick Mood Entry</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="How are you feeling?"
                    value={quickEntry}
                    onChangeText={setQuickEntry}
                    multiline
                    numberOfLines={4}
                />
                <TouchableOpacity style={styles.button} onPress={handleQuickEntry}>
                    <Text style={styles.buttonText}>Save Entry</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Recent Entries</Text>
                {recentMoods.length === 0 ? (
                    <Text style={styles.emptyText}>No entries yet</Text>
                ) : (
                    recentMoods.map(mood => (
                        <View key={mood.id} style={styles.moodItem}>
                            <Text style={styles.moodDate}>
                                {new Date(mood.timestamp).toLocaleDateString()}
                            </Text>
                            <Text numberOfLines={2}>{mood.entry}</Text>
                        </View>
                    ))
                )}
            </View>

            <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigation.navigate('Journal')}
            >
                <Text style={styles.navButtonText}>📝 Write with AI Analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigation.navigate('Trends')}
            >
                <Text style={styles.navButtonText}>📊 View Trends</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FF',
    },
    header: {
        backgroundColor: '#4A5FBF',
        padding: 20,
        paddingTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    logoutText: {
        color: 'white',
        fontSize: 14,
    },
    card: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 15,
        minHeight: 100,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#4A5FBF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        padding: 20,
    },
    moodItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingVertical: 10,
    },
    moodDate: {
        fontSize: 12,
        color: '#999',
        marginBottom: 5,
    },
    navButton: {
        backgroundColor: 'white',
        margin: 15,
        marginTop: 0,
        padding: 18,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4A5FBF',
    },
    navButtonText: {
        textAlign: 'center',
        color: '#4A5FBF',
        fontSize: 16,
        fontWeight: '600',
    },
});