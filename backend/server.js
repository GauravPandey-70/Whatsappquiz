const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const express = require('express');
const qrcode = require('qrcode-terminal');
const { UserSession, Analytics } = require('../database/schema');
const { questions, getNextQuestion, isValidAnswer } = require('./quiz');
const logEvent = require('./analytics'); // Ensure this file exists
const recommendSystem = require('./recommendations');

require('dotenv').config({ debug: true });
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Fallback to local URI if .env is not loaded
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gauravpandey54909_db:<password>@cluster0.hbbuolp.mongodb.net/whatsappquiz

';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
    });
    console.log('MongoDB connected successfully to local instance');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    setTimeout(connectDB, 5000); // Retry on failure
  }
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
  startSock(); // Start WhatsApp socket only after DB is ready
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

connectDB();

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys'); // Persists session

  const sock = makeWASocket({
    auth: state,
    defaultQueryTimeoutMs: 60_000,
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
      if (shouldReconnect) startSock();
    } else if (connection === 'open') {
      console.log('WhatsApp connected!');
    } else if (qr) {
      console.log('QR Code received, scan this with your WhatsApp:');
      qrcode.generate(qr, { small: true }); // Use qrcode-terminal to print QR
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const phone = msg.key.remoteJid.replace('@s.whatsapp.net', '');
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    let session = await UserSession.findOne({ phone }).catch(err => {
      console.error('Database query error:', err);
      return null;
    });
    if (!session) {
      session = new UserSession({ phone });
      await session.save().catch(err => console.error('Save error:', err));
      logEvent(phone, 'quiz_started', null, {});
      await sock.sendMessage(msg.key.remoteJid, { text: 'Hi! Welcome to Home Security Quiz. Answer 6 questions for a personalized rec. Q1: ' + getNextQuestion(1) });
      session.currentQuestion = 1;
      await session.save().catch(err => console.error('Save error:', err));
      return;
    }

    const qNum = session.currentQuestion;
    if (qNum > 6) return;

    if (text.toLowerCase() === 'stop' || text.toLowerCase() === 'quit') {
      session.droppedOff = true;
      await session.save().catch(err => console.error('Save error:', err));
      logEvent(phone, `dropped_off_after_question_${qNum}`, qNum, session.answers);
      await sock.sendMessage(msg.key.remoteJid, { text: 'Quiz stopped. Thanks!' });
      return;
    }

    if (!isValidAnswer(qNum, text)) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid answer. Try again: ' + getNextQuestion(qNum) });
      return;
    }

    session.answers.set(`q${qNum}`, text.toLowerCase());
    if (typeof logEvent === 'function') {
    logEvent(phone, `question_${qNum}_answered`, qNum, session.answers);
} else {
    console.log('logEvent function not available');
    console.log(`Question ${qNum} answered by ${phone}:`, session.answers);
} // Error occurred here
    await session.save().catch(err => console.error('Save error:', err));

    if (qNum === 6) {
      session.completed = true;
      session.currentQuestion = 7;
      await session.save().catch(err => console.error('Save error:', err));
      // Replace line 104 with:
if (typeof logEvent === 'function') {
    logEvent(phone, `question_${qNum}_answered`, qNum, session.answers);
} else {
    console.log('logEvent function not available');
    console.log(`Question ${qNum} answered by ${phone}:`, session.answers);
}
      const rec = recommendSystem(session.answers);
     await sock.sendMessage(msg.key.remoteJid, {
  image: { url: rec.image },
  caption: ` *${rec.name}*\n Price: ${rec.price}\n ${rec.desc}\n [Buy Now](${rec.link})`
});

    }

    session.currentQuestion = qNum + 1;
    await session.save().catch(err => console.error('Save error:', err));
    await sock.sendMessage(msg.key.remoteJid, { text: `Got it! Q${qNum + 1}: ${getNextQuestion(qNum + 1)}` });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err.message);
});

app.get('/health', (req, res) => res.send('OK'));
