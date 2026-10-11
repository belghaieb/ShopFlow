import { PackageOpen } from 'lucide-react';

export default function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-4">
      <PackageOpen className="w-16 h-16" />
      <p className="text-lg font-medium">{message}</p>
      {action}
    </div>
  );
}
