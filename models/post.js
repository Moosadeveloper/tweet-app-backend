const mongoose = require('mongoose');

// Schema for Post
const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // ✅ Single user, not an array
    date: { type: Date, default: Date.now },
    content: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }]
});

// Export Post model
module.exports = mongoose.model("post", postSchema);
