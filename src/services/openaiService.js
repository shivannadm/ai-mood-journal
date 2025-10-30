// src/services/openaiService.js
import axios from 'axios';

// FREE Alternative: Hugging Face API (No credit card needed!)
const HUGGINGFACE_API_KEY = ''; // Get free key from huggingface.co
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';

// Backup: OpenAI API (requires credits)
const OPENAI_API_KEY = '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Toggle between APIs
const USE_HUGGINGFACE = true; // Set to false to use OpenAI

/**
 * Analyzes journal entry and returns mood data
 * Uses rule-based + simple sentiment analysis (FREE, no API needed!)
 */
export const analyzeMood = async (journalText) => {
    try {
        // Simple keyword-based mood detection (works offline!)
        const mood = detectMoodFromText(journalText);
        const intensity = calculateIntensity(journalText);
        const emotions = extractEmotions(journalText);

        return {
            success: true,
            data: {
                mood: mood,
                intensity: intensity,
                emotions: emotions,
                summary: generateSummary(journalText),
                suggestion: generateSuggestion(mood)
            }
        };

    } catch (error) {
        console.error('Analysis Error:', error);

        return {
            success: false,
            error: error.message,
            data: {
                mood: 'neutral',
                intensity: 5,
                emotions: ['reflective'],
                summary: 'Unable to analyze at this time',
                suggestion: 'Keep journaling to track your emotions over time'
            }
        };
    }
};

/**
 * Rule-based mood detection from text
 */
function detectMoodFromText(text) {
    const lowerText = text.toLowerCase();

    // Mood keywords
    const moodPatterns = {
        happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'blessed', 'fantastic', 'good day', 'celebration'],
        sad: ['sad', 'depressed', 'crying', 'tears', 'lonely', 'down', 'hurt', 'disappointed', 'grief', 'miss', 'lost'],
        anxious: ['anxious', 'worried', 'nervous', 'stress', 'panic', 'fear', 'scared', 'uneasy', 'concern', 'overwhelm'],
        angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'rage', 'upset', 'hate'],
        excited: ['excited', 'thrilled', 'pumped', 'energized', 'eager', 'enthusiastic', 'can\'t wait'],
        calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content', 'at ease', 'restful'],
        stressed: ['stressed', 'overwhelmed', 'pressure', 'busy', 'exhausted', 'tired', 'burned out']
    };

    // Count matches for each mood
    const moodScores = {};
    for (const [mood, keywords] of Object.entries(moodPatterns)) {
        moodScores[mood] = keywords.filter(keyword => lowerText.includes(keyword)).length;
    }

    // Find mood with highest score
    const dominantMood = Object.entries(moodScores).reduce((a, b) =>
        b[1] > a[1] ? b : a
    )[0];

    // If no keywords matched, return neutral
    return moodScores[dominantMood] > 0 ? dominantMood : 'neutral';
}

/**
 * Calculate intensity based on punctuation and capitalization
 */
function calculateIntensity(text) {
    let intensity = 5; // Base intensity

    // Exclamation marks increase intensity
    const exclamations = (text.match(/!/g) || []).length;
    intensity += Math.min(exclamations, 3);

    // ALL CAPS words increase intensity
    const capsWords = text.match(/\b[A-Z]{3,}\b/g) || [];
    intensity += Math.min(capsWords.length, 2);

    // Very long text might indicate high emotion
    if (text.length > 500) intensity += 1;

    // Negative words increase intensity
    const negativeWords = ['very', 'extremely', 'really', 'so', 'completely', 'totally'];
    negativeWords.forEach(word => {
        if (text.toLowerCase().includes(word)) intensity += 0.5;
    });

    return Math.min(Math.round(intensity), 10);
}

/**
 * Extract emotions from text
 */
function extractEmotions(text) {
    const lowerText = text.toLowerCase();
    const emotions = [];

    const emotionKeywords = {
        grateful: ['grateful', 'thankful', 'appreciate', 'blessed'],
        hopeful: ['hope', 'optimistic', 'looking forward', 'better'],
        proud: ['proud', 'accomplished', 'achieved', 'success'],
        confused: ['confused', 'uncertain', 'don\'t know', 'unsure'],
        relieved: ['relieved', 'relief', 'finally', 'glad'],
        nostalgic: ['remember', 'used to', 'miss', 'back then']
    };

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            emotions.push(emotion);
        }
    }

    return emotions.length > 0 ? emotions.slice(0, 3) : ['reflective'];
}

