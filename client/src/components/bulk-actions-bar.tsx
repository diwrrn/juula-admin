import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Edit, Download, Trash2, X } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  isVisible: boolean;
  isLoading: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkExport,
  isVisible,
  isLoading,
}: BulkActionsBarProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 px-6 py-3 z-40">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">
          <span className="font-medium">{selectedCount}</span> items selected
        </span>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBulkExport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            disabled={isLoading}
          >
            {isLoading && <LoadingSpinner size="sm" className="mr-1" />}
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
