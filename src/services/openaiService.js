// src/services/openaiService.js
import axios from 'axios';

// ===== CONFIGURATION =====
const HUGGINGFACE_API_KEY = 'YOUR_HUGGINGFACE_API_KEY_HERE'; // Replace with your token from huggingface.co/settings/tokens

// Hugging Face Models (all FREE!)
const HF_SENTIMENT_URL = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest';
const HF_EMOTION_URL = 'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base';

// Toggle AI vs Rule-based
const USE_AI = true; // Set to false to use rule-based analysis

/**
 * Main function to analyze mood
 */
export const analyzeMood = async (journalText) => {
    if (USE_AI && HUGGINGFACE_API_KEY !== 'YOUR_HUGGINGFACE_API_KEY_HERE') {
        return await analyzeMoodWithAI(journalText);
    } else {
        return await analyzeMoodRuleBased(journalText);
    }
};

/**
 * AI-powered analysis using Hugging Face (FREE)
 */
async function analyzeMoodWithAI(journalText) {
    try {
        console.log('🤖 Using AI analysis...');

        // Call emotion detection model
        const emotionResponse = await axios.post(
            HF_EMOTION_URL,
            { inputs: journalText },
            {
                headers: {
                    'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            }
        );

        console.log('✅ AI Response:', emotionResponse.data);

        // Parse response
        const emotions = emotionResponse.data[0];

        // Map AI emotions to our mood categories
        const topEmotion = emotions.reduce((prev, current) =>
            (prev.score > current.score) ? prev : current
        );

        const mood = mapEmotionToMood(topEmotion.label);
        const intensity = Math.round(topEmotion.score * 10);
        const detectedEmotions = emotions
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(e => e.label.toLowerCase());

        return {
            success: true,
            data: {
                mood: mood,
                intensity: intensity,
                emotions: detectedEmotions,
                summary: generateSummary(journalText),
                suggestion: generateSuggestion(mood),
                aiPowered: true
            }
        };

    } catch (error) {
        console.error('❌ AI Analysis Error:', error.message);

        // If AI fails, fallback to rule-based
        if (error.response?.status === 503) {
            console.log('⚠️ Model loading, using fallback...');
        }

        return await analyzeMoodRuleBased(journalText);
    }
}

/**
 * Map AI emotion labels to our mood categories
 */
function mapEmotionToMood(emotion) {
    const emotionMap = {
        'joy': 'happy',
        'sadness': 'sad',
        'anger': 'angry',
        'fear': 'anxious',
        'surprise': 'excited',
        'neutral': 'neutral',
        'disgust': 'angry'
    };

    return emotionMap[emotion.toLowerCase()] || 'neutral';
}

/**
 * Rule-based mood detection (fallback, always works)
 */
async function analyzeMoodRuleBased(journalText) {
    console.log('📝 Using rule-based analysis...');

    try {
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
                suggestion: generateSuggestion(mood),
                aiPowered: false
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
                suggestion: 'Keep journaling to track your emotions over time',
                aiPowered: false
            }
        };
    }
}

/**
 * Rule-based mood detection from text
 */
function detectMoodFromText(text) {
    const lowerText = text.toLowerCase();

    const moodPatterns = {
        happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'blessed', 'fantastic', 'good day'],
        sad: ['sad', 'depressed', 'crying', 'tears', 'lonely', 'down', 'hurt', 'disappointed', 'grief', 'miss'],
        anxious: ['anxious', 'worried', 'nervous', 'stress', 'panic', 'fear', 'scared', 'uneasy', 'concern'],
        angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'rage', 'upset', 'hate'],
        excited: ['excited', 'thrilled', 'pumped', 'energized', 'eager', 'enthusiastic'],
        calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content'],
        stressed: ['stressed', 'overwhelmed', 'pressure', 'busy', 'exhausted', 'tired']
    };

    const moodScores = {};
    for (const [mood, keywords] of Object.entries(moodPatterns)) {
        moodScores[mood] = keywords.filter(keyword => lowerText.includes(keyword)).length;
    }

    const dominantMood = Object.entries(moodScores).reduce((a, b) =>
        b[1] > a[1] ? b : a
    )[0];

    return moodScores[dominantMood] > 0 ? dominantMood : 'neutral';
}

function calculateIntensity(text) {
    let intensity = 5;

    const exclamations = (text.match(/!/g) || []).length;
    intensity += Math.min(exclamations, 3);

    const capsWords = text.match(/\b[A-Z]{3,}\b/g) || [];
    intensity += Math.min(capsWords.length, 2);

    if (text.length > 500) intensity += 1;

    const intensifiers = ['very', 'extremely', 'really', 'so', 'completely', 'totally'];
    intensifiers.forEach(word => {
        if (text.toLowerCase().includes(word)) intensity += 0.5;
    });

    return Math.min(Math.round(intensity), 10);
}

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

