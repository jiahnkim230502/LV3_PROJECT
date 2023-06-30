const mongoose = require("mongoose");

const commentScheama = new mongoose.Schema({
    password: {
        type: String,
        select: false,
    },

    content: {
        type: String
    },

    postId: {
        type: String,
    },

    userId: {
        type: String,
    },
    
    __v: {
        type: Number,
        select: false
    },

    createdAt: {
        type: Date,
    },

    updatedAt: {
        type: Date,
    },
})

module.exports = mongoose.model("Comments", commentScheama)