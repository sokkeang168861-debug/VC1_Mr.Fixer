import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Header } from "../components/Header";
import httpClient from '@/api/httpClient';
import { ROUTES } from '@/config/routes';
import {
  clearActiveFixerBookingId,
  getActiveFixerBookingId,
  setActiveFixerBookingId,
} from '@/pages/fixer/lib/activeBooking';

export default function JobsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingRoute, setCheckingRoute] = useState(true);

  useEffect(() => {
    if (location.pathname !== ROUTES.dashboardFixerJobs) {
      setCheckingRoute(false);
      return;
    }

    const activeBookingId = getActiveFixerBookingId();

    if (!activeBookingId) {
      setCheckingRoute(false);
      return;
    }

    let isMounted = true;

    const routeFromBooking = (booking) => {
      const nextBookingId = Number(booking?.booking_id || booking?.id || 0);
      const nextStatus = String(booking?.status || '').toLowerCase();
      const nextPaymentStatus = String(
        booking?.payment?.status || booking?.payment_status || ''
      ).toLowerCase();

      if (!nextBookingId || !nextStatus) {
        return false;
      }

      if (nextStatus === 'complete') {
        if (nextPaymentStatus === 'completed') {
          clearActiveFixerBookingId();
          return false;
        }

        setActiveFixerBookingId(nextBookingId);
        navigate(
          nextPaymentStatus === 'paid'
            ? '/dashboard/fixer/jobs/job-completed'
            : '/dashboard/fixer/jobs/express-checkout',
          {
            replace: true,
            state: { bookingId: nextBookingId },
          }
        );
        return true;
      }

      setActiveFixerBookingId(nextBookingId);

      if (nextStatus === 'fixer_accept') {
        navigate('/dashboard/fixer/jobs/proposal-status', {
          replace: true,
          state: { bookingId: nextBookingId },
        });
        return true;
      }

      if (nextStatus === 'customer_accept') {
        navigate('/dashboard/fixer/jobs/heading-to-customer', {
          replace: true,
          state: { bookingId: nextBookingId },
        });
        return true;
      }

      if (nextStatus === 'arrived') {
        navigate('/dashboard/fixer/jobs/arrived-status', {
          replace: true,
          state: { bookingId: nextBookingId },
        });
        return true;
      }

      return false;
    };

    const resumeActiveStep = async () => {
      try {
        if (activeBookingId) {
          try {
            const activeResponse = await httpClient.get(
              `/fixer/provider/requests/${activeBookingId}`
            );
            const activeBooking = activeResponse?.data?.data;

            if (!isMounted) {
              return;
            }

            if (activeBooking && routeFromBooking(activeBooking)) {
              return;
            }
          } catch (activeError) {
            console.error(activeError);
          }
        }

        const response = await httpClient.get('/fixer/provider/requests');
        const jobs = Array.isArray(response?.data?.data) ? response.data.data : [];

        if (!isMounted) {
          return;
        }

        const statusPriority = {
          complete: 4,
          arrived: 3,
          customer_accept: 2,
          fixer_accept: 1,
        };

        const resumableJobs = jobs.filter((job) =>
          Object.prototype.hasOwnProperty.call(
            statusPriority,
            String(job?.status || '').toLowerCase()
          )
        );

        if (resumableJobs.length === 0) {
          setCheckingRoute(false);
          return;
        }

        const matchingSavedJob = resumableJobs.find(
          (job) => Number(job.booking_id) === Number(activeBookingId)
        );

        const nextJob = resumableJobs.reduce((bestJob, currentJob) => {
          if (!bestJob) {
            return currentJob;
          }

          const bestPriority = statusPriority[String(bestJob.status || '').toLowerCase()] || 0;
          const currentPriority = statusPriority[String(currentJob.status || '').toLowerCase()] || 0;

          if (currentPriority > bestPriority) {
            return currentJob;
          }

          if (currentPriority === bestPriority && Number(currentJob.booking_id) > Number(bestJob.booking_id)) {
            return currentJob;
          }

          return bestJob;
        }, matchingSavedJob || null);

        const nextBookingId = Number(nextJob?.booking_id || activeBookingId);
        const nextStatus = String(nextJob?.status || '').toLowerCase();

        if (!nextBookingId || !nextStatus) {
          setCheckingRoute(false);
          return;
        }

        if (routeFromBooking(nextJob)) {
          return;
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setCheckingRoute(false);
        }
      }
    };

    resumeActiveStep();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)]" />
      <main className="ml-64 mt-16 p-8">
        {checkingRoute ? null : <Outlet />}
      </main>
    </div>
  );
}
