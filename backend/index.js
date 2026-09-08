require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
var cors = require('cors');
connectToMongo();
<<<<<<< HEAD

const app  = express();
const port = process.env.PORT || 5000;

// Allow requests from local dev and the Vercel deployment
const allowedOrigins = [
    'http://localhost:3000',
    process.env.CLIENT_URL  // set this in Render env vars once you have your Vercel URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('CORS: origin not allowed — ' + origin));
    },
    credentials: true
}));

app.use(express.json());
=======
const app = express()
const port = 5000
app.use(cors());
app.use(express.json())
>>>>>>> eced787b9105576d50df6f8eccbf1ed250768b06

// Avaiable Routes
app.use('/api/auth', require('./routers/auth'));
app.use('/api/notes', require('./routers/notes'));
//

app.listen(port, () => {
<<<<<<< HEAD
    //console.log(`iNotebook backend running on port ${port}`);
});
=======
  console.log(`iNotebook app listening on port http://localhost:${port}`)
})
>>>>>>> eced787b9105576d50df6f8eccbf1ed250768b06

