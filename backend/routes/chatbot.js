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

module.exports = router;
