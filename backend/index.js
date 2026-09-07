require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
var cors = require('cors');
connectToMongo();
const app = express()
const port = 5000
app.use(cors());
app.use(express.json())

// Avaiable Routes
app.use('/api/auth', require('./routers/auth'));
app.use('/api/notes', require('./routers/notes'));
//

app.listen(port, () => {
  console.log(`iNotebook app listening on port http://localhost:${port}`)
})

