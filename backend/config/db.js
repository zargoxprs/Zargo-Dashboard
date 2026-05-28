const mongoose = require("mongoose");

const dns = require("dns");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set");

  // Use public DNS servers for SRV records in case the local resolver rejects DNS queries.
  dns.setServers(["8.8.8.8", "8.8.4.4"]);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err && err.message ? err.message : err);
    console.error(err);
    // Re-throw so the caller / process shows failure in logs and stops startup.
    throw err;
  }
};

module.exports = connectDB;