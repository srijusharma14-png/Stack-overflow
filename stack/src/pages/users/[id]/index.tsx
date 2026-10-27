
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/MainLayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { Calendar, Edit, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function UserProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const profileId = Array.isArray(id) ? id[0] : id;

  const [users, setusers] = useState<any>(null);
  const [userQuestions, setUserQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    about: "",
    tags: [] as string[],
  });

  // Fetch the profile user.
  useEffect(() => {
    if (!router.isReady || !profileId) return;

    let cancelled = false;

    const fetchUser = async () => {
      setloading(true);

      try {
        const res = await axiosInstance.get("/user/getalluser");
        const allUsers = res.data?.data || [];

        const matchedUser = allUsers.find(
          (item: any) => String(item._id) === String(profileId)
        );

        if (!cancelled && matchedUser) {
          setusers(matchedUser);

          setEditForm({
            name: matchedUser.name || "",
            about: matchedUser.about || "",
            tags: Array.isArray(matchedUser.tags)
              ? matchedUser.tags
              : [],
          });
        } else if (!cancelled) {
          setusers(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (!cancelled) {
          toast.error("Could not load this user profile.");
          setusers(null);
        }
      } finally {
        if (!cancelled) setloading(false);
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, profileId]);

  // Fetch the questions asked and answers posted by this user.
  useEffect(() => {
    if (!router.isReady || !profileId) return;

    let cancelled = false;

    const fetchUserActivity = async () => {
      setActivityLoading(true);

      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const allQuestions = Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const questions = allQuestions.filter(
          (question: any) =>
            String(question.userid) === String(profileId)
        );

        const answers = allQuestions.flatMap((question: any) =>
          (Array.isArray(question.answer) ? question.answer : [])
            .filter(
              (answer: any) =>
                String(answer.userid) === String(profileId)
            )
            .map((answer: any) => ({
              ...answer,
              questionId: question._id,
              questionTitle: question.questiontitle,
            }))
        );

        if (!cancelled) {
          setUserQuestions(questions);
          setUserAnswers(answers);
        }
      } catch (error) {
        console.error("Error fetching user activity:", error);
        if (!cancelled) {
          setUserQuestions([]);
          setUserAnswers([]);
        }
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    };

    fetchUserActivity();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, profileId]);

  const handleSaveProfile = async () => {
    if (!user?._id) {
      toast.error("Please log in to edit your profile.");
      return;
    }

    try {
      const res = await axiosInstance.patch(
        `/user/update/${user._id}`,
        editForm
      );

      if (res.data) {
        setusers((previous: any) => ({
          ...previous,
          name: editForm.name,
          about: editForm.about,
          tags: [...editForm.tags],
        }));

        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Something went wrong while saving your profile.");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();

    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm((previous) => ({
        ...previous,
        tags: [...previous.tags, trimmedTag],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm((previous) => ({
      ...previous,
      tags: previous.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex items-center justify-center p-12">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-blue-500" />
        </div>
      </Mainlayout>
    );
  }

  if (!users) {
    return (
      <Mainlayout>
        <div className="mt-8 text-center text-gray-500">
          No user found.
        </div>
      </Mainlayout>
    );
  }

  const isOwnProfile =
    String(profileId) === String(user?._id);

  return (
    <Mainlayout>
      <div className="mx-auto max-w-6xl p-4">
        {/* User profile header */}
        <div className="mb-8 flex flex-col items-start gap-6 rounded-lg border bg-white p-6 shadow-sm lg:flex-row lg:items-center">
          <Avatar className="h-24 w-24 lg:h-32 lg:w-32">
            <AvatarFallback className="bg-orange-100 text-2xl font-bold text-orange-600 lg:text-3xl">
              {users.name
                ? users.name
                    .split(" ")
                    .map((part: string) => part[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="mb-1 text-2xl font-bold text-gray-800 lg:text-3xl">
                  {users.name}
                </h1>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Joined recently</span>
                </div>
              </div>

              {isOwnProfile && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-gray-700"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>

                  <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white p-6 text-gray-900">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-800">
                        Edit Profile
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(event) =>
                            setEditForm((previous) => ({
                              ...previous,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Your display name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="about">About Me</Label>
                        <Textarea
                          id="about"
                          value={editForm.about}
                          onChange={(event) =>
                            setEditForm((previous) => ({
                              ...previous,
                              about: event.target.value,
                            }))
                          }
                          placeholder="Tell us about yourself..."
                          className="min-h-30"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Skills & Technologies</Label>

                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(event) =>
                              setNewTag(event.target.value)
                            }
                            placeholder="Add a skill (e.g. React)"
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />

                          <Button
                            type="button"
                            onClick={handleAddTag}
                            className="bg-orange-500 px-3 text-white hover:bg-orange-600"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {editForm.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 text-xs text-gray-800"
                            >
                              {tag}
                              <button
                                type="button"
                                aria-label={`Remove ${tag}`}
                                className="text-gray-500 hover:text-red-500"
                                onClick={() => handleRemoveTag(tag)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>

                      <Button
                        className="bg-blue-600 px-5 text-white hover:bg-blue-700"
                        onClick={handleSaveProfile}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* About and skills */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border bg-white shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                About
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="whitespace-pre-line leading-relaxed text-gray-600">
                {users.about ||
                  "This user hasn't written an about section yet."}
              </p>
            </CardContent>
          </Card>

          <Card className="border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                Skills & Technologies
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(users.tags) && users.tags.length > 0 ? (
                  users.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">
                    No skills added yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions asked */}
        <Card className="mt-6 border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800">
              Questions Asked ({userQuestions.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {activityLoading ? (
              <p className="text-sm text-gray-500">
                Loading questions...
              </p>
            ) : userQuestions.length === 0 ? (
              <p className="text-sm text-gray-500">
                This user hasn't asked any questions yet.
              </p>
            ) : (
              <div className="space-y-4">
                {userQuestions.map((question: any) => (
                  <div
                    key={question._id}
                    className="border-b border-gray-200 pb-4 last:border-0"
                  >
                    <Link
                      href={`/questions/${question._id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {question.questiontitle}
                    </Link>

                    <p className="mt-1 text-sm text-gray-500">
                      {question.noofanswer || 0} answers
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Answers posted */}
        <Card className="mt-6 border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800">
              Answers Posted ({userAnswers.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {activityLoading ? (
              <p className="text-sm text-gray-500">
                Loading answers...
              </p>
            ) : userAnswers.length === 0 ? (
              <p className="text-sm text-gray-500">
                This user hasn't posted any answers yet.
              </p>
            ) : (
              <div className="space-y-4">
                {userAnswers.map((answer: any, index: number) => (
                  <div
                    key={answer._id || `${answer.questionId}-${index}`}
                    className="border-b border-gray-200 pb-4 last:border-0"
                  >
                    <Link
                      href={`/questions/${answer.questionId}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {answer.questionTitle || "View question"}
                    </Link>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                      {answer.answerbody || "No answer text available."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Mainlayout>
  );
}
