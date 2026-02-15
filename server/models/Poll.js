const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    text: String,
    votes: { type: Number, default: 0 }
});

const PollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [OptionSchema],
    votedIps: [String],
    votedUserIds: [String], // Track which "users" (client IDs) voted
    creatorId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poll', PollSchema);