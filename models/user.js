const mongoose = require('mongoose');

mongoose.connect(`mongodb://127.0.0.1:27017/miniproject`);

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
