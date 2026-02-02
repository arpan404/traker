"use client";

import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { RichEditor } from "@/app/components/rich-editor";
import { useEffect, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

const DETAILS_SECTIONS = [
  "Summary",
  "Details",
  "Impact",
  "Steps Taken",
  "Next Steps",
];

const STATUS_OPTIONS = [
  "Backlog",
  "Open",
  "In Progress",
  "Testing",
  "In Review",
  "Won\u2019t Fix",
  "Resolved",
 ] as const;
type IssueStatus = (typeof STATUS_OPTIONS)[number];

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"] as const;
type IssuePriority = (typeof PRIORITY_OPTIONS)[number];

export default function IssueDetailPage() {
  const router = useRouter();
  const convex = useConvex();
  const params = useParams<{ slug: string; id: string }>();
  const issueId = params?.id as Id<"issues"> | undefined;
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const skip = "skip" as const;
  const issue = useQuery(
    api.issues.get,
    issueId && isAuthenticated ? { issueId } : skip,
  );
  const comments = useQuery(
    api.comments.list,
    issueId && isAuthenticated ? { issueId } : skip,
  );
  const members = useQuery(
    api.members.list,
    issue && isAuthenticated ? { teamId: issue.teamId } : skip,
  );
  const projects = useQuery(
    api.projects.list,
    issue && isAuthenticated ? { teamId: issue.teamId } : skip,
  );
  const labels = useQuery(
    api.labels.list,
    issue && isAuthenticated ? { teamId: issue.teamId } : skip,
  );
  const issueLabels = useQuery(
    api.issueLabels.listByIssue,
    issueId && isAuthenticated ? { issueId } : skip,
  );
  const updateIssue = useMutation(api.issues.update);
  const createComment = useMutation(api.comments.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFile = useMutation(api.files.create);
  const createLabel = useMutation(api.labels.create);
  const toggleIssueLabel = useMutation(api.issueLabels.toggle);
  const [commentDraft, setCommentDraft] = useState<Record<string, unknown>>({
    type: "doc",
    content: [{ type: "paragraph" }],
  });
  const [titleDraft, setTitleDraft] = useState("");

  useEffect(() => {
    if (issue) {
      setTitleDraft(issue.title);
    }
  }, [issue?.title, issue]);

  if (isConvexLoading || !isAuthenticated) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-600">Connecting to issue...</p>
        </div>
      </section>
    );
  }

  if (!issue || !comments || !members || !projects || !labels || !issueLabels) {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-600">Loading issue...</p>
        </div>
      </section>
    );
  }

  const updateDocField = (field: string) => async (doc: Record<string, unknown>) => {
    await updateIssue({
      issueId: issue._id,
      patch: {
        [field]: doc,
      },
    });
  };

  const handleCommentSubmit = async () => {
    await createComment({ issueId: issue._id, bodyDoc: commentDraft });
    setCommentDraft({ type: "doc", content: [{ type: "paragraph" }] });
  };

  const handleImageUpload = async (file: File) => {
    const uploadUrl = await generateUploadUrl({ teamId: issue.teamId });
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
    if (!response.ok) {
      return null;
    }
    const { storageId } = (await response.json()) as { storageId?: string };
    if (!storageId) {
      return null;
    }
    await createFile({
      teamId: issue.teamId,
      issueId: issue._id,
      storageId: storageId as Id<"_storage">,
      mimeType: file.type,
      size: file.size,
    });
    const url = await convex.query(api.files.getUrl, {
      teamId: issue.teamId,
      storageId: storageId as Id<"_storage">,
    });
    return url ?? null;
  };

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2f3437]">
            Issue
          </h1>
          <p className="mt-1 text-sm text-[#6b6f73]">
            Details and activity.
          </p>
        </div>
        <button
          className="rounded-md border border-[#e9e9e7] bg-white px-3 py-1.5 text-xs font-medium text-[#6b6f73]"
          onClick={() => router.back()}
        >
          Back to board
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,_1fr)_340px]">
        <div className="rounded-lg border border-[#e9e9e7] bg-white p-6">
          <div className="grid gap-4">
            <div className="h-28 rounded-md border border-dashed border-[#d9d9d6] bg-[#fbfbfa]" />
            <div className="grid gap-3">
              {["Backlog", "Open", "In Progress"].map((status) => (
                <div
                  key={status}
                  className="rounded-md border border-[#e9e9e7] bg-white p-3 text-sm text-[#6b6f73]"
                >
                  {status} column preview
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-[#e9e9e7] bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[#6b6f73]">Title</p>
              <input
                className="mt-1 w-full rounded-md border border-[#e9e9e7] bg-white px-3 py-2 text-lg font-semibold text-[#2f3437]"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={async () => {
                  if (titleDraft.trim() && titleDraft !== issue.title) {
                    await updateIssue({
                      issueId: issue._id,
                      patch: { title: titleDraft.trim() },
                    });
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs text-[#6b6f73]">
                Status
                <select
                  className="rounded-md border border-[#e9e9e7] bg-white px-2 py-2 text-xs text-[#2f3437]"
                  value={issue.status}
                  onChange={async (event) =>
                    updateIssue({
                      issueId: issue._id,
                      patch: { status: event.target.value as IssueStatus },
                    })
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-[#6b6f73]">
                Priority
                <select
                  className="rounded-md border border-[#e9e9e7] bg-white px-2 py-2 text-xs text-[#2f3437]"
                  value={issue.priority}
                  onChange={async (event) =>
                    updateIssue({
                      issueId: issue._id,
                      patch: { priority: event.target.value as IssuePriority },
                    })
                  }
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-[#6b6f73]">
                Assignee
                <select
                  className="rounded-md border border-[#e9e9e7] bg-white px-2 py-2 text-xs text-[#2f3437]"
                  value={issue.assigneeId ?? ""}
                  onChange={async (event) =>
                    updateIssue({
                      issueId: issue._id,
                      patch: {
                        assigneeId: event.target.value || undefined,
                      },
                    })
                  }
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member._id} value={member.userId}>
                      {member.userId}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-[#6b6f73]">
                Project
                <select
                  className="rounded-md border border-[#e9e9e7] bg-white px-2 py-2 text-xs text-[#2f3437]"
                  value={issue.projectId ?? ""}
                  onChange={async (event) =>
                    updateIssue({
                      issueId: issue._id,
                      patch: {
                        projectId: (event.target.value || undefined) as
                          | Id<"projects">
                          | undefined,
                      },
                    })
                  }
                >
                  <option value="">None</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.key}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b6f73]">Labels</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {labels.map((label) => {
                  const attached = issueLabels.some(
                    (link) => link.labelId === label._id,
                  );
                  return (
                    <button
                      key={label._id}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        attached
                          ? "border-[#2f3437] bg-[#2f3437] text-white"
                          : "border-[#e9e9e7] bg-[#f1f1ef] text-[#6b6f73]"
                      }`}
                      onClick={() =>
                        toggleIssueLabel({
                          teamId: issue.teamId,
                          issueId: issue._id,
                          labelId: label._id,
                        })
                      }
                    >
                      {label.name}
                    </button>
                  );
                })}
                <button
                  className="rounded-full border border-dashed border-[#d9d9d6] px-3 py-1 text-xs text-[#9a9a97]"
                  onClick={async () => {
                    const name = window.prompt("New label name");
                    if (!name) return;
                    await createLabel({
                      teamId: issue.teamId,
                      name,
                    });
                  }}
                >
                  + Add label
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              {DETAILS_SECTIONS.map((section) => (
                <div key={section}>
                  <p className="text-xs font-medium text-slate-500">
                    {section}
                  </p>
                  <div className="mt-2">
                    <RichEditor
                      value={
                        section === "Summary"
                          ? issue.summaryDoc
                          : section === "Details"
                            ? issue.detailsDoc
                            : section === "Impact"
                              ? issue.impactDoc
                              : section === "Steps Taken"
                                ? issue.stepsTakenDoc
                                : issue.nextStepsDoc
                      }
                      placeholder={`Add ${section.toLowerCase()}...`}
                      onChange={updateDocField(
                        section === "Summary"
                          ? "summaryDoc"
                          : section === "Details"
                            ? "detailsDoc"
                            : section === "Impact"
                              ? "impactDoc"
                              : section === "Steps Taken"
                                ? "stepsTakenDoc"
                                : "nextStepsDoc",
                      )}
                      onImageUpload={handleImageUpload}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b6f73]">Comments</p>
              <div className="mt-2 grid gap-2">
                <RichEditor
                  value={commentDraft}
                  placeholder="Leave a comment..."
                  onChange={setCommentDraft}
                  onImageUpload={handleImageUpload}
                />
                <button
                  className="rounded-md bg-[#2f3437] px-3 py-1.5 text-xs font-medium text-white"
                  onClick={handleCommentSubmit}
                >
                  Add comment
                </button>
                {comments.length === 0 ? (
                  <div className="rounded-md border border-[#e9e9e7] bg-[#fbfbfa] p-3 text-xs text-[#6b6f73]">
                    No comments yet.
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="rounded-md border border-[#e9e9e7] bg-[#fbfbfa] p-3 text-xs text-[#6b6f73]"
                    >
                      {comment.authorId} commented
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b6f73]">Activity</p>
              <div className="mt-2 space-y-2 text-xs text-[#9a9a97]">
                <p>Sam moved issue to In Review</p>
                <p>Jules added a comment</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
