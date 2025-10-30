// src/screens/TrendsScreen.js
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { auth, db } from '../config/firebaseConfig';
import { getPersonalizedInsights } from '../services/openaiService';

export default function TrendsScreen({ navigation }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState('');
    const [loadingInsights, setLoadingInsights] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const q = query(
                collection(db, 'journal_entries'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const entriesData = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                entriesData.push({
                    id: doc.id,
                    ...data,
                    date: data.createdAt?.toDate().toLocaleDateString() || 'Unknown'
                });
            });

            setEntries(entriesData);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetInsights = async () => {
        if (entries.length < 3) {
            setInsights('Keep journaling! You need at least 3 entries to get personalized insights.');
            return;
        }

        setLoadingInsights(true);
        try {
            const moodHistory = entries.slice(0, 10).map(entry => ({
                date: entry.date,
                mood: entry.mood,
                intensity: entry.intensity
            }));

            const aiInsights = await getPersonalizedInsights(moodHistory);
            setInsights(aiInsights);
        } catch (error) {
            console.error('Insights error:', error);
            setInsights('Unable to generate insights at this time.');
        } finally {
            setLoadingInsights(false);
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

    const getMoodStats = () => {
        if (entries.length === 0) return null;

        const moodCounts = {};
        let totalIntensity = 0;

        entries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            totalIntensity += entry.intensity;
        });

        const dominantMood = Object.keys(moodCounts).reduce((a, b) =>
            moodCounts[a] > moodCounts[b] ? a : b
        );

        const avgIntensity = (totalIntensity / entries.length).toFixed(1);

        return { dominantMood, avgIntensity, moodCounts };
    };

    const getChartData = () => {
        if (entries.length === 0) return null;

        const last7Entries = entries.slice(0, 7).reverse();

        return {
            labels: last7Entries.map(e => e.date.split('/')[0] + '/' + e.date.split('/')[1]),
            datasets: [{
                data: last7Entries.map(e => e.intensity)
            }]
        };
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A5FBF" />
                <Text style={styles.loadingText}>Loading your mood history...</Text>
            </View>
        );
    }

    if (entries.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>📊 Mood Trends</Text>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>📝</Text>
                    <Text style={styles.emptyText}>No entries yet!</Text>
                    <Text style={styles.emptySubtext}>Start journaling to see your mood trends</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const stats = getMoodStats();
    const chartData = getChartData();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>📊 Mood Trends</Text>
            <Text style={styles.subtitle}>{entries.length} total entries</Text>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>{getMoodEmoji(stats.dominantMood)}</Text>
                    <Text style={styles.statLabel}>Dominant Mood</Text>
                    <Text style={styles.statValue}>{stats.dominantMood}</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>📈</Text>
                    <Text style={styles.statLabel}>Avg Intensity</Text>
                    <Text style={styles.statValue}>{stats.avgIntensity}/10</Text>
                </View>
            </View>

            {/* Chart */}
            {chartData && entries.length >= 2 && (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Intensity Over Time</Text>
                    <LineChart
                        data={chartData}
                        width={Dimensions.get('window').width - 40}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#fff',
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(74, 95, 191, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: {
                                r: '6',
                                strokeWidth: '2',
                                stroke: '#4A5FBF'
                            }
                        }}
                        bezier
                        style={styles.chart}
                    />
                </View>
            )}

            {/* AI Insights */}
            <View style={styles.insightsSection}>
                <TouchableOpacity
                    style={styles.insightsButton}
                    onPress={handleGetInsights}
                    disabled={loadingInsights}
                >
                    {loadingInsights ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.insightsButtonText}>
                            💡 Get AI Insights
                        </Text>
                    )}
                </TouchableOpacity>

                {insights !== '' && (
                    <View style={styles.insightsBox}>
                        <Text style={styles.insightsText}>{insights}</Text>
                    </View>
                )}
            </View>

            {/* Recent Entries */}
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            {entries.slice(0, 5).map((entry, index) => (
                <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                        <Text style={styles.entryEmoji}>{getMoodEmoji(entry.mood)}</Text>
                        <View style={styles.entryInfo}>
                            <Text style={styles.entryMood}>{entry.mood}</Text>
                            <Text style={styles.entryDate}>{entry.date}</Text>
                        </View>
                        <View style={[styles.intensityBadge, { backgroundColor: getMoodColor(entry.mood) }]}>
                            <Text style={styles.intensityText}>{entry.intensity}</Text>
                        </View>
                    </View>
                    <Text style={styles.entrySummary} numberOfLines={2}>{entry.summary}</Text>
                </View>
            ))}

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Back to Home</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FF',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FF',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A5FBF',
        marginTop: 60,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statEmoji: {
        fontSize: 36,
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    chartContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    insightsSection: {
        marginBottom: 20,
    },
    insightsButton: {
        backgroundColor: '#4A5FBF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    insightsButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    insightsBox: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        marginTop: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#FFD700',
    },
    insightsText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    entryCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    entryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    entryEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    entryInfo: {
        flex: 1,
    },
    entryMood: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'capitalize',
    },
    entryDate: {
        fontSize: 12,
        color: '#999',
    },
    intensityBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    intensityText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    entrySummary: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
    },
    backButton: {
        padding: 15,
        alignItems: 'center',
        marginVertical: 20,
    },
    backButtonText: {
        color: '#4A5FBF',
        fontSize: 16,
        fontWeight: '600',
    },
});