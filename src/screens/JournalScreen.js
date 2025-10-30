// src/screens/JournalScreen.js
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebaseConfig';
import { analyzeMood } from '../services/openaiService';

export default function JournalScreen({ navigation }) {
    const [journalText, setJournalText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const handleAnalyze = async () => {
        if (journalText.trim().length < 10) {
            Alert.alert('Too Short', 'Please write at least 10 characters to analyze your mood.');
            return;
        }

        setIsAnalyzing(true);

        try {
            const result = await analyzeMood(journalText);
            setAnalysis(result.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to analyze mood. Please try again.');
            console.error('Analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!analysis) {
            Alert.alert('Analyze First', 'Please analyze your entry before saving.');
            return;
        }

        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                Alert.alert('Error', 'You must be logged in to save entries.');
                return;
            }

            await addDoc(collection(db, 'journal_entries'), {
                userId,
                text: journalText,
                mood: analysis.mood,
                intensity: analysis.intensity,
                emotions: analysis.emotions,
                summary: analysis.summary,
                suggestion: analysis.suggestion,
                createdAt: serverTimestamp(),
            });

            Alert.alert('Saved!', 'Your journal entry has been saved.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

            // Reset form
            setJournalText('');
            setAnalysis(null);

        } catch (error) {
            Alert.alert('Error', 'Failed to save entry. Please try again.');
            console.error('Save error:', error);
        }
    };

    const getMoodEmoji = (mood) => {
        const emojiMap = {
            happy: '😊',
            sad: '😢',
            anxious: '😰',
            angry: '😠',
            neutral: '😐',
            excited: '🤩',
            stressed: '😫',
            calm: '😌'
        };
        return emojiMap[mood] || '😐';
    };

    const getMoodColor = (mood) => {
        const colorMap = {
            happy: '#FFD700',
            sad: '#6495ED',
            anxious: '#FFA500',
            angry: '#FF4444',
            neutral: '#999999',
            excited: '#FF69B4',
            stressed: '#8B0000',
            calm: '#90EE90'
        };
        return colorMap[mood] || '#999999';
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>📝 New Journal Entry</Text>
                <Text style={styles.subtitle}>How are you feeling today?</Text>

                <TextInput
                    style={styles.textInput}
                    placeholder="Write about your day, feelings, or anything on your mind..."
                    value={journalText}
                    onChangeText={setJournalText}
                    multiline
                    numberOfLines={10}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.analyzeButton, isAnalyzing && styles.disabledButton]}
                    onPress={handleAnalyze}
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>🤖 Analyze My Mood</Text>
                    )}
                </TouchableOpacity>

                {analysis && (
                    <View style={styles.analysisContainer}>
                        <View style={[styles.moodCard, { borderColor: getMoodColor(analysis.mood) }]}>
                            <Text style={styles.moodEmoji}>{getMoodEmoji(analysis.mood)}</Text>
                            <Text style={styles.moodText}>
                                {analysis.mood.toUpperCase()}
                            </Text>
                            <Text style={styles.intensityText}>
                                Intensity: {analysis.intensity}/10
                            </Text>
                        </View>

                        <View style={styles.emotionsContainer}>
                            <Text style={styles.emotionsLabel}>Detected Emotions:</Text>
                            <View style={styles.emotionTags}>
                                {analysis.emotions.map((emotion, index) => (
                                    <View key={index} style={styles.emotionTag}>
                                        <Text style={styles.emotionText}>{emotion}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.insightBox}>
                            <Text style={styles.insightLabel}>📋 Summary</Text>
                            <Text style={styles.insightText}>{analysis.summary}</Text>
                        </View>

                        <View style={styles.insightBox}>
                            <Text style={styles.insightLabel}>💡 Suggestion</Text>
                            <Text style={styles.insightText}>{analysis.suggestion}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonText}>💾 Save Entry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back to Home</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FF',
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A5FBF',
        marginTop: 60,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    textInput: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        minHeight: 150,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 15,
    },
    analyzeButton: {
        backgroundColor: '#4A5FBF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    disabledButton: {
        backgroundColor: '#999',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    analysisContainer: {
        marginBottom: 20,
    },
    moodCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    moodEmoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    moodText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    intensityText: {
        fontSize: 16,
        color: '#666',
    },
    emotionsContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    emotionsLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    emotionTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    emotionTag: {
        backgroundColor: '#E6F4FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    emotionText: {
        color: '#4A5FBF',
        fontSize: 14,
    },
    insightBox: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    insightLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    insightText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    saveButton: {
        backgroundColor: '#28A745',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    backButton: {
        padding: 15,
        alignItems: 'center',
        marginBottom: 30,
    },
    backButtonText: {
        color: '#4A5FBF',
        fontSize: 16,
        fontWeight: '600',
    },
});