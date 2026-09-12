import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isLoading }: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden" role="dialog" aria-modal="true">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 text-gray-600">
          {message}
        </div>
        <div className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

