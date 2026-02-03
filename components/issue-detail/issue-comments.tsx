import type { RefObject } from "react";
import type { JSONContent } from "@tiptap/react";
import type { Doc } from "@/convex/_generated/dataModel";
import type { UserResource } from "@clerk/types";
import { RichEditor } from "@/components/rich-editor";
import Image from "next/image";

interface IssueCommentsProps {
  comments: Doc<"comments">[];
  membersByUserId: Map<string, Doc<"teamMembers">>;
  user: UserResource | null | undefined;
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  onSubmit: () => void;
  commentInputRef: RefObject<HTMLInputElement | null>;
}

export function IssueComments({
  comments,
  membersByUserId,
  user,
  commentDraft,
  onCommentDraftChange,
  onSubmit,
  commentInputRef,
}: IssueCommentsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
        Comments
      </h3>
      <div className="space-y-3">
        {comments.map((comment) => {
          const author = membersByUserId.get(comment.authorId);
          return (
            <div key={comment._id} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[var(--status-neutral)] flex-shrink-0 overflow-hidden border border-[var(--border)]/60">
                {author?.avatarUrl ? (
                  <Image
                    src={author.avatarUrl}
                    alt=""
                    width={24}
                    height={24}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] font-bold">
                    {author?.fullName?.substring(0, 1) ?? "?"}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-[var(--foreground)]">
                    {author?.fullName ?? comment.authorId}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)]/60">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="text-[13px] leading-relaxed text-[var(--foreground)]">
                  <RichEditor
                    value={comment.bodyDoc as JSONContent}
                    editable={false}
                  />
                </div>
              </div>
            </div>
          );
        })}
        <div className="flex items-start gap-3">
          <div className="h-6 w-6 rounded-full bg-[var(--muted)] flex-shrink-0 overflow-hidden border border-[var(--border)]/60">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt=""
                width={24}
                height={24}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] font-bold">
                {user?.fullName?.substring(0, 1) ?? "?"}
              </div>
            )}
          </div>
          <input
            ref={commentInputRef}
            value={commentDraft}
            placeholder="Add a comment..."
            className="w-full bg-transparent text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 outline-none"
            onChange={(event) => onCommentDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void onSubmit();
              }
            }}
          />
          <button
            className="rounded-md bg-[var(--foreground)] px-2.5 py-1 text-[11px] font-semibold text-[var(--background)] shadow-sm hover:opacity-90 transition-opacity"
            onClick={onSubmit}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
