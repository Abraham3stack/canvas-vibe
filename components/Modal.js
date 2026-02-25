"use client";

export default function Modal({ 
  show, 
  title, 
  message, 
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  isConfirm = false,
  loading = false, 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-80 p-6 rounded-xl shadow-xl animate-fadeIn">
        <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">
          {title}
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {message}
        </p>

        {isConfirm ? (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded bg-red-500 text-white"
              disabled={loading}
            >
              {loading ? "Deleting..." : confirmText}
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-2 rounded bg-black text-white dark:bg-white dark:text-black"
          >
            {confirmText}
          </button>
        )}
      </div>
    </div>
  );
}