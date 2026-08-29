import express from "express";

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

router.get("/:id", (req, res) => {
    res.send(`${req.params.id}`);
});

export default router;