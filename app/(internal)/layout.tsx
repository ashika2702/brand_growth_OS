import DashboardLayout from '@/components/layout/DashboardLayout';

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
