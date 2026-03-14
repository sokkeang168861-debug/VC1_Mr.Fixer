import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Trash2,
  Send,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ServiceEstimate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [items, setItems] = useState([
    { id: '1', name: 'Diagnostic Fee', price: 45.00 },
    { id: '2', name: 'Pipe Replacement', price: 120.00 }
  ]);
  const [message, setMessage] = useState('');

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', price: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handleSubmit = () => {
    // Logic for submitting proposal
    console.log('Submitting proposal for job', id, { items, message, total });
    alert('Proposal submitted successfully!');
    navigate('/dashboard/fixer/jobs');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header name="John Fixer" />

        <main className="flex-1 p-8 overflow-y-auto bg-[#f4f5f7]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-black text-[#1A1A1A]">Set Proposal</h1>
            </div>

            {/* Job Summary Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="p-3 bg-[#FFF5EB] text-[#FF7A00] rounded-xl">
                  <Wrench size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">Plumbing Issue</h2>
                  <p className="text-sm text-gray-400 font-medium">Request ID: {id || "#FIX-99201"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Requested On</p>
                <p className="text-sm font-bold text-[#1A1A1A]">Oct 24, 2023 • 10:30 AM</p>
              </div>
            </div>

            {/* Estimate Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-6">Service Estimate</p>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-end bg-[#F8F9FA] p-4 rounded-xl border border-gray-50">
                    <div className="flex-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2 block">Item Name</label>
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-100 focus:border-[#FF7A00] outline-none transition-all"
                        placeholder="e.g. Parts, Labor"
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2 block">Price ($)</label>
                      <input 
                        type="number" 
                        value={item.price || ''}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-right focus:ring-2 focus:ring-orange-100 focus:border-[#FF7A00] outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={addItem}
                className="flex items-center gap-2 text-[#FF7A00] font-bold text-sm hover:underline"
              >
                <Plus size={18} />
                Add another item
              </button>

              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center">
                <span className="text-lg font-bold text-[#1A1A1A]">Total Estimate</span>
                <span className="text-3xl font-black text-[#FF7A00]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Message Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-4">Message to Client</p>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the scope of work or add any special instructions..."
                className="w-full h-32 bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-orange-100 focus:border-[#FF7A00] outline-none transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-start">
              <button 
                onClick={handleSubmit}
                className="bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold px-10 py-4 rounded-xl transition-all shadow-lg shadow-orange-200 flex items-center gap-2"
              >
                <Send size={20} />
                Submit Proposal
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ServiceEstimate;