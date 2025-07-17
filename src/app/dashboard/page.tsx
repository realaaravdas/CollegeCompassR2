import { CollegeCompassApp } from '@/components/college-compass-app';
import { CollegeDataProvider } from '@/contexts/college-data-context';

export default function DashboardPage() {
  return (
    <CollegeDataProvider>
      <CollegeCompassApp />
    </CollegeDataProvider>
  );
}
