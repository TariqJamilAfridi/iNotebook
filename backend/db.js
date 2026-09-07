const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/iNotebook";

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to Mongo Successfully");
    } catch (error) {
        console.log("MongoDB connection error:", error);
    }
};

module.exports = connectToMongo;