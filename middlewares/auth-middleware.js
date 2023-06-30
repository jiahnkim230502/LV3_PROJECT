const jwt = require("jsonwebtoken");
const Users = require("../schemas/user.js");

module.exports = async (req, res, next) => {
    const { Authorization } = req.cookies;
    const [authType, authToken] = (Authorization ?? "").split(" ");

    if (!authToken || authType !== "Bearer") {
        res.status(401).send({
            errorMessage: "로그인 후 이용 가능한 기능입니다.",
        });
        return;
    }

    try {
        const { userId } = jwt.verify(authToken, "customized_secret_key");
        const user = await Users.findById(userId);
        res.locals.user = user;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).send({
            errorMessage: "로그인 후 이용 가능한 기능입니다.",
        });
    }
};