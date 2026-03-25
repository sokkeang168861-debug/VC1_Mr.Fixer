import { useEffect, useState } from 'react';
import httpClient from '@/api/httpClient';
import Sidebar from '../components/Sidebar';
import { Header } from "../components/Header";
import SummaryCards from '../components/SummaryCards';
import TransactionsSummary from '../components/TransactionsSummary';

export default function ProfitPage() {
  const [profitData, setProfitData] = useState({
    summary: {
      totalTransactions: 0,
      totalServiceFee: 0,
      totalPaid: 0,
      totalCommission: 0,
      totalNetPayout: 0,
      commissionRate: 0.1,
    },
    transactions: [],
    monthlySummary: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfitData = async () => {
      try {
        const response = await httpClient.get("/fixer/profit");

        if (!isMounted) {
          return;
        }

        const payload = response?.data?.data || {};

        setProfitData({
          summary: {
            totalTransactions: Number(payload.summary?.totalTransactions || 0),
            totalServiceFee: Number(payload.summary?.totalServiceFee || 0),
            totalPaid: Number(payload.summary?.totalPaid || 0),
            totalCommission: Number(payload.summary?.totalCommission || 0),
            totalNetPayout: Number(payload.summary?.totalNetPayout || 0),
            commissionRate: Number(payload.summary?.commissionRate || 0.1),
          },
          transactions: Array.isArray(payload.transactions) ? payload.transactions : [],
          monthlySummary: Array.isArray(payload.monthlySummary)
            ? payload.monthlySummary
            : [],
        });
        setError("");
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load fixer profit data:", requestError);
        setError(
          requestError?.response?.data?.message || "Failed to load profit data."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfitData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)]" />
      
      <main className="ml-64 mt-16 p-8 space-y-8">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <SummaryCards summary={profitData.summary} loading={loading} />
        <TransactionsSummary
          transactions={profitData.transactions}
          monthlySummary={profitData.monthlySummary}
          loading={loading}
        />
      </main>
    </div>
  );
}
