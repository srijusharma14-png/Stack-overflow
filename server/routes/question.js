import express from "express";
import {
  askquestion,
  deletequestion,
  getallquestion,
  votequestion,
} from "../controller/questions.js";

const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/ask", auth, askquestion);
router.get("/getallquestion", getallquestion);
router.delete("/delete/:id", auth, deletequestion);
router.patch("/vote/:id", auth, votequestion);

export default router;
