import mongoose from "mongoose";
import { ENVVARS } from "../utils/envVars";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENVVARS.MONGODB_URI);
    console.log(`Database connected succesfully with ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      console.log("Error while connecting with database", error.message);
    }
    process.exit(1);
  }
};
