
import React, { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MainLayout from "@/layout/MainLayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosInstance";

export default function AskQuestionPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddTag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Allow comma-separated or space-separated tags.
    const tagsToAdd = newTag
      .split(/[,\s]+/)
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    if (tagsToAdd.length === 0) {
      toast.error("Please enter a tag.");
      return;
    }

    const updatedTags = [...new Set([...formData.tags, ...tagsToAdd])];

    if (updatedTags.length > 5) {
      toast.error("You can add a maximum of 5 tags.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: updatedTags,
    }));

    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    console.log("ASK QUESTION FORM SUBMITTED");

    if (loading) return;

    if (!user) {
      toast.error("Please log in to ask a question.");
      await router.push("/auth");
      return;
    }

    const title = formData.title.trim();
    const body = formData.body.trim();
    const tags = formData.tags;

    if (!title) {
      toast.error("Please enter a question title.");
      return;
    }

    if (body.length < 20) {
      toast.error("Your description must contain at least 20 characters.");
      return;
    }

    if (tags.length === 0) {
      toast.error("Please add at least one tag.");
      return;
    }

    if (tags.length > 5) {
      toast.error("You can add a maximum of 5 tags.");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post("/question/ask", {
        postquestiondata: {
          questiontitle: title,
          questionbody: body,
          questiontags: tags,
          userposted: user.name,
          userid: user._id,
        },
      });

      if (response.data?.data) {
        toast.success("Question posted successfully!");

        setFormData({
          title: "",
          body: "",
          tags: [],
        });

        await router.push("/questions");
      } else {
        console.error("Unexpected server response:", response.data);
        toast.error("The server did not confirm that your question was saved.");
      }
    } catch (error: any) {
      console.error(
        "Question submission failed:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        toast.error("Your login session may have expired. Please log in again.");
      } else if (error.response?.status === 400) {
        toast.error(
          error.response?.data?.message ||
            "Please check your question details."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Could not post your question. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <h1 className="mb-6 text-xl font-semibold lg:text-2xl">
          Ask a public question
        </h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">
                Writing a good question
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-base font-semibold">
                  Title
                </Label>

                <p className="mb-2 text-sm text-gray-600">
                  Be specific and imagine you're asking a question to another
                  person.
                </p>

                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. How to center a div in CSS?"
                  maxLength={200}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="body" className="text-base font-semibold">
                  What are the details of your problem?
                </Label>

                <p className="mb-2 text-sm text-gray-600">
                  Introduce the problem and expand on what you put in the title.
                  Minimum 20 characters.
                </p>

                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Describe your problem in detail..."
                  minLength={20}
                  required
                  className="min-h-32 w-full lg:min-h-48"
                />
              </div>

              <div>
                <Label htmlFor="newTag" className="text-base font-semibold">
                  Tags
                </Label>

                <p className="mb-2 text-sm text-gray-600">
                  Add up to 5 tags to describe what your question is about.
                </p>

                <div className="flex gap-2">
                  <Input
                    id="newTag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(e as any);
                      }
                    }}
                    placeholder="e.g. javascript react nextjs"
                    className="w-full"
                  />

                  <Button
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                    type="button"
                    aria-label="Add tag"
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 bg-orange-100 text-orange-800"
                    >
                      {tag}

                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove ${tag} tag`}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? "Posting question..." : "Review your question"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
