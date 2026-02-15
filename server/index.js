require("dotenv").config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Poll = require('./models/Poll');

const app = express();
const path = require('path');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body && Object.keys(req.body).length > 0 ? req.body : '');
    next();
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('DB Connected'))
    .catch(err => console.error(err));

app.post('/api/polls', async (req, res) => {
    try {
        const { question, options } = req.body;
        if (!question || !options || options.length < 2) {
            return res.status(400).json({ error: 'Invalid data' });
        }
        const { creatorId } = req.body;
        const formattedOptions = options.map(opt => ({ text: opt, votes: 0 }));
        const poll = await Poll.create({ question, options: formattedOptions, creatorId });
        res.status(201).json(poll);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/polls/:id', async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ error: 'Not found' });
        res.json(poll);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get polls by creator
app.get('/api/polls/user/:creatorId', async (req, res) => {
    try {
        const polls = await Poll.find({ creatorId: req.params.creatorId }).sort({ createdAt: -1 });
        res.json(polls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get polls users voted in
app.get('/api/polls/voted/:userId', async (req, res) => {
    try {
        const polls = await Poll.find({ votedUserIds: req.params.userId }).sort({ createdAt: -1 });
        res.json(polls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/polls/:id/vote', async (req, res) => {
    const { optionId, userId } = req.body; // accept userId from client

    // normalize IP
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip.includes(',')) ip = ip.split(',')[0];
    ip = ip.replace('::ffff:', '');

    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ error: 'Poll not found' });

        // ensure array exists
        if (!poll.votedIps) poll.votedIps = [];

        if (poll.votedIps.includes(ip)) {
            // We might still allow voting if userId isn't in votedUserIds, but generally IP check is safer against spam
            return res.status(403).json({ error: 'You have already voted from this network' });
        }

        // Check userId to avoid double voting if IP changed but user is same
        if (userId && poll.votedUserIds && poll.votedUserIds.includes(userId)) {
            return res.status(403).json({ error: 'You have already voted' });
        }

        const option = poll.options.id(optionId);
        if (!option) return res.status(404).json({ error: 'Option not found' });

        option.votes += 1;
        poll.votedIps.push(ip);
        if (userId) {
            if (!poll.votedUserIds) poll.votedUserIds = [];
            poll.votedUserIds.push(userId);
        }

        await poll.save();

        io.to(req.params.id).emit('pollUpdated', poll);

        res.json(poll);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV !== 'development') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
}



io.on('connection', (socket) => {
    socket.on('joinPoll', (pollId) => {
        socket.join(pollId);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));