import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Header } from "../components/Header";
import httpClient from '../../../api/httpClient';
import { Loader2 } from 'lucide-react';

export default function JobsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingActive, setCheckingActive] = useState(true);

  useEffect(() => {
    const checkActiveJob = async () => {
      try {
        const res = await httpClient.get('/fixer/provider/active-job');
        if (res.data.success && res.data.data) {
          const job = res.data.data;
          const currentPath = location.pathname;

          // Resume logic: Redirect to correct sub-page if not already there
          if (job.status === 'fixer_accept') {
            const target = `/dashboard/fixer/jobs/proposal-status/${job.booking_id}`;
            if (currentPath !== target && currentPath === '/dashboard/fixer/jobs') {
              navigate(target);
            }
          } else if (job.status === 'customer_accept') {
            const target = '/dashboard/fixer/jobs/heading-to-customer';
            if (currentPath !== target && currentPath === '/dashboard/fixer/jobs') {
              navigate(target);
            }
          } else if (job.status === 'customer_reject') {
             const target = '/dashboard/fixer/jobs/proposal-rejected';
             if (currentPath !== target && currentPath === '/dashboard/fixer/jobs') {
               navigate(target);
             }
          }
        }
      } catch (err) {
        console.error('Error checking active job:', err);
      } finally {
        setCheckingActive(false);
      }
    };

    // Only auto-redirect if we are at the base /jobs path
    if (location.pathname === '/dashboard/fixer/jobs') {
      checkActiveJob();
    } else {
      setCheckingActive(false);
    }
  }, [navigate, location.pathname]);

  if (checkingActive) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF7A00]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)]" />
      <main className="ml-64 mt-16 p-8">
        <Outlet />
      </main>
    </div>
  );
}