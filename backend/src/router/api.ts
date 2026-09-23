import express from "express";
import userRouter from "./user.js";


const router = express.Router();

router.use("/user", userRouter);

router.get("/ping", (req, res) => {
    res.send("pong");
})


export default router;