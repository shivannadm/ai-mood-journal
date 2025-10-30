// src/services/openaiService.js
import axios from 'axios';

const OPENAI_API_KEY = ''; // Replace with your actual key
const API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Analyzes journal entry and returns mood data
 * @param {string} journalText - The user's journal entry
 * @returns {Promise<Object>} Mood analysis result
 */
export const analyzeMood = async (journalText) => {
    try {
        const response = await axios.post(
            API_URL,
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a mood analysis AI. Analyze the user's journal entry and return ONLY a JSON object with this exact structure:
{
  "mood": "one of: happy, sad, anxious, angry, neutral, excited, stressed, calm",
  "intensity": number from 1-10,
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "summary": "brief one-sentence summary",
  "suggestion": "helpful suggestion or affirmation"
}
Do not include any other text, only the JSON object.`
                    },
                    {
                        role: 'user',
                        content: journalText
                    }
                ],
                temperature: 0.7,
                max_tokens: 300
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            }
        );

        const aiResponse = response.data.choices[0].message.content.trim();
        console.log('AI Response:', aiResponse);

        // Parse the JSON response
        const analysis = JSON.parse(aiResponse);

        return {
            success: true,
            data: analysis
        };

    } catch (error) {
        console.error('OpenAI API Error:', error.response?.data || error.message);

        // Return fallback analysis if API fails
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
 * Get personalized insights based on mood history
 * @param {Array} moodHistory - Array of past mood entries
 * @returns {Promise<string>} AI-generated insights
 */
export const getPersonalizedInsights = async (moodHistory) => {
    try {
        const moodSummary = moodHistory.map(entry =>
            `${entry.date}: ${entry.mood} (intensity: ${entry.intensity})`
        ).join('\n');

        const response = await axios.post(
            API_URL,
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a supportive mental wellness coach. Provide encouraging insights based on mood patterns.'
                    },
                    {
                        role: 'user',
                        content: `Based on my recent mood entries:\n${moodSummary}\n\nProvide 3-4 personalized insights and suggestions (max 150 words).`
                    }
                ],
                temperature: 0.8,
                max_tokens: 250
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            }
        );

        return response.data.choices[0].message.content.trim();

    } catch (error) {
        console.error('Insights Error:', error);
        return 'Keep tracking your moods to receive personalized insights!';
    }
};