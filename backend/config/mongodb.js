import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return;

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(`${process.env.MONGODB_URI}/e-commerce`, {
                serverSelectionTimeoutMS: 30000,
                connectTimeoutMS: 30000,
            })
            .then(() => {
                console.log("Connected to MongoDB");
                connectionPromise = null;
            })
            .catch((err) => {
                connectionPromise = null;
                throw err;
            });
    }

    await connectionPromise;
};

export default connectDB;