function generateSummary(text) {
    const firstSentence = text.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 100) {
        return firstSentence.substring(0, 97) + '...';
    }
    return firstSentence || 'A moment of reflection';
}

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
 * Get personalized insights - Improved version
 */
export const getPersonalizedInsights = async (moodHistory) => {
    try {
        // Basic stats
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

        // Generate detailed rule-based insights (more reliable than AI for this use case)
        let insights = `📊 **Your Mood Analysis** (${moodHistory.length} entries)\n\n`;

        // Mood frequency analysis
        insights += `**Most Frequent Mood:** ${dominantMood.toUpperCase()} (${moodCounts[dominantMood]}x)\n`;

        const moodVariety = Object.keys(moodCounts).length;
        if (moodVariety === 1) {
            insights += `You've been consistently ${dominantMood}. `;
        } else if (moodVariety <= 3) {
            insights += `Your moods show some variation across ${moodVariety} states. `;
        } else {
            insights += `You've experienced a wide range of emotions (${moodVariety} different moods). `;
        }

        insights += '\n\n';

        // Intensity analysis
        insights += `**Average Intensity:** ${avgIntensity}/10\n`;
        if (avgIntensity >= 8) {
            insights += `💡 Your emotions are running very high. This intensity can be draining - make sure you're taking time to rest and recharge.\n\n`;
        } else if (avgIntensity >= 6) {
            insights += `💡 You're experiencing moderate to high emotional intensity. This is healthy engagement with your feelings.\n\n`;
        } else if (avgIntensity >= 4) {
            insights += `💡 Your emotional intensity is balanced. You seem to be processing feelings in a measured way.\n\n`;
        } else {
            insights += `💡 Your emotional intensity has been low. If this feels concerning, consider activities that energize you.\n\n`;
        }

        // Trend analysis (recent vs overall)
        if (moodHistory.length >= 5) {
            const recent3 = moodHistory.slice(0, 3);
            const recentMoods = recent3.map(e => e.mood);
            const recentAvgIntensity = (recent3.reduce((sum, e) => sum + e.intensity, 0) / 3).toFixed(1);

            insights += `**Recent Trend:**\n`;

            if (recentAvgIntensity > avgIntensity + 1.5) {
                insights += `📈 Your emotions have been intensifying lately (${recentAvgIntensity}/10 vs ${avgIntensity}/10 average). Take extra care of yourself and consider stress-relief activities.\n\n`;
            } else if (recentAvgIntensity < avgIntensity - 1.5) {
                insights += `📉 Your emotions have been calming down (${recentAvgIntensity}/10 vs ${avgIntensity}/10 average). This stabilization is a positive sign!\n\n`;
            } else {
                insights += `➡️ Your emotional intensity is staying consistent. You're maintaining steady patterns.\n\n`;
            }

            // Check for positive/negative trends
            const positiveCount = recentMoods.filter(m => ['happy', 'excited', 'calm'].includes(m)).length;
            const negativeCount = recentMoods.filter(m => ['sad', 'anxious', 'angry', 'stressed'].includes(m)).length;

            if (positiveCount >= 2) {
                insights += `✨ Your recent entries show mostly positive moods! Keep doing what's working for you.\n`;
            } else if (negativeCount >= 2) {
                insights += `🌟 You've had some challenging days recently. Remember: these feelings are temporary and you're doing great by tracking them.\n`;
            }
        }

        // Personalized recommendations based on dominant mood
        insights += `\n**Personalized Suggestions:**\n`;

        const recommendations = {
            happy: '• Keep capturing these positive moments\n• Share your happiness with loved ones\n• Note what\'s contributing to this mood',
            sad: '• Practice self-compassion\n• Reach out to supportive friends or family\n• Engage in gentle, comforting activities',
            anxious: '• Try breathing exercises or meditation\n• Break worries into smaller, actionable steps\n• Consider physical activity to release tension',
            angry: '• Take space to cool down before reacting\n• Physical exercise can help release anger\n• Journal about what triggered these feelings',
            stressed: '• Prioritize rest and sleep\n• Delegate tasks when possible\n• Schedule short breaks throughout your day',
            excited: '• Channel this energy productively\n• Share your enthusiasm with others\n• Balance excitement with grounding activities',
            calm: '• Enjoy and protect this peaceful state\n• Note what helps you feel calm\n• Consider meditation or mindfulness',
            neutral: '• Explore new experiences to engage emotions\n• Reflect on what brings you joy\n• Small changes can shift your mood positively'
        };

        insights += recommendations[dominantMood] || '• Keep journaling consistently\n• Notice patterns in your moods\n• Celebrate your self-awareness';

        return insights;

    } catch (error) {
        console.error('Insights Error:', error);
        return 'Keep tracking your moods to receive personalized insights!';
    }
};