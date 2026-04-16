/*const express = require('express');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');
const authenticate = require('../middleware/authenticate');
const User = require('../models/User');

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are an intelligent agricultural assistant helping farmers with farming guidance, crop selection, disease prevention, and general agricultural advice.

**Important Guidelines:**
- Use simple, farmer-friendly language (avoid technical jargon unless explained)
- Always structure responses with these emojis and sections:
  🌱 **Topic** - What you're discussing
  ⚠️ **Problem** - Current issue or challenge
  ✅ **Solution** - Step-by-step practical solutions
  💡 **Tips** - Additional helpful advice or preventive measures

- If location is provided, tailor recommendations to that region's climate and season
- If a crop is mentioned, provide specific advice for that crop
- If unclear about the query, ask clarifying follow-up questions
- Provide low-cost, sustainable solutions suitable for small farmers
- Recommend organic/natural farming practices when applicable
- Keep responses concise (2-3 sentences per section, max)
- Always end with a follow-up question to continue the conversation

**Response must include:**
1. Structured response with emojis above
2. Always ask 1 follow-up question at the end
3. Suggest 2-3 alternative topics if relevant`;

// POST /api/chatbot - Send message and get response
router.post('/', authenticate, async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const userId = req.userId;

    // Validate input
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    if (message.length > 500) {
      return res.status(400).json({ message: 'Message too long (max 500 characters)' });
    }

    // Get user data for location context
    const user = await User.findById(userId);
    const userLocation = user?.location || context.location || 'General';

    // Fetch recent chat history for context (last 5 messages)
    const recentChats = await ChatHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Build conversation history for Groq
    let conversationContext = '';
    if (recentChats.length > 0) {
      conversationContext = '\n\nRecent conversation history:\n';
      recentChats.reverse().forEach((chat) => {
        conversationContext += `Farmer: ${chat.message}\nAssistant: ${chat.response}\n\n`;
      });
    }

    // Add location context
    const localizedPrompt = `${SYSTEM_PROMPT}\n\n**User Context:**
- Location: ${userLocation}
- Crop (if mentioned): ${context.cropName || 'Not specified'}
- Season: ${context.season || 'Current season'}
${conversationContext}`;

    // Validate GROQ API Key
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not set in environment variables');
      return res.status(500).json({
        message: 'AI service not configured properly. Please add GROQ_API_KEY to .env file',
      });
    }

    // Call Groq API using fetch
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Best available & actively supported
        messages: [
          {
            role: 'system',
            content: localizedPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    // Determine response type based on keywords
    let responseType = 'general';
    const lowerMessage = message.toLowerCase();
    if (
      lowerMessage.includes('disease') ||
      lowerMessage.includes('pest') ||
      lowerMessage.includes('infection') ||
      lowerMessage.includes('blight')
    ) {
      responseType = 'disease';
    } else if (
      lowerMessage.includes('fertilizer') ||
      lowerMessage.includes('manure') ||
      lowerMessage.includes('nitrogen') ||
      lowerMessage.includes('nutrient')
    ) {
      responseType = 'fertilizer';
    } else if (
      lowerMessage.includes('water') ||
      lowerMessage.includes('irrigation') ||
      lowerMessage.includes('rain') ||
      lowerMessage.includes('moisture')
    ) {
      responseType = 'irrigation';
    } else if (
      lowerMessage.includes('weather') ||
      lowerMessage.includes('temperature') ||
      lowerMessage.includes('crop') ||
      lowerMessage.includes('grow') ||
      lowerMessage.includes('plant') ||
      lowerMessage.includes('wheat') ||
      lowerMessage.includes('rice') ||
      lowerMessage.includes('corn')
    ) {
      responseType = 'crop';
    }

    // Extract follow-up question from response
    const followUpMatch = assistantResponse.match(/\?[^?]*$/);
    const followUpQuestion = followUpMatch ? followUpMatch[0] : 'How else can I help you with your farm?';

    // Save to chat history
    const chatRecord = await ChatHistory.create({
      userId,
      message,
      response: assistantResponse,
      responseType,
      suggestions: [],
      followUpQuestion,
      context: {
        cropName: context.cropName,
        location: userLocation,
        season: context.season,
      },
    });

    res.status(201).json({
      response: assistantResponse,
      type: responseType,
      suggestions: [],
      followUpQuestion,
      chatId: chatRecord._id,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      message: 'Failed to get response from AI service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/chatbot/:chatId/feedback - Submit feedback on response
router.post('/:chatId/feedback', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { feedback, reason } = req.body;
    const userId = req.userId;

    // Validate feedback value
    if (!['helpful', 'notHelpful'].includes(feedback)) {
      return res.status(400).json({ message: 'Invalid feedback value' });
    }

    // Find and update chat record
    const chatRecord = await ChatHistory.findOneAndUpdate(
      { _id: chatId, userId }, // Ensure user owns this chat
      {
        feedback,
        feedbackReason: feedback === 'notHelpful' ? reason : undefined,
      },
      { new: true }
    );

    if (!chatRecord) {
      return res.status(404).json({ message: 'Chat record not found' });
    }

    res.json({
      message: 'Feedback recorded successfully',
      data: chatRecord,
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      message: 'Failed to record feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/chatbot/history - Get chat history for user
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20 } = req.query;

    const chatHistory = await ChatHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      message: 'Chat history retrieved',
      data: chatHistory.reverse(), // Return in chronological order
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      message: 'Failed to fetch chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;*/

