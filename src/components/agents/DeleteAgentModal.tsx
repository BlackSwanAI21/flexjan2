import React from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';

interface DeleteAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteFromOpenAI: boolean) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteAgentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting 
}: DeleteAgentModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete AI Agent"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Are you sure you want to delete this AI agent? This action cannot be undone.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => onConfirm(true)}
            isLoading={isDeleting}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Delete from Database and OpenAI
          </Button>
          
          <Button
            onClick={() => onConfirm(false)}
            isLoading={isDeleting}
            variant="secondary"
            className="w-full"
          >
            Delete from Database Only
          </Button>
          
          <Button
            onClick={onClose}
            variant="secondary"
            className="w-full"
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}