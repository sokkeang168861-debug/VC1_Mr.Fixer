import React from 'react';
import { Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import httpClient from '../../../api/httpClient';

export default function CategoryTable({ categories, loading, error, onEdit, fetchCategories }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await httpClient.delete(`/admin/deleteCategory/${id}`);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading categories...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl font-medium">{error}</div>;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-50">
            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
            <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {categories.map((category) => (
            <tr key={category.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden">
                    {category.imageUrl ? (
                      <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={20} />
                    )}
                  </div>
                  <span className="font-bold text-slate-700">{category.name}</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <p className="text-slate-500 text-sm max-w-md leading-relaxed">{category.description}</p>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button onClick={() => onEdit(category)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}