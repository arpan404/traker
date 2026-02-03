"use client";

import { Loader } from "@/components/ui/loader";
import { useMemo, useState } from "react";
import { BoardHeader } from "@/components/board/board-header";
import { IssueDetailSheet } from "@/components/board/issue-detail-sheet";
import { IssuesTable } from "@/components/board/issues-table";
import { KanbanBoard } from "@/components/board/kanban-board";
import { useBoardModel } from "@/hooks/use-board-model";

export default function BoardPage() {
  const model = useBoardModel();
  const [zoom, setZoom] = useState(1);
  const zoomedStyle = useMemo(
    () => ({
      transform: `scale(${zoom})`,
      transformOrigin: "top left",
    }),
    [zoom],
  );

  if (model.isLoading) {
    return <Loader centered size="lg" />;
  }

  return (
    <section className="flex flex-col h-full relative">
      <div className="canvas-bg absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay" />
      <div className="relative z-10 flex flex-col gap-6 min-h-0">
        <BoardHeader
          view={model.view}
          onViewChange={model.setView}
          onNewIssue={() => model.openCreate()}
          zoom={zoom}
          onZoomIn={() => setZoom((value) => Math.min(1.25, value + 0.1))}
          onZoomOut={() => setZoom((value) => Math.max(0.7, value - 0.1))}
          onZoomReset={() => setZoom(1)}
          search={model.filters.search}
          onSearchChange={(value) => model.setFilters((prev) => ({ ...prev, search: value }))}
          sortBy={model.sortBy}
          onSortChange={model.setSortBy}
          filters={{
            projectId: model.filters.projectId,
            assigneeId: model.filters.assigneeId,
            priority: model.filters.priority,
            labelId: model.filters.labelId,
          }}
          onFilterChange={(patch) => model.setFilters((prev) => ({ ...prev, ...patch }))}
          members={model.members}
          projects={model.projects}
          labels={model.labels}
        />

        {model.view === "kanban" ? (
          <div className="flex-1 min-h-0 w-full overflow-auto">
            <div style={zoomedStyle} className="inline-block min-w-max pb-2">
              <KanbanBoard
                issuesByStatus={model.issuesByStatus}
                issueLabelsByIssueId={model.issueLabelsByIssueId}
                membersByUserId={model.membersByUserId}
                onDropIssue={model.handleDrop}
                onDropIssueOnCard={model.handleDropOnCard}
                onOpenIssue={model.openIssue}
                onNewIssue={model.openCreate}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 w-full overflow-auto">
            <IssuesTable
              issues={model.filteredIssues}
              membersByUserId={model.membersByUserId}
              onOpenIssue={model.openIssue}
            />
          </div>
        )}

        <IssueDetailSheet
          open={model.isCreateOpen || !!model.selectedIssueId}
          issueId={model.selectedIssueId}
          teamId={model.team?._id}
          initialStatus={model.createStatus}
          onCreated={model.handleIssueCreated}
          onClose={model.closeIssue}
        />
      </div>
    </section>
  );
}
