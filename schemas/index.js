const mongoose = require("mongoose");
const connect = () => {
    mongoose
        .connect("mongodb://127.0.0.1:27017/lv2_project")
        .catch(err => console.log(err))
}

mongoose.connection.on("error", err => {
    console.error("에러입니다!", err)
})

module.exports = connect