import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  Plus,
  Send,
  Info,
  FileText,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import httpClient from '@/api/httpClient';
import useActiveFixerBooking from '@/pages/fixer/hooks/useActiveFixerBooking';
import { getFixerJobOverview } from '@/pages/fixer/lib/jobOverview';

const LINE_ITEM_TYPES = ['Labor', 'Parts', 'Materials'];

function createLineItem(overrides = {}) {
  return {
    id:
      overrides.id ||
      `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    description: overrides.description || '',
    type: overrides.type || 'Labor',
    total: Number(overrides.total || 0),
  };
}

function createDraftItem(item) {
  return {
    ...item,
    total: Number(item.total || 0).toFixed(2),
  };
}

function buildInitialItems(job) {
  const receiptItems = Array.isArray(job?.receipt_items) ? job.receipt_items : [];

  if (receiptItems.length > 0) {
    return receiptItems.map((item, index) =>
      createLineItem({
        id: String(item.id || index + 1),
        description: item.description || item.name || `Line Item ${index + 1}`,
        type: item.type || 'Labor',
        total: item.total ?? item.price ?? 0,
      })
    );
  }

  return [];
}

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { bookingId, job, loading, error } = useActiveFixerBooking();
  const jobOverview = useMemo(
    () => getFixerJobOverview(job, bookingId),
    [bookingId, job]
  );
  const initialItems = useMemo(() => buildInitialItems(job), [job]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#FF7A1F]" size={36} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-sm font-semibold text-rose-700">
          {error || 'Unable to load active booking.'}
        </p>
      </div>
    );
  }

  return (
    <CreateInvoiceEditor
      key={String(bookingId || 'invoice')}
      bookingId={bookingId}
      job={job}
      jobOverview={jobOverview}
      initialItems={initialItems}
      navigate={navigate}
    />
  );
}

function CreateInvoiceEditor({ bookingId, job, jobOverview, initialItems, navigate }) {
  const [items, setItems] = useState(() => initialItems);
  const [editingItemId, setEditingItemId] = useState(null);
  const [draftItem, setDraftItem] = useState(() => createDraftItem(createLineItem()));
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [lineItemError, setLineItemError] = useState('');
  const [submittingReceipt, setSubmittingReceipt] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.1;
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

  const startEditingItem = (item) => {
    setEditingItemId(item.id);
    setDraftItem(createDraftItem(item));
    setIsCreatingItem(false);
    setLineItemError('');
  };

  const updateDraftItem = (field, value) => {
    setDraftItem((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addLineItem = () => {
    if (editingItemId) {
      return;
    }

    const newItem = createLineItem();
    setItems((current) => [...current, newItem]);
    setEditingItemId(newItem.id);
    setDraftItem(createDraftItem(newItem));
    setIsCreatingItem(true);
    setLineItemError('');
  };

  const cancelEditing = () => {
    if (isCreatingItem) {
      setItems((current) => current.filter((item) => item.id !== editingItemId));
    }

    setEditingItemId(null);
    setDraftItem(createDraftItem(createLineItem()));
    setIsCreatingItem(false);
    setLineItemError('');
  };

  const saveLineItem = () => {
    const description = draftItem.description.trim();
    const total = Number(draftItem.total);

    if (!description) {
      setLineItemError('Add a description before saving this line item.');
      return;
    }

    if (!Number.isFinite(total) || total < 0) {
      setLineItemError('Enter a valid total amount greater than or equal to 0.');
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === editingItemId
          ? {
              ...item,
              description,
              type: draftItem.type,
              total,
            }
          : item
      )
    );
    setEditingItemId(null);
    setDraftItem(createDraftItem(createLineItem()));
    setIsCreatingItem(false);
    setLineItemError('');
  };

  const deleteLineItem = (itemId) => {
    setItems((current) => current.filter((item) => item.id !== itemId));

    if (editingItemId === itemId) {
      setEditingItemId(null);
      setDraftItem(createDraftItem(createLineItem()));
      setIsCreatingItem(false);
      setLineItemError('');
    }
  };

  const handleSendReceipt = async () => {
    if (!bookingId || submittingReceipt) {
      return;
    }

    if (editingItemId) {
      window.alert('Please save or cancel the line item you are editing first.');
      return;
    }

    if (items.length === 0) {
      window.alert('Add at least one line item before sending the receipt.');
      return;
    }

    const receiptItems = items.map((item) => ({
      name: item.description.trim(),
      price: Number(item.total),
    }));

    const roundedTax = Number(tax.toFixed(2));
    if (roundedTax > 0) {
      receiptItems.push({
        name: `Tax (${(taxRate * 100).toFixed(1)}%)`,
        price: roundedTax,
      });
    }

    try {
      setSubmittingReceipt(true);
      await httpClient.post(`/fixer/provider/requests/${bookingId}/complete`, {
        items: receiptItems,
        total: Number(totalAmount.toFixed(2)),
      });

      navigate('/dashboard/fixer/jobs/express-checkout', {
        state: { bookingId },
      });
    } catch (error) {
      console.error(error);
      window.alert(
        error?.response?.data?.message ||
          'Failed to save the receipt and complete this booking.'
      );
    } finally {
      setSubmittingReceipt(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Invoice</h1>
        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
          <FileText size={16} />
          <span>Job Reference #{jobOverview?.booking_reference || bookingId}</span>
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
            <h2 className="text-xl font-bold text-gray-800">
              {jobOverview?.category || 'Service Request'}
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              Service for <span className="text-gray-600">{job.customer_name || 'Customer User'}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-12">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-300 tracking-wider mb-1">Issue Reported</p>
            <p className="text-sm font-bold text-gray-700">
              {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-300 tracking-wider mb-1">Location</p>
            <p className="text-sm font-bold text-gray-700">
              {job.service_address || 'No address available'}
            </p>
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
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-10 text-center text-sm font-medium text-gray-400">
                    No line items yet. Add one to start building the invoice.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isEditing = editingItemId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6">
                        {isEditing ? (
                          <div>
                            <input
                              type="text"
                              value={draftItem.description}
                              onChange={(event) => updateDraftItem('description', event.target.value)}
                              placeholder="Describe the work or material"
                              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-[#FF7A1F] focus:ring-2 focus:ring-orange-100"
                            />
                            {lineItemError ? (
                              <p className="mt-2 text-xs font-medium text-red-500">{lineItemError}</p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-600">{item.description}</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {isEditing ? (
                          <select
                            value={draftItem.type}
                            onChange={(event) => updateDraftItem('type', event.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition-all focus:border-[#FF7A1F] focus:ring-2 focus:ring-orange-100"
                          >
                            {LINE_ITEM_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${getTypeStyles(item.type)}`}>
                            {item.type}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 focus-within:border-[#FF7A1F] focus-within:ring-2 focus-within:ring-orange-100">
                            <span className="text-sm font-bold text-gray-400">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={draftItem.total}
                              onChange={(event) => updateDraftItem('total', event.target.value)}
                              className="w-24 py-2.5 text-right text-sm font-bold text-gray-800 outline-none"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-gray-800">${item.total.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={saveLineItem}
                                className="p-2 text-emerald-500 transition-colors hover:text-emerald-600"
                                aria-label="Save line item"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="p-2 text-gray-300 transition-colors hover:text-gray-500"
                                aria-label="Cancel editing"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditingItem(item)}
                                disabled={Boolean(editingItemId)}
                                className="p-2 text-gray-300 transition-colors hover:text-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Edit line item"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteLineItem(item.id)}
                                disabled={Boolean(editingItemId)}
                                className="p-2 text-gray-300 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Delete line item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8">
          <button
            type="button"
            onClick={addLineItem}
            disabled={Boolean(editingItemId)}
            className="flex items-center gap-2 text-[#FF7A1F] font-bold text-sm transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
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
              <span className="text-sm font-medium">Tax ({(taxRate * 100).toFixed(0)}%)</span>
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
          type="button"
          onClick={handleSendReceipt}
          disabled={submittingReceipt || Boolean(editingItemId)}
          className="w-full bg-[#FF7A1F] hover:bg-[#E66D1C] text-white font-bold py-5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#FF7A1F]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submittingReceipt ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          <span>{submittingReceipt ? 'SAVING RECEIPT...' : 'SEND RECEIPT TO CUSTOMER'}</span>
        </button>
        <p className="text-center text-xs text-gray-400">
          By clicking send, the final receipt will be sent to the customer and funds will be released to your account.
        </p>
      </div>
    </div>
  );
}
