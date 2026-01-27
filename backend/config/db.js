import mongoose from "mongoose";

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(`MongoDB connection attempt ${retries} failed: ${error.message}`);
      if (retries >= MAX_RETRIES) {
        console.error("Max retries reached. Server will start without DB connection.");
        return;
      }
      console.log("Retrying in 5 seconds...");
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

export default connectDB;
