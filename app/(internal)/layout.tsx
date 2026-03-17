import DashboardLayout from '@/components/layout/DashboardLayout';
import { ToastProvider } from '@/components/layout/ToastProvider';

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ToastProvider>
  );
}
