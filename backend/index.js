require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

// Allow requests from local development and deployed Vercel frontend
const allowedOrigins = [
    'http://localhost:3000',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests without an origin, such as Postman or curl
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error('CORS: origin not allowed — ' + origin));
    },
    credentials: true
}));

app.use(express.json());

// Available Routes
app.use('/api/auth', require('./routers/auth'));
app.use('/api/notes', require('./routers/notes'));

app.listen(port, () => {
    console.log(`iNotebook backend running on port ${port}`);
});
