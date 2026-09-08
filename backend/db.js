const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/iNotebook";

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
<<<<<<< HEAD
        //console.log("Connected to Mongo Successfully");
    } catch (error) {
        //console.log("MongoDB connection error:", error);
=======
        console.log("Connected to Mongo Successfully");
    } catch (error) {
        console.log("MongoDB connection error:", error);
>>>>>>> eced787b9105576d50df6f8eccbf1ed250768b06
    }
};

module.exports = connectToMongo;