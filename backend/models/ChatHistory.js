/*const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    responseType: {
      type: String,
      enum: ['crop', 'disease', 'weather', 'fertilizer', 'irrigation', 'general'],
      default: 'general',
    },
    suggestions: [String], // Alternative crops or related suggestions
    followUpQuestion: String, // Follow-up question from chatbot
    feedback: {
      type: String,
      enum: ['helpful', 'notHelpful', null],
      default: null,
    },
    feedbackReason: String, // Why user marked as not helpful
    context: {
      cropName: String,
      location: String,
      season: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatHistory', chatHistorySchema);*/

const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    responseType: {
      type: String,
      enum: ['crop', 'disease', 'weather', 'fertilizer', 'irrigation', 'general', 'fallback'],
      default: 'general',
    },
    suggestions: [String], // Alternative crops or related suggestions
    followUpQuestion: String, // Follow-up question from chatbot
    feedback: {
      type: String,
      enum: ['helpful', 'notHelpful', null],
      default: null,
    },
    feedbackReason: String, // Why user marked as not helpful
    context: {
      cropName: String,
      location: String,
      season: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatHistory', chatHistorySchema);

