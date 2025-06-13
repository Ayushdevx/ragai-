import React from 'react';
import Icon from 'components/AppIcon';

const DeleteConfirmModal = ({ onConfirm, onCancel, conversationTitle }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1000 p-4">
      <div className="bg-surface rounded-lg shadow-elevation-6 w-full max-w-md">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} className="text-error" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Delete Conversation</h2>
              <p className="text-sm text-text-secondary">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-text-secondary mb-4">
            Are you sure you want to delete this conversation? All messages, attachments, and associated data will be permanently removed.
          </p>
          
          {conversationTitle && (
            <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <Icon name="MessageCircle" size={16} className="text-text-secondary" />
                <span className="text-sm font-medium text-text-primary truncate">
                  {conversationTitle}
                </span>
              </div>
            </div>
          )}

          <div className="bg-error-50 border border-error-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
              <div className="text-sm text-error">
                <strong>Warning:</strong> This conversation and all its data will be permanently deleted. This action cannot be undone.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-secondary-50 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            className="flex items-center space-x-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-error-700 transition-colors duration-200"
          >
            <Icon name="Trash2" size={16} />
            <span>Delete Conversation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;