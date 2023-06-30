const express = require("express");
const router = express.Router();

const Users = require("../schemas/user.js")
const Posts = require("../schemas/post.js");
const authMiddleware = require("../middlewares/auth-middleware.js");

// 게시글 목록 조회
// 제목, 작성자명(nickname), 작성 날짜를 조회하기
router.get("/posts", async (req, res) => {
    const allPosts = await Posts.find();
    // 작성 날짜 기준으로 내림차순 정렬하기
    allPosts.sort(
        function (prev, next) {
            if (prev.createdAt > next.createdAt) { return -1 }
            else if (prev.createdAt == next.createdAt) { return 0 }
            else if (prev.createdAt < next.createdAt) { return 1 }
        }
    );

    if (!allPosts.length) {
        return res.status(200).json({
            "message": "게시글이 없습니다."
        })
    } else {
        return res.status(200).json({ "posts": allPosts })
    }
});

// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params
    const postfind = await Posts.findOne({ "_id": postId });
    if (postfind) {
        return res.status(200).json(
            { "선택": postfind }
        )
    }


});

// 게시글 작성 API
// 토큰을 검사하여, 유효한 토큰일 경우에만 게시글 작성 가능
router.post("/posts", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user
    const { title, content, password, checkPassword } = req.body;

    const existUser = await Users.find({ "_id": userId});

    if (!existUser) {
        return res.status(403).json({
            "error message": "로그인이 필요한 기능입니다!"
        });
    };
    if (password !== checkPassword) {
        return res.status(400).json({
            "error message": "비밀번호와 비밀번호 확인이 일치하지 않습니다!"
        });
    };
    let createdAt = new Date();

    // 제목, 작성 내용을 입력하기
    const post = await Posts.create({
        userId, title, content, password, createdAt
    })
    return res.status(201).json({ data: post })
});

// 게시글 수정 API
// 토큰을 검사하여, 해당 사용자가 작성한 게시글만 수정 가능
router.put("/posts/:postId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const { title, content, password } = req.body;
    const existPost = await Posts.findOne({ "_id": postId });

    if (existPost.password !== password) {
        return res.status(400).json({
            "error message": "비밀번호가 일치하지 않습니다!"
        });
    }
    if (existPost.userId !== userId) {
        return res.status(400).json({
            "error message": "사용자 권한이 없어 수정할 수 없습니다!"
        });
    } else {
        var updatedAt = new Date();
        await Posts.updateOne({ title, content, updatedAt });
        return res.status(200).json({
            "message": "게시글 수정을 완료했습니다!"
        });
    };
});

// 게시글 삭제 API 
// 토큰을 검사하여, 해당 사용자가 작성한 게시글만 삭제 가능
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user
    const { postId } = req.params;
    const { password } = req.body;
    const existPost = await Posts.findOne({ "_id": postId });

    if (existPost.userId !== userId) {
        return res.status(400).json({
            "error message": "사용자 권한이 없어 삭제할 수 없습니다!"
        });
    };
    if (existPost.password === password) {
        await Posts.deleteOne({ "_id": postId, "password": password });
        return res.status(200).json({
            "message": "게시글 삭제를 완료했습니다!"
        })
    } else {
        return res.status(400).json({
            "error message": "비밀번호 일치하지 않습니다!"
        });
    };
});


module.exports = router;