import React, { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "@/layout/MainLayout";
import axiosInstance from "@/lib/axiosInstance";

type Question = {
  _id: string;
  questiontitle?: string;
  questionbody?: string;
  questiontags?: string[];
  noofanswer?: number;
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axiosInstance.get("/question/getallquestion");
        const data = response.data?.data;

        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          setError("The server response doesn't contain a questions array.");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Unable to load questions. Check the browser console.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">All Questions</h1>
          <Link
            href="/ask"
            className="rounded-md bg-orange-600 px-4 py-2 text-white"
          >
            Ask Question
          </Link>
        </div>

        {loading && <p>Loading questions...</p>}

        {!loading && error && (
          <p role="alert" className="text-red-600">{error}</p>
        )}

        {!loading && !error && questions.length === 0 && (
          <p>No questions found yet.</p>
        )}

        {!loading && !error && questions.map((question) => (
          <article key={question._id} className="mb-4 rounded-lg border p-4">
            <Link
              href={`/questions/${question._id}`}
              className="text-lg font-semibold text-blue-700 hover:underline"
            >
              {question.questiontitle || "Untitled question"}
            </Link>

            {question.questionbody && (
              <p className="mt-2 text-sm text-gray-600">
                {question.questionbody}
              </p>
            )}

            {question.questiontags && (
              <div className="mt-3 flex flex-wrap gap-2">
                {question.questiontags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded bg-gray-100 px-2 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-2 text-sm text-gray-500">
              Answers: {question.noofanswer ?? 0}
            </p>
          </article>
        ))}
      </main>
    </MainLayout>
  );
}

