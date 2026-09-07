import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        console.log("Connected to Database!");
    }
    catch(error) {
        console.log("Connected failed!" , error);
        process.exit(1);
    }
};