/**
 * Generate simple summary
 */
function generateSummary(text) {
    const firstSentence = text.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 100) {
        return firstSentence.substring(0, 97) + '...';
    }
    return firstSentence || 'A moment of reflection';
}

/**
 * Generate suggestion based on mood
 */
function generateSuggestion(mood) {
    const suggestions = {
        happy: 'Keep celebrating these positive moments! Consider writing about what made today special.',
        sad: 'It\'s okay to feel sad. Try doing something small that brings you comfort today.',
        anxious: 'Take deep breaths. Try breaking down your worries into smaller, manageable steps.',
        angry: 'Your feelings are valid. Consider a short walk or physical activity to release tension.',
        neutral: 'Reflect on one thing you\'re looking forward to today.',
        excited: 'Channel this energy into something creative or share your excitement with someone!',
        stressed: 'Remember to take breaks. Even 5 minutes of rest can help reset your mind.',
        calm: 'Enjoy this peaceful moment. Consider meditation or gentle stretching to maintain this feeling.'
    };

    return suggestions[mood] || 'Keep tracking your emotions to understand yourself better.';
}

/**
 * OPTIONAL: AI-powered analysis using Hugging Face (FREE)
 * Uncomment this if you want to use AI instead of rules
 */
export const analyzeMoodWithAI = async (journalText) => {
    if (!USE_HUGGINGFACE) {
        return analyzeMood(journalText); // Fallback to rule-based
    }

    try {
        const response = await axios.post(
            HF_API_URL,
            {
                inputs: journalText,
                parameters: {
                    candidate_labels: ['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'stressed', 'calm']
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const labels = response.data.labels;
        const scores = response.data.scores;

        const mood = labels[0];
        const intensity = Math.round(scores[0] * 10);

        return {
            success: true,
            data: {
                mood: mood,
                intensity: intensity,
                emotions: labels.slice(0, 3),
                summary: generateSummary(journalText),
                suggestion: generateSuggestion(mood)
            }
        };

    } catch (error) {
        console.error('HuggingFace API Error:', error);
        // Fallback to rule-based
        return analyzeMood(journalText);
    }
};

/**
 * Get personalized insights - Simple version
 */
export const getPersonalizedInsights = async (moodHistory) => {
    try {
        // Count mood frequencies
        const moodCounts = {};
        let totalIntensity = 0;

        moodHistory.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            totalIntensity += entry.intensity;
        });

        const dominantMood = Object.keys(moodCounts).reduce((a, b) =>
            moodCounts[a] > moodCounts[b] ? a : b
        );

        const avgIntensity = (totalIntensity / moodHistory.length).toFixed(1);

        // Generate insights based on patterns
        let insights = `📊 Analysis of your last ${moodHistory.length} entries:\n\n`;

        insights += `Your most common mood has been "${dominantMood}" (${moodCounts[dominantMood]} times). `;

        if (avgIntensity > 7) {
            insights += `Your emotions have been quite intense (avg ${avgIntensity}/10). `;
            insights += `Consider stress management techniques like deep breathing or meditation.\n\n`;
        } else if (avgIntensity < 4) {
            insights += `Your emotional intensity has been low (avg ${avgIntensity}/10). `;
            insights += `Try activities that energize you or bring you joy.\n\n`;
        } else {
            insights += `Your emotional intensity has been moderate (avg ${avgIntensity}/10). `;
            insights += `You're maintaining good emotional balance!\n\n`;
        }

        // Trend analysis
        if (moodHistory.length >= 3) {
            const recent3 = moodHistory.slice(0, 3);
            const recentAvg = (recent3.reduce((sum, e) => sum + e.intensity, 0) / 3).toFixed(1);

            if (recentAvg > avgIntensity + 1) {
                insights += `💡 Your recent entries show increasing emotional intensity. Take extra care of yourself.`;
            } else if (recentAvg < avgIntensity - 1) {
                insights += `💡 Your recent entries show decreasing intensity. Things seem to be stabilizing!`;
            } else {
                insights += `💡 Your emotional patterns are consistent. Keep up the self-reflection!`;
            }
        }

        return insights;

    } catch (error) {
        console.error('Insights Error:', error);
        return 'Keep tracking your moods to receive personalized insights!';
    }
};