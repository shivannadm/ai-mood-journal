// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { auth } from './src/config/firebaseConfig';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import JournalScreen from './src/screens/JournalScreen';
import TrendsScreen from './src/screens/TrendsScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('🚀 App.js mounted');

        try {
            if (!auth) {
                console.error('❌ Auth is not initialized');
                setError('Firebase not configured');
                setLoading(false);
                return;
            }

            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                console.log('👤 Auth state changed:', currentUser ? 'User logged in' : 'No user');
                setUser(currentUser);
                setLoading(false);
            }, (error) => {
                console.error('❌ Auth state change error:', error);
                setError(error.message);
                setLoading(false);
            });

            return unsubscribe;
        } catch (error) {
            console.error('❌ Error setting up auth listener:', error);
            setError(error.message);
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A5FBF" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>⚠️ Error</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <Text style={styles.errorHint}>
                    Check your Firebase configuration
                </Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="Journal" component={JournalScreen} />
                        <Stack.Screen name="Trends" component={TrendsScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FF',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF4444',
        marginBottom: 10,
    },
    errorMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
    errorHint: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});