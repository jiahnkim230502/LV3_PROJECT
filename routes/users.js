const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Users = require("../schemas/user.js")

// 회원가입 API
router.post("/signup", async (req, res) => {
    const { email, password, checkPassword, nickname } = req.body;
    const findUser = await Users.findOne({ "email": email });
    const isNickname = await Users.findOne({ "nickname": nickname });
    // email과 동일한 유저가 실제로 존재한다면 에러발생
    if (findUser) {
        return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    };
    // 1. 닉네임은 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 구성하기
    if (nickname.length < 3 || !/[A-Z]/.test(nickname) || !/[0-9]/.test(nickname)) {
        return res.status(409).json({ message: "닉네임은 최소 3자 이상, 알파벳 대문자와 숫자를 포함하여야 합니다." });
    };
    // 2. 비밀번호는 최소 4자 이상이며, 닉네임과 같은 값이 포함된 경우 회원가입에 실패로 만들기
    if (password.length < 4 || password.includes(nickname)) {
        return res.status(409).json({ message: "비밀번호는 4자 이상이며 기재하신 닉네임을 포함할 수 없습니다." });
    };
    // 3. 비밀번호 확인은 비밀번호와 정확하게 일치하기
    if (checkPassword !== password) {
        return res.status(409).json({ message: "입력하신 비밀번호가 일치하지 않아 확인되지 않았습니다." });
    };
    // 4. 데이터베이스에 존재하는 닉네임을 입력한 채 회원가입 버튼을 누른 경우 "중복된 닉네임입니다." 라는 에러메세지를 response에 포함하기
    if (isNickname) {
        return res.status(409).json({ message: "중복된 닉네임입니다." });
    }

    // 사용자 테이블에 데이터 삽입
    await Users.create({
        email, password, nickname
    });
    // 사용자 정보 테이블에 데이터를 삽입
    // 어떤 사용자의 사용자 정보인지 내용이 필요

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

// 로그인 API
router.post("/login", async (req, res) => {
    const { email, password, nickname } = req.body;
    const user = await Users.findOne({ email: email });
    // 5. 로그인 버튼을 누른 경우 닉네임과 비밀번호가 데이터베이스에 등록됐는지 확인한 뒤, 하나라도 맞지 않는 정보가 있다면 "닉네임 또는 패스워드를 확인해주세요."라는 에러 메세지를 response에 포함하기
    if (user.password !== password || user.nickname !== nickname) {
        return res.status(409).json({ message: "닉네임 또는 패스워드를 확인해주세요." });
    };

    // jwt를 생성하고
    const token = jwt.sign(
        { userId: user._id },
        "customized_secret_key"
    );
    
    // 쿠키를 발급
    // 6. 로그인 성공 시, 로그인에 성공한 유저의 정보를 JWT를 활용하여 클라이언트에게 Cookie로 전달하기
    res.cookie("Authorization", `Bearer ${token}`);
    res.status(200).json({ message: "로그인이 완료되었습니다." });
});

module.exports = router;