const express = require('express');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');
const authenticate = require('../middleware/authenticate');
const User = require('../models/User');

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are an intelligent agricultural assistant helping farmers with farming guidance, crop selection, disease prevention, and general agricultural advice.

**Important Guidelines:**
- Use simple, farmer-friendly language (avoid technical jargon unless explained)
- Always structure responses with these emojis and sections:
  🌱 **Topic** - What you're discussing
  ⚠️ **Problem** - Current issue or challenge
  ✅ **Solution** - Step-by-step practical solutions
  💡 **Tips** - Additional helpful advice or preventive measures

- If location is provided, tailor recommendations to that region's climate and season
- If a crop is mentioned, provide specific advice for that crop
- If unclear about the query, ask clarifying follow-up questions
- Provide low-cost, sustainable solutions suitable for small farmers
- Recommend organic/natural farming practices when applicable
- Keep responses concise (2-3 sentences per section, max)
- Always end with a follow-up question to continue the conversation

**Response must include:**
1. Structured response with emojis above
2. Always ask 1 follow-up question at the end
3. Suggest 2-3 alternative topics if relevant`;

// Fallback response for when AI service is unavailable
const FALLBACK_RESPONSES = [
  {
    category: 'crop',
    response: `🌱 **Popular Crops for Your Area** - Consider growing rice, wheat, cotton, sugarcane, or vegetables based on your local climate.

⚠️ **Climate Challenge** - Different seasons suit different crops. Winter crops (Oct-Mar) include wheat, chickpea, mustard. Summer crops (Apr-Sep) include rice, corn, cotton.

✅ **Solution** - Check our weather-based crop recommendation feature by visiting the weather section with your city name to get personalized suggestions.

💡 **Tips** - Start with crops that have good market demand in your region and suitable soil conditions.

Have you checked what soil type you have on your farm?`,
  },
  {
    category: 'disease',
    response: `🌱 **Disease Prevention** - The best approach is prevention through good farming practices.

⚠️ **Common Problem** - Plant diseases spread in humid, crowded conditions with poor air circulation.

✅ **Solution** - Ensure proper spacing between plants, maintain crop rotation yearly, remove infected leaves immediately, and use organic fungicides like neem oil or sulfur spray.

💡 **Tips** - Use our disease detection feature to identify specific plant diseases from leaf images.

What crop are you growing, and have you noticed any symptoms on your plants?`,
  },
  {
    category: 'general',
    response: `🌱 **Farming Support Available** - I'm here to help with crop selection, disease management, irrigation, and fertilizer recommendations.

⚠️ **Getting Started** - Tell me about your location, which crops you're growing, or what challenges you're facing.

✅ **Solution** - I can provide:
- Crop recommendations based on your weather
- Disease identification and treatment advice
- Seasonal farming tips and best practices

💡 **Tips** - Use the weather feature to get real-time crop recommendations for your area.

What would you like help with today - crops, diseases, or general farming advice?`,
  },
];

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Exponential backoff retry function
const retryWithBackoff = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT')) {
      const delay = INITIAL_RETRY_DELAY * (MAX_RETRIES - retries + 1);
      console.log(`Retry attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
};

// Get appropriate fallback response based on message content
const getFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('disease') || lowerMessage.includes('pest') || lowerMessage.includes('infection')) {
    return FALLBACK_RESPONSES.find(r => r.category === 'disease').response;
  } else if (
    lowerMessage.includes('weather') ||
    lowerMessage.includes('temperature') ||
    lowerMessage.includes('crop') ||
    lowerMessage.includes('grow') ||
    lowerMessage.includes('plant')
  ) {
    return FALLBACK_RESPONSES.find(r => r.category === 'crop').response;
  }

  return FALLBACK_RESPONSES.find(r => r.category === 'general').response;
};

// POST /api/chatbot - Send message and get response
router.post('/', authenticate, async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const userId = req.userId;

    // Validate input
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    if (message.length > 500) {
      return res.status(400).json({ message: 'Message too long (max 500 characters)' });
    }

    // Get user data for location context
    const user = await User.findById(userId);
    const userLocation = user?.location || context.location || 'General';

    // Fetch recent chat history for context (last 5 messages)
    const recentChats = await ChatHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Build conversation history for Groq
    let conversationContext = '';
    if (recentChats.length > 0) {
      conversationContext = '\n\nRecent conversation history:\n';
      recentChats.reverse().forEach((chat) => {
        conversationContext += `Farmer: ${chat.message}\nAssistant: ${chat.response}\n\n`;
      });
    }

    // Add location context
    const localizedPrompt = `${SYSTEM_PROMPT}\n\n**User Context:**
- Location: ${userLocation}
- Crop (if mentioned): ${context.cropName || 'Not specified'}
- Season: ${context.season || 'Current season'}
${conversationContext}`;

    // Validate GROQ API Key
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not set in environment variables');
      const fallbackResponse = getFallbackResponse(message);

      const chatRecord = await ChatHistory.create({
        userId,
        message,
        response: fallbackResponse,
        responseType: 'fallback',
        suggestions: [],
        context: {
          cropName: context.cropName,
          location: userLocation,
          season: context.season,
        },
      });

      return res.status(200).json({
        response: fallbackResponse,
        type: 'fallback',
        suggestions: [],
        chatId: chatRecord._id,
        notice: 'Using offline assistance. Some features may be limited.',
      });
    }

    let assistantResponse;
    let usedFallback = false;

    try {
      // Call Groq API with retry logic
      assistantResponse = await retryWithBackoff(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content: localizedPrompt,
                },
                {
                  role: 'user',
                  content: message,
                },
              ],
              temperature: 0.7,
              max_tokens: 1024,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || `API error: ${response.status}`;
            console.error('⚠️ Groq API Error:', errorMsg, 'Status:', response.status);

            throw new Error(errorMsg);
          }

          const data = await response.json();

          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.warn('⚠️ Invalid API response format received');
            throw new Error('Invalid API response format');
          }

          const content = data.choices[0].message.content;
          if (!content || content.trim().length === 0) {
            console.warn('⚠️ Empty response from API');
            throw new Error('Empty response from API');
          }

          console.log('✅ Successfully got response from AI service');
          return content;
        } catch (error) {
          clearTimeout(timeout);
          throw error;
        }
      });
    } catch (error) {
      console.error('⚠️ AI Service Failed - Using Fallback:', error.message);

      // Use fallback response when AI service fails
      assistantResponse = getFallbackResponse(message);
      usedFallback = true;
    }

    // Safety check - ensure we always have a response
    if (!assistantResponse || assistantResponse.trim().length === 0) {
      console.error('🚨 Critical: No response generated, using fallback');
      assistantResponse = getFallbackResponse(message);
      usedFallback = true;
    }

    // Determine response type based on keywords
    let responseType = 'general';
    const lowerMessage = message.toLowerCase();
    if (
      lowerMessage.includes('disease') ||
      lowerMessage.includes('pest') ||
      lowerMessage.includes('infection') ||
      lowerMessage.includes('blight')
    ) {
      responseType = 'disease';
    } else if (
      lowerMessage.includes('fertilizer') ||
      lowerMessage.includes('manure') ||
      lowerMessage.includes('nitrogen') ||
      lowerMessage.includes('nutrient')
    ) {
      responseType = 'fertilizer';
    } else if (
      lowerMessage.includes('water') ||
      lowerMessage.includes('irrigation') ||
      lowerMessage.includes('rain') ||
      lowerMessage.includes('moisture')
    ) {
      responseType = 'irrigation';
    } else if (
      lowerMessage.includes('weather') ||
      lowerMessage.includes('temperature') ||
      lowerMessage.includes('crop') ||
      lowerMessage.includes('grow') ||
      lowerMessage.includes('plant') ||
      lowerMessage.includes('wheat') ||
      lowerMessage.includes('rice') ||
      lowerMessage.includes('corn')
    ) {
      responseType = 'crop';
    }

    // Override responseType if using fallback
    if (usedFallback) {
      responseType = 'fallback';
    }

    // Extract follow-up question from response
    const followUpMatch = assistantResponse.match(/\?[^?]*$/);
    const followUpQuestion = followUpMatch ? followUpMatch[0] : 'How else can I help you with your farm?';

    // Save to chat history
    const chatRecord = await ChatHistory.create({
      userId,
      message,
      response: assistantResponse,
      responseType,
      suggestions: [],
      followUpQuestion,
      context: {
        cropName: context.cropName,
        location: userLocation,
        season: context.season,
      },
    });

    const responseJson = {
      response: assistantResponse,
      type: responseType,
      suggestions: [],
      followUpQuestion,
      chatId: chatRecord._id,
    };

    // Add notice if using fallback
    if (usedFallback) {
      responseJson.notice = 'AI service temporarily unavailable. Using offline assistance with pre-built responses.';
    }

    res.status(201).json(responseJson);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      message: 'Failed to get response from AI service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      suggestions: 'Please try again in a moment. The service may be temporarily unavailable.',
    });
  }
});

// POST /api/chatbot/:chatId/feedback - Submit feedback on response
router.post('/:chatId/feedback', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { feedback, reason } = req.body;
    const userId = req.userId;

    // Validate feedback value
    if (!['helpful', 'notHelpful'].includes(feedback)) {
      return res.status(400).json({ message: 'Invalid feedback value' });
    }

    // Find and update chat record
    const chatRecord = await ChatHistory.findOneAndUpdate(
      { _id: chatId, userId },
      {
        feedback,
        feedbackReason: feedback === 'notHelpful' ? reason : undefined,
      },
      { new: true }
    );

    if (!chatRecord) {
      return res.status(404).json({ message: 'Chat record not found' });
    }

    res.json({
      message: 'Feedback recorded successfully',
      data: chatRecord,
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      message: 'Failed to record feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/chatbot/history - Get chat history for user
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20 } = req.query;

    const chatHistory = await ChatHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      message: 'Chat history retrieved',
      data: chatHistory.reverse(),
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      message: 'Failed to fetch chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;

