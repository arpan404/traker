import { ISSUE_DETAILS_SECTIONS } from "@/lib/constants";
import { RichEditor } from "@/components/rich-editor";
import type { Doc } from "@/convex/_generated/dataModel";
import type { JSONContent } from "@tiptap/react";

interface IssueContentSectionsProps {
  issue: Doc<"issues">;
  onUpdateDoc: (
    field: "summaryDoc" | "detailsDoc" | "impactDoc" | "stepsTakenDoc" | "nextStepsDoc"
  ) => (doc: JSONContent) => void;
  onImageUpload: (file: File) => Promise<string | null>;
}

export function IssueContentSections({
  issue,
  onUpdateDoc,
  onImageUpload,
}: IssueContentSectionsProps) {
  return (
    <div className="space-y-6 border-t border-[var(--border)]/70 pt-5">
      {ISSUE_DETAILS_SECTIONS.map((section) => {
        const docValue =
          section === "Summary"
            ? issue.summaryDoc
            : section === "Details"
              ? issue.detailsDoc
              : section === "Impact"
                ? issue.impactDoc
                : section === "Steps Taken"
                  ? issue.stepsTakenDoc
                  : issue.nextStepsDoc;
        const description =
          section === "Summary"
            ? "Provide a short summary of the issue."
            : section === "Details"
              ? "Describe the issue in detail, including relevant background."
              : section === "Impact"
                ? "Explain the impact on projects or operations."
                : section === "Steps Taken"
                  ? "List actions already taken."
                  : "Outline the next steps required to resolve.";
        const field =
          section === "Summary"
            ? "summaryDoc"
            : section === "Details"
              ? "detailsDoc"
              : section === "Impact"
                ? "impactDoc"
                : section === "Steps Taken"
                  ? "stepsTakenDoc"
                  : "nextStepsDoc";

        return (
          <div key={section} className="space-y-2">
            <h3 className="text-[17px] font-semibold text-[var(--foreground)] tracking-tight">
              {section}
            </h3>
            <div className="min-h-[20px]">
              <RichEditor
                value={docValue}
                placeholder={description}
                onChange={onUpdateDoc(field)}
                onImageUpload={onImageUpload}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
