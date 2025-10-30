// src/services/openaiService.js
import axios from 'axios';

// TODO: Replace with YOUR OpenAI API key
const OPENAI_API_KEY = 'YOUR_OPENAI_API';
const API_URL = 'https://api.openai.com/v1/chat/completions';

export const analyzeMoodWithAI = async (journalEntry) => {
    console.log('🤖 Analyzing mood...');

    try {
        const response = await axios.post(
            API_URL,
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a mood analyzer. Analyze the journal entry and respond ONLY with valid JSON in this exact format:
{
  "emotion": "happy",
  "intensity": 7,
  "insight": "Your positive outlook is evident.",
  "suggestion": "Keep celebrating your wins!"
}`
                    },
                    {
                        role: 'user',
                        content: journalEntry
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            }
        );

        const aiResponse = response.data.choices[0].message.content;
        console.log('✅ AI Response:', aiResponse);

        const analysis = JSON.parse(aiResponse);

        return {
            success: true,
            data: analysis
        };
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);

        return {
            success: false,
            error: 'Analysis failed. Check API key.',
            data: {
                emotion: 'neutral',
                intensity: 5,
                insight: 'Unable to analyze.',
                suggestion: 'Try again later.'
            }
        };
    }
};