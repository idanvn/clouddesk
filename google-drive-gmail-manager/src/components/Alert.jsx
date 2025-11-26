import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Alert({ type = 'success', message, onClose }) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={`border rounded-lg p-4 mb-4 flex items-start gap-3 ${styles[type]}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
