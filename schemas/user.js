const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    email: { // email 필드
        type: String,
        required: true,
        unique: true,
    },
    nickname: { // nickname 필드
        type: String,
        required: true,
        unique: true,
    },
    password: { // password 필드
        type: String,
        required: true,
    },
});

userSchema.virtual("userId").get(function () {
    return this._id.toHexString();
});

// user 정보를 JSON으로 형변환 할 때 virtual 값이 출력되도록 설정
userSchema.set("toJSON", {
    virtuals: true,
});

module.exports = mongoose.model("Users", userSchema);