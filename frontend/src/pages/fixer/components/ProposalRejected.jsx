import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function ProposalRejected() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/dashboard/fixer/jobs');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-8">
          <XCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Proposal Rejected</h2>
        <p className="text-gray-400 max-w-md leading-relaxed mb-12">
          The customer has rejected your proposal. This job is no longer available.
        </p>

        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Go back to Job List</span>
        </button>
      </div>
    </div>
  );
}
