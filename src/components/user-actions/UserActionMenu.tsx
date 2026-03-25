import { useState } from "react";
import { MoreVertical, UserMinus, Ban, Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnmatchDialog } from "./UnmatchDialog";
import { BlockDialog } from "./BlockDialog";
import { ReportDialog } from "./ReportDialog";

interface UserActionMenuProps {
  targetUserId: string;
  targetUserName: string;
  connectionId: string;
  currentUserId: string;
  onActionComplete?: () => void;
}

export function UserActionMenu({
  targetUserId,
  targetUserName,
  connectionId,
  currentUserId,
  onActionComplete,
}: UserActionMenuProps) {
  const [unmatchOpen, setUnmatchOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 text-foreground/60 hover:text-primary transition-all duration-300 rounded-full hover:bg-primary/10">
            <MoreVertical className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setUnmatchOpen(true)} className="gap-2">
            <UserMinus className="w-4 h-4" />
            Verbindung beenden
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockOpen(true)} className="gap-2 text-destructive focus:text-destructive">
            <Ban className="w-4 h-4" />
            Blockieren
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setReportOpen(true)} className="gap-2">
            <Flag className="w-4 h-4" />
            Melden
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UnmatchDialog
        open={unmatchOpen}
        onOpenChange={setUnmatchOpen}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        connectionId={connectionId}
        onComplete={onActionComplete}
      />

      <BlockDialog
        open={blockOpen}
        onOpenChange={setBlockOpen}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        connectionId={connectionId}
        currentUserId={currentUserId}
        onComplete={onActionComplete}
      />

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        currentUserId={currentUserId}
      />
    </>
  );
}
