const mongoose = require("mongoose");
require("dotenv").config();  // Load .env file

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Schema for User
const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    age: Number,
    password: String,
    profilepic: {
        type: String,
        default: 'defult.jpg'
    },
    posts: [  // ✅ Renamed from "post" to "posts"
        { type: mongoose.Schema.Types.ObjectId, ref: "post" }
    ]
});

// Export User model
module.exports = mongoose.model("user", userSchema);
