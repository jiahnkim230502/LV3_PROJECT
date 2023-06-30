const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId : {
        type: String,
    },
    email: {
        type: String,
    },
    nickname: {
        type: String,
    },
    password: {
        type: String,
    },
    title : {
        type: String,
    },
    content : {
        type: String,
    },
    createdAt: {
        type : Date
    },
    updatedAt:{
        type : Date
    },
    __v: {
        type: Number,
        select: false
    }
});

module.exports = mongoose.model("Posts", postSchema);