import mongoose from "mongoose";
import question from "../models/question.js";


export const askquestion = async (req, res) => {
  const { postquestiondata } = req.body;
  const postques = new question({ ...postquestiondata });
  try {
    await postques.save();
    res.status(200).json({ data: postques });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const getallquestion = async (req, res) => {
  try {
    const allquestion = await question.find().sort({ askedon: -1 });
    res.status(200).json({ data: allquestion });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const deletequestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    await question.findByIdAndDelete(_id);
    res.status(200).json({ message: "question deleted" });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const userid = String(req.userid);
  const { value } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({
      message: "Invalid question ID.",
    });
  }

  if (value !== "upvote" && value !== "downvote") {
    return res.status(400).json({
      message: "Invalid vote type.",
    });
  }

  try {
    const questionDoc = await question.findById(_id);

    if (!questionDoc) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    const hasUpvoted = questionDoc.upvote.some(
      (id) => id === userid
    );

    const hasDownvoted = questionDoc.downvote.some(
      (id) => id === userid
    );

    if (value === "upvote") {
      questionDoc.downvote = questionDoc.downvote.filter(
        (id) => id !== userid
      );

      if (hasUpvoted) {
        questionDoc.upvote = questionDoc.upvote.filter(
          (id) => id !== userid
        );
      } else {
        questionDoc.upvote.push(userid);
      }
    } else {
      questionDoc.upvote = questionDoc.upvote.filter(
        (id) => id !== userid
      );

      if (hasDownvoted) {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== userid
        );
      } else {
        questionDoc.downvote.push(userid);
      }
    }

    await questionDoc.save();

    return res.status(200).json({
      data: questionDoc,
    });
  } catch (error) {
    console.error("Vote question error:", error);

    return res.status(500).json({
      message: "Something went wrong while voting.",
    });
  }
};
