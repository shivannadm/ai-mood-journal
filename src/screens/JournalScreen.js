// src/screens/JournalScreen.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function JournalScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>📝 New Journal Entry</Text>

            <View style={styles.content}>
                <Text style={styles.text}>Journal entry screen coming soon!</Text>
                <Text style={styles.description}>
                    Here you'll be able to record your daily mood and thoughts
                </Text>
            </View>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FF',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A5FBF',
        marginTop: 60,
        marginBottom: 30,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        backgroundColor: '#4A5FBF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});