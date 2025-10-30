// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function HomeScreen({ navigation }) {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Navigation to Welcome screen is handled automatically by App.js
        } catch (error) {
            Alert.alert('Error', 'Failed to logout');
            console.error('Logout error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🌙 Mood Journal</Text>
            <Text style={styles.subtitle}>How are you feeling today?</Text>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Journal')}
            >
                <Text style={styles.cardIcon}>📝</Text>
                <Text style={styles.cardTitle}>New Entry</Text>
                <Text style={styles.cardDescription}>Record your mood</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Trends')}
            >
                <Text style={styles.cardIcon}>📊</Text>
                <Text style={styles.cardTitle}>View Trends</Text>
                <Text style={styles.cardDescription}>See your mood patterns</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FF',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#4A5FBF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        color: '#666',
        marginBottom: 40,
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardIcon: {
        fontSize: 48,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
    },
    logoutButton: {
        marginTop: 20,
        padding: 15,
        alignItems: 'center',
    },
    logoutText: {
        color: '#FF4444',
        fontSize: 16,
        fontWeight: '600',
    },
});