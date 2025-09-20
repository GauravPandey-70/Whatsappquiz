# WhatsApp Home Security Quiz Bot

## Architecture
- **WhatsApp**: Baileys (WebSocket client for messaging).
- **Backend**: Node.js + Express (handles events, state).
- **DB**: MongoDB Atlas (sessions + analytics via Mongoose).
- **Logic**: State machine in quiz.js; rule-based recs.
- **Tools**: Free - Baileys, Mongoose, Atlas.

## Setup
1. cd backend, npm install.
2. Set .env (Mongo URI).
3. node server.js (scan QR).
4. Test: Message bot.

## Quiz Flow
1. Start -> Q1-6 -> Rec -> Log complete.
- Drop-off on "stop".

## Analytics
- Events: quiz_started, question_n_answered, quiz_completed, dropped_off_after_question_n.
- View in Compass or /export endpoint.

## Deployment
- Render: New Web Service, connect GitHub, set env vars. Build: npm install; Start: node server.js.

## Sample Logs
See database/sample-logs.json.
