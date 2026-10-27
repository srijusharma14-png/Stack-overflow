import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  History,
  Share,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosInstance";
import { useAuth } from "@/lib/AuthContext";

type QuestionDetailProps = {
  questionId?: string | string[];
};

const QuestionDetail = ({ questionId }: QuestionDetailProps) => {
  const router = useRouter();
  const { user } = useAuth();

  const [question, setQuestion] = useState<any>(null);
  const [newanswer, setNewAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch the requested question from the backend.
  useEffect(() => {
    if (!router.isReady) return;

    const id = Array.isArray(questionId) ? questionId[0] : questionId;

    if (!id) {
      setQuestion(null);
      setErrorMessage("No question ID was provided.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchQuestion = async () => {
      setLoading(true);
      setErrorMessage("");
      setQuestion(null);

      try {
        const res = await axiosInstance.get("/question/getallquestion");

        // Confirm that the API returned an array of questions.
        const questions = res.data?.data;

        if (!Array.isArray(questions)) {
          throw new Error(
            "The API response does not contain a valid questions array."
          );
        }

        // Compare IDs as strings to avoid string/ObjectId mismatches.
        const matchedQuestion = questions.find(
          (item: any) => String(item?._id) === String(id)
        );

        if (!matchedQuestion) {
          if (!cancelled) {
            setErrorMessage(
              "Question not found. It may have been deleted, or the question ID may be incorrect."
            );
          }
          return;
        }

        // Provide safe defaults for optional fields.
        const safeQuestion = {
          ...matchedQuestion,
          answer: Array.isArray(matchedQuestion.answer)
            ? matchedQuestion.answer
            : [],
          upvote: Array.isArray(matchedQuestion.upvote)
            ? matchedQuestion.upvote
            : [],
          downvote: Array.isArray(matchedQuestion.downvote)
            ? matchedQuestion.downvote
            : [],
          questiontags: Array.isArray(matchedQuestion.questiontags)
            ? matchedQuestion.questiontags
            : [],
          questiontitle: matchedQuestion.questiontitle ?? "Untitled question",
          questionbody: matchedQuestion.questionbody ?? "",
          userposted: matchedQuestion.userposted ?? "Unknown user",
          userid: matchedQuestion.userid ?? "",
          noofanswer: matchedQuestion.noofanswer ?? 0,
        };

        if (!cancelled) {
          setQuestion(safeQuestion);
        }
      } catch (error: any) {
        console.error("Error fetching question:", error);

        if (!cancelled) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Failed to load the question. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchQuestion();

    return () => {
      cancelled = true;
    };
  }, [questionId, router.isReady]);

  
const handleVote = async (vote: "upvote" | "downvote") => {
  if (!user) {
    toast.info("Please log in to continue.");
    router.push("/auth");
    return;
  }

  if (!question?._id) {
    toast.error("Question not found.");
    return;
  }

  try {
    const res = await axiosInstance.patch(
      `/question/vote/${question._id}`,
      {
        value: vote,
        userid: user._id,
      }
    );

    if (res.data?.data) {
      const updatedQuestion = res.data.data;

      setQuestion((prev: any) => ({
        ...prev,
        ...updatedQuestion,
        answer: Array.isArray(updatedQuestion.answer)
          ? updatedQuestion.answer
          : prev.answer,
        upvote: Array.isArray(updatedQuestion.upvote)
          ? updatedQuestion.upvote
          : prev.upvote,
        downvote: Array.isArray(updatedQuestion.downvote)
          ? updatedQuestion.downvote
          : prev.downvote,
        questiontags: Array.isArray(updatedQuestion.questiontags)
          ? updatedQuestion.questiontags
          : prev.questiontags,
      }));

      toast.success("Vote updated.");
    }
  } catch (error: any) {
    console.error("Error voting on question:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to vote on the question."
    );
  }
};

  

const handleBookmark = () => {
  if (!user) {
    window.alert("Please log in to save questions.");
    router.push("/login");
    return;
  }

  if (!question?._id) {
    window.alert("Question not found.");
    return;
  }

  try {
    const storageKey = `savedQuestions_${user._id}`;
    const storedData = localStorage.getItem(storageKey);
    const savedQuestions = storedData ? JSON.parse(storedData) : [];

    if (!Array.isArray(savedQuestions)) {
      throw new Error("Saved questions data is invalid.");
    }

    const alreadySaved = savedQuestions.some(
      (item: any) => String(item._id) === String(question._id)
    );

    const updatedSavedQuestions = alreadySaved
      ? savedQuestions.filter(
          (item: any) => String(item._id) !== String(question._id)
        )
      : [
          ...savedQuestions,
          {
            _id: question._id,
            questiontitle: question.questiontitle,
            questionbody: question.questionbody,
            questiontags: question.questiontags,
            userposted: question.userposted,
            userid: question.userid,
            savedAt: new Date().toISOString(),
          },
        ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedSavedQuestions)
    );

    setQuestion((prev: any) => ({
      ...prev,
      isBookmarked: !alreadySaved,
    }));

    window.alert(
      alreadySaved
        ? "Question removed from Saves."
        : "Question saved successfully!"
    );
  } catch (error) {
    console.error("Error saving question:", error);
    window.alert("Could not save the question. Please try again.");
  }
};


  const handleSubmitAnswer = async () => {
    if (!user) {
      toast.info("Please log in to continue.");
      router.push("/auth");
      return;
    }

    if (!newanswer.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await axiosInstance.post(
        `/answer/postanswer/${question._id}`,
        {
          noofanswer: question.noofanswer,
          answerbody: newanswer.trim(),
          useranswered: user.name,
          userid: user._id,
        }
      );

      if (res.data?.data) {
        // Use the answer returned by the backend when available.
        const savedAnswer =
          res.data.data.answer ??
          res.data.data;

        const normalizedAnswer = {
          ...savedAnswer,
          answerbody: savedAnswer.answerbody ?? newanswer.trim(),
          useranswered: savedAnswer.useranswered ?? user.name,
          userid: savedAnswer.userid ?? user._id,
          answeredon: savedAnswer.answeredon ?? new Date().toISOString(),
        };

        setQuestion((prev: any) => {
          const existingAnswers = Array.isArray(prev.answer)
            ? prev.answer
            : [];

          return {
            ...prev,
            answer: [...existingAnswers, normalizedAnswer],
            noofanswer: existingAnswers.length + 1,
          };
        });

        setNewAnswer("");
        toast.success("Answer posted successfully.");
      } else {
        toast.error("The server did not confirm that your answer was saved.");
      }
    } catch (error: any) {
      console.error("Error submitting answer:", error);
      toast.error(
        error.response?.data?.message || "Failed to post your answer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.info("Please log in to continue.");
      router.push("/auth");
      return;
    }

    if (String(question.userid) !== String(user._id)) {
      toast.error("You can only delete your own question.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const res = await axiosInstance.delete(
        `/question/delete/${question._id}`
      );

      if (res.data?.message || res.status === 200) {
        toast.success(res.data?.message || "Question deleted successfully.");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Error deleting question:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete the question."
      );
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!user) {
      toast.info("Please log in to continue.");
      router.push("/auth");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this answer?")) {
      return;
    }

    try {
      const res = await axiosInstance.delete(
        `/answer/delete/${question._id}`,
        {
          data: {
            noofanswer: question.answer.length,
            answerid: answerId,
          },
        }
      );

      if (res.data?.data || res.status === 200) {
        setQuestion((prev: any) => {
          const updatedAnswers = prev.answer.filter(
            (ans: any) => String(ans._id) !== String(answerId)
          );

          return {
            ...prev,
            answer: updatedAnswers,
            noofanswer: updatedAnswers.length,
          };
        });

        toast.success("Answer deleted successfully.");
      }
    } catch (error: any) {
      console.error("Error deleting answer:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete the answer."
      );
    }
  };

  // Loading state.
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Error or missing question state.
  if (!question) {
    return (
      <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-gray-200 p-6 text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Unable to load question
        </h2>
        <p className="mb-4 text-gray-600">
          {errorMessage || "No question found."}
        </p>
        <Button onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  const answers = Array.isArray(question.answer) ? question.answer : [];
  const upvotes = Array.isArray(question.upvote) ? question.upvote : [];
  const downvotes = Array.isArray(question.downvote)
    ? question.downvote
    : [];
  const tags = Array.isArray(question.questiontags)
    ? question.questiontags
    : [];

  const voteCount = upvotes.length - downvotes.length;

  return (
    <div className="max-w-5xl">
      {/* Question header */}
      <div className="mb-6">
        <h1 className="mb-4 text-xl font-semibold text-gray-900 lg:text-2xl">
          {question.questiontitle}
        </h1>

        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              Asked{" "}
              {question.askedon
                ? new Date(question.askedon).toLocaleDateString()
                : "date unavailable"}
            </span>
          </div>
        </div>
      </div>

      {/* Question content */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Voting and bookmark section */}
            <div className="flex items-center justify-center gap-2 border-b border-gray-200 p-4 sm:flex-col sm:justify-start sm:border-b-0 sm:border-r sm:p-6">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-600 hover:text-orange-500"
                onClick={() => handleVote("upvote")}
                aria-label="Upvote question"
              >
                <ChevronUp className="h-6 w-6" />
              </Button>

              <span className="font-semibold text-gray-800">
                {voteCount}
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-600 hover:text-orange-500"
                onClick={() => handleVote("downvote")}
                aria-label="Downvote question"
              >
                <ChevronDown className="h-6 w-6" />
              </Button>

              <div className="mt-0 flex gap-2 sm:mt-4 sm:flex-col">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 ${
                    question.isBookmarked
                      ? "text-yellow-500"
                      : "text-gray-600 hover:text-yellow-500"
                  }`}
                  onClick={handleBookmark}
                  aria-label="Bookmark question"
                >
                  <Bookmark
                    className="h-5 w-5"
                    fill={question.isBookmarked ? "currentColor" : "none"}
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Question history"
                >
                  <History className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="min-w-0 flex-1 p-4 sm:p-6">
              {/* Render user-provided content as text, not unsanitized HTML. */}
              <div className="mb-6 whitespace-pre-wrap wrap-break-word leading-relaxed text-gray-800">
                {question.questionbody}
              </div>

              {/* Tags */}
              <div className="mb-6 flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                  >
                    <Badge
                      variant="secondary"
                      className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Question actions and author */}
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          window.location.href
                        );
                        toast.success("Question link copied.");
                      } catch {
                        toast.error("Could not copy the question link.");
                      }
                    }}
                  >
                    <Share className="mr-1 h-4 w-4" />
                    Share
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => toast.info("Reporting is not implemented yet.")}
                  >
                    <Flag className="mr-1 h-4 w-4" />
                    Flag
                  </Button>

                  {String(question.userid) === String(user?._id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {String(question.userposted || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="text-xs text-gray-500">
                      Asked{" "}
                      {question.askedon
                        ? new Date(question.askedon).toLocaleDateString()
                        : "date unavailable"}
                    </div>
                    <Link
                      href={`/users/${question.userid}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {question.userposted}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          {answers.length} Answer{answers.length !== 1 ? "s" : ""}
        </h2>

        <div className="space-y-6">
          {answers.map((ans: any, index: number) => (
            <Card key={ans._id || index}>
              <CardContent className="p-4 sm:p-6">
                <div className="mb-6 whitespace-pre-wrap wrap-break-word leading-relaxed text-gray-800">
                  {ans.answerbody ?? "No answer text available."}
                </div>

                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/questions/${question._id}`
                          );
                          toast.success("Question link copied.");
                        } catch {
                          toast.error("Could not copy the link.");
                        }
                      }}
                    >
                      <Share className="mr-1 h-4 w-4" />
                      Share
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => toast.info("Reporting is not implemented yet.")}
                    >
                      <Flag className="mr-1 h-4 w-4" />
                      Flag
                    </Button>

                    {String(ans.userid) === String(user?._id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAnswer(ans._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {String(ans.useranswered || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="text-xs text-gray-500">
                        Answered{" "}
                        {ans.answeredon
                          ? new Date(ans.answeredon).toLocaleDateString()
                          : "date unavailable"}
                      </div>
                      <Link
                        href={`/users/${ans.userid}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {ans.useranswered || "Unknown user"}
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {answers.length === 0 && (
            <p className="text-gray-500">
              No answers yet. Be the first to answer!
            </p>
          )}
        </div>
      </div>

      {/* Submit an answer */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Your Answer
          </h3>

          <Textarea
            placeholder="Write your answer here..."
            value={newanswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="mb-4 min-h-32 resize-y"
          />

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              onClick={handleSubmitAnswer}
              disabled={!newanswer.trim() || isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? "Posting..." : "Post Your Answer"}
            </Button>

            <p className="text-sm text-gray-600">
              Please make sure your answer is relevant and helpful.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDetail;
