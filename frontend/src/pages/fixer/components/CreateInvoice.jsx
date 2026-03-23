import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus, Send, Info, FileText } from 'lucide-react';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [items] = useState([
    { id: '1', description: 'General Repair - Kitchen Sink', type: 'Labor', total: 85.00 },
    { id: '2', description: 'Replacement O-Ring Seal', type: 'Parts', total: 12.50 },
    { id: '3', description: 'Waterproof Industrial Adhesive', type: 'Materials', total: 5.00 }
  ]);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.085;
  const tax = subtotal * taxRate;
  const totalAmount = subtotal + tax;

  const getTypeStyles = (type) => {
    switch (type) {
      case 'Labor': return 'bg-[#FFF5ED] text-[#FF7A1F]';
      case 'Parts': return 'bg-[#EEF2FF] text-[#4F46E5]';
      case 'Materials': return 'bg-[#F3F4F6] text-[#6B7280]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Invoice</h1>
        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
          <FileText size={16} />
          <span>Job Reference #FIX-99201</span>
        </div>
      </div>

      {/* Job Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-[#FFF5ED] rounded-xl flex items-center justify-center text-[#FF7A1F]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 1 2.83 0l.3.3a2 2 0 0 1 0 2.83l-3.77 3.77a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 1 2.83 0l.3.3a2 2 0 0 1 0 2.83l-3.77 3.77a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0" />
              <path d="m2 22 5-5" />
              <path d="M9.5 14.5 16 8" />
              <path d="m17 2 5 5" />
              <path d="M3.5 14.5a4.95 4.95 0 0 1 7 7L5 16l-1.5-1.5Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Plumbing Issue</h2>
            <p className="text-sm text-gray-400 font-medium">Service for <span className="text-gray-600">Alex Johnson</span></p>
          </div>
        </div>
        <div className="flex gap-12">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-300 tracking-wider mb-1">Issue Reported</p>
            <p className="text-sm font-bold text-gray-700">Oct 24, 2023</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-300 tracking-wider mb-1">Location</p>
            <p className="text-sm font-bold text-gray-700">Brooklyn, NY</p>
          </div>
        </div>
      </div>

      {/* Itemized Billing Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Itemized Billing</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-white border-b border-gray-50">
                <th className="px-8 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Description</th>
                <th className="px-8 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Type</th>
                <th className="px-8 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider text-right">Total</th>
                <th className="px-8 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-medium text-gray-600">{item.description}</td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${getTypeStyles(item.type)}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-800 text-right">${item.total.toFixed(2)}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-300 hover:text-gray-500 transition-colors"><Pencil size={18} /></button>
                      <button className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8">
          <button className="flex items-center gap-2 text-[#FF7A1F] font-bold text-sm hover:opacity-80 transition-opacity">
            <Plus size={18} />
            <span>Add New Line Item</span>
          </button>
        </div>
      </div>

      {/* Invoice Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
        <h3 className="text-lg font-bold text-gray-800">Invoice Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-gray-500">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="text-sm font-bold text-gray-800">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tax (8.5%)</span>
              <Info size={14} className="text-gray-300" />
            </div>
            <span className="text-sm font-bold text-gray-800">${tax.toFixed(2)}</span>
          </div>
          
          <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total Amount</span>
            <span className="text-3xl font-bold text-[#FF7A1F]">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-4">
        <button 
          onClick={() => {
            console.log('SEND RECEIPT button clicked');
            console.log('Navigating to: /dashboard/fixer/jobs/express-checkout');
            navigate('/dashboard/fixer/jobs/express-checkout');
          }}
          className="w-full bg-[#FF7A1F] hover:bg-[#E66D1C] text-white font-bold py-5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#FF7A1F]/20"
        >
          <Send size={20} />
          <span>SEND RECEIPT TO CUSTOMER</span>
        </button>
        <p className="text-center text-xs text-gray-400">
          By clicking send, the final receipt will be sent to the customer and funds will be released to your account.
        </p>
      </div>
    </div>
  );
}
