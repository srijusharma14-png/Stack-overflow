
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import questionroute from "./routes/question.js";
import answerroutes from "./routes/answer.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const databaseurl = process.env.MONGODB_URL;

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Stackoverflow clone is running perfectly");
});

app.use("/user", userroutes);
app.use("/question", questionroute);
app.use("/answer", answerroutes);

if (!databaseurl) {
  console.error("❌ MONGODB_URL is missing. Check your server/.env file.");
  process.exit(1);
}

mongoose
  .connect(databaseurl)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  
.catch((err) => {
  console.error("MongoDB connection error:", err.message);

  if (err.reason?.servers) {
    for (const [address, server] of err.reason.servers) {
      console.error("\nServer:", address);
      console.error(
        "Specific error:",
        server.error?.message || "No detailed error available"
      );
    }
  }
});

