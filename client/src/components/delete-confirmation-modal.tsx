import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodName: string;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  foodName,
  onConfirm,
  isLoading,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertTriangle className="text-red-600 text-xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Delete Food Item
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            Are you sure you want to delete{" "}
            <span className="font-medium">"{foodName}"</span>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Delete Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
