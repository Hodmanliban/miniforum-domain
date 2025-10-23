import mongoose from "mongoose";

export async function connectDb() {
    const useTest = process.env.NODE_ENV === "test" || process.env.USE_TEST_DB === "true";
    const dbName = useTest ? process.env.DB_NAME_TEST : process.env.DB_NAME;

    try {
        await mongoose.connect(process.env.DB_URL, { dbName });
        console.log(`✅ MongoDB Atlas connected → ${dbName}`);
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    }
}
