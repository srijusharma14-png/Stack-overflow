
import { useEffect, useState } from "react";
import { Bookmark, Trash2, MessageSquare } from "lucide-react";
import Link from "next/link";
import Mainlayout from "@/layout/MainLayout";
import { useAuth } from "@/lib/AuthContext";

type SavedQuestion = {
  _id: string;
  questiontitle: string;
  questionbody: string;
  questiontags: string[];
  userposted: string;
  savedAt?: string;
};

export default function SavesPage() {
  const { user } = useAuth();
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      setSavedQuestions([]);
      setIsLoading(false);
      return;
    }

    try {
      const storageKey = `savedQuestions_${user._id}`;
      const storedData = localStorage.getItem(storageKey);
      const parsedData = storedData ? JSON.parse(storedData) : [];

      setSavedQuestions(Array.isArray(parsedData) ? parsedData : []);
    } catch (error) {
      console.error("Could not load saved questions:", error);
      setSavedQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  const removeSavedQuestion = (questionId: string) => {
    if (!user?._id) return;

    const updatedQuestions = savedQuestions.filter(
      (question) => String(question._id) !== String(questionId)
    );

    localStorage.setItem(
      `savedQuestions_${user._id}`,
      JSON.stringify(updatedQuestions)
    );

    setSavedQuestions(updatedQuestions);
  };

  return (
    <Mainlayout>
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <Bookmark className="h-7 w-7 text-yellow-500" />
          <h1 className="text-2xl font-bold">Saved Questions</h1>
        </div>

        <p className="text-gray-600">
          Questions you bookmark will appear here.
        </p>

        {isLoading ? (
          <div className="py-10 text-center text-gray-500">
            Loading saved questions...
          </div>
        ) : !user ? (
          <div className="mt-6 rounded-lg border p-8 text-center">
            <p className="mb-4 text-gray-600">
              Please log in to view your saved questions.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Log in
            </Link>
          </div>
        ) : savedQuestions.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <h2 className="font-semibold text-gray-700">
              No saved questions yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Open a question and click the bookmark icon to save it.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-500">
              {savedQuestions.length} saved question
              {savedQuestions.length !== 1 ? "s" : ""}
            </p>

            {savedQuestions.map((question) => (
              <article
                key={question._id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/questions/${question._id}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {question.questiontitle || "Untitled question"}
                    </Link>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                      {(question.questionbody || "").length > 250
                        ? `${question.questionbody.slice(0, 250)}...`
                        : question.questionbody}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(Array.isArray(question.questiontags)
                        ? question.questiontags
                        : []
                      ).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                      <MessageSquare className="h-4 w-4" />
                      <span>Asked by {question.userposted || "Unknown user"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSavedQuestion(question._id)}
                    aria-label="Remove saved question"
                    title="Remove from Saves"
                    className="rounded-md p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
