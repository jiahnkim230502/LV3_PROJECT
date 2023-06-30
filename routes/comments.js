const express = require("express");
const router = express.Router();

const Comments = require("../schemas/comment.js");
const Users = require("../schemas/user.js");
const Posts = require("../schemas/post.js");
const authMiddleware = require("../middlewares/auth-middleware.js");

// 댓글 조회
router.get("/posts/:postId/comments", async (req, res) => {
    const { postId } = req.params
    const allComments = await Comments.find({ "postId": postId });
    allComments.sort(
        function (prev, next) {
            if (prev.date > next.date) { return -1 }
            else if (prev.date == next.date) { return 0 }
            else if (prev.date < next.date) { return 1 }
        }
    );

    if (!allComments.length) {
        return res.status(404).json({
            "errorMessage": "댓글이 존재하지 않습니다."
        })
    } else {
        return res.status(200).json({ "posts": allComments })
    };
});

// 댓글 작성
// 로그인 토큰을 검사하여, 유효한 토큰일 경우에만 댓글 작성 가능
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId } = req.params
    const { password, content } = req.body;
    const existPost = Posts.findOne({ "postId": postId })
    const existUser = Users.findOne({ "userId": userId })

    if (!existPost) {
        return res.status(404).json({ "message": "게시글이 존재하지 않습니다." });
    }
    if (!existUser) {
        return res.status(403).json({ "message": "로그인이 필요한 필요한 기능입니다." });
    };

    let createdAt = new Date()

    if (!content) {
        return res.status(400).json({
            success: false,
            errorMessage: "댓글 내용을 입력해주세요."
        })
    } else {
        await Comments.create({ password, content, postId, userId, createdAt })
        return res.status(201).json({ "comment": "댓글을 작성하였습니다." })
    };
});

// 댓글 수정
router.put("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const { content } = req.body;

    const existComment = await Comments.findOne({ "_id": commentId });

    if (existComment.userId !== userId) {
        return res.status(403).json({ "message": "댓글 수정권한이 존재하지 않습니다." })
    };

    let updatedAt = new Date();

    if (!content) {
        return res.status(400).json({
            success: false,
            errorMessage: "수정할 댓글 내용을 입력해주세요."
        })
    } else {
        await Comments.updateOne({ content, updatedAt, postId })
        return res.status(201).json({ "message": "댓글이 수정되었습니다." })
    };
});

// 댓글 제거
// 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 삭제 가능
router.delete("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { commentId } = req.params;

    const existComment = await Comments.findOne({ "_id": commentId });

    if (existComment.userId !== userId) {
        return res.status(403).json({ "message": "댓글 삭제권한이 존재하지 않습니다." })
    }

    if (Comments.find({ "_id": commentId })) {
        await Comments.deleteOne({ "_id": commentId })
        return res.status(200).json({
            "message": "댓글이 삭제되었습니다."
        });
    };
});


module.exports = router;