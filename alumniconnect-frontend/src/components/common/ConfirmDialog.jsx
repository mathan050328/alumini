const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant,
  confirmVariant,
  isDanger,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleClose = onCancel || onClose || (() => {});
  const resolvedConfirmText = confirmText || confirmLabel || 'Confirm';
  const resolvedCancelText = cancelText || cancelLabel || 'Cancel';
  const resolvedVariant = variant || confirmVariant || (isDanger ? 'danger' : 'info');

  const variants = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-indigo-600 hover:bg-indigo-700',
    primary: 'bg-indigo-600 hover:bg-indigo-700',
    success: 'bg-green-600 hover:bg-green-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6 animate-in fade-in zoom-in duration-150">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {resolvedCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${variants[resolvedVariant] || variants.danger}`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
