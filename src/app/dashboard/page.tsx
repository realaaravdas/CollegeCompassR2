import { CollegeCompassApp } from '@/components/college-compass-app';
import { AuthProvider } from '@/contexts/auth-context';
import { CollegeDataProvider } from '@/contexts/college-data-context';

export default function DashboardPage() {
  return (
    <AuthProvider>
      <CollegeDataProvider>
        <CollegeCompassApp />
      </CollegeDataProvider>
    </AuthProvider>
  );
}
