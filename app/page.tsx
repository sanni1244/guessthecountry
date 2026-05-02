// app/people/tables/performance.tsx
"use client";

import React, { useState } from "react";
import { Plus, X, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminReviews, useCreateAdminReview, useUpdateAdminReviewStatus } from "@/hooks/index";

const getErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.message)) return data.message.join(', ');
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
};

export default function PerformanceTable({ isDarkMode, companyId }: { isDarkMode: boolean, companyId: string }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: reviewsData, isLoading } = useAdminReviews(companyId);
  const updateStatusMutation = useUpdateAdminReviewStatus(companyId);

  const reviewsList = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.items || []);

  const handleUpdateStatus = async (reviewId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ reviewId, status: newStatus });
      toast.success("Review status updated successfully.");
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to update status."));
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') return 'bg-blue-50 text-blue-600 border-blue-200';
    if (status === 'completed') return 'bg-slate-100 text-slate-600 border-slate-200';
    return 'bg-gray-50 text-gray-500 border-gray-200';
  };

  if (!companyId) {
    return (
      <div className={`w-full rounded-sm border shadow-sm p-12 flex justify-center ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200'}`}>
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`w-full rounded-sm border shadow-sm overflow-hidden ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-200'}`}>
      <div className="p-6">
        <div className="mb-8 border-b pb-6 dark:border-neutral-800 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold mb-2 uppercase tracking-wider text-slate-800 dark:text-gray-100">Company Review Cycles</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage performance review cycles, criteria, and company-wide settings.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition"
          >
            <Plus size={16} />
            Create Review Cycle
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className={`border-b ${isDarkMode ? 'border-neutral-800 text-neutral-400' : 'border-gray-200 text-gray-500'}`}>
                <tr>
                  <th className="pb-3 font-medium">Cycle Name</th>
                  <th className="pb-3 font-medium">Year</th>
                  <th className="pb-3 font-medium">Deadline</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-neutral-800' : 'divide-gray-100'}`}>
                {reviewsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No review cycles found.</td>
                  </tr>
                ) : (
                  reviewsList.map((rev: any) => (
                    <tr key={rev.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition">
                      <td className="py-4 font-medium dark:text-gray-200">{rev.title}</td>
                      <td className="py-4 text-gray-500">{rev.year}</td>
                      <td className="py-4 text-gray-500">{new Date(rev.deadline).toLocaleDateString()}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-medium rounded-sm border capitalize ${getStatusBadge(rev.status)}`}>
                          {rev.status}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        {rev.status === 'draft' && (
                          <button 
                            onClick={() => handleUpdateStatus(rev.id, 'active')}
                            disabled={updateStatusMutation.isPending}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium text-xs border border-blue-200 dark:border-blue-900 px-3 py-1.5 rounded-sm disabled:opacity-50 transition-colors"
                          >
                            Launch Cycle
                          </button>
                        )}
                        {rev.status === 'active' && (
                          <button 
                            onClick={() => handleUpdateStatus(rev.id, 'completed')}
                            disabled={updateStatusMutation.isPending}
                            className="text-slate-600 hover:text-slate-800 dark:text-slate-400 font-medium text-xs border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-sm disabled:opacity-50 transition-colors"
                          >
                            Close Cycle
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateReviewModal 
          companyId={companyId} 
          isDarkMode={isDarkMode} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}
    </div>
  );
}

function CreateReviewModal({ companyId, isDarkMode, onClose }: { companyId: string, isDarkMode: boolean, onClose: () => void }) {
  const createMutation = useCreateAdminReview(companyId);
  
  const [formData, setFormData] = useState({
    title: `Annual Performance Review ${new Date().getFullYear()}`,
    year: new Date().getFullYear(),
    deadline: "",
    instructions: "Be specific and cite concrete examples wherever possible.",
    criteria: [
      {
        title: "Role Delivery & Execution",
        description: "Delivers on role responsibilities effectively and consistently meets or exceeds expectations.",
        weight: 1.0,
        questions: [
          { text: "1. Consistently meets core responsibilities?", type: "radio", options: ["Exceptional", "Strong", "Solid", "Developing", "Weak"], isRequired: true },
          { text: "2. How effectively does this person communicate?", type: "radio", options: ["Exceptional", "Strong", "Solid", "Developing", "Weak"], isRequired: true },
          { text: "3. What are this person's key strengths?", type: "text", options: [], isRequired: true },
          { text: "4. What is one area where they could improve?", type: "text", options: [], isRequired: true },
          { text: "5. Do they take initiative without being asked?", type: "yes_no", options: [], isRequired: true },
          { text: "6. Which company values do they demonstrate?", type: "multi_select", options: ["Integrity", "Excellence", "Teamwork", "Innovation"], isRequired: false },
          { text: "7. How well do they handle critical feedback?", type: "radio", options: ["Very Well", "Well", "Neutral", "Poorly"], isRequired: true },
          { text: "8. Describe a project they delivered successfully.", type: "text", options: [], isRequired: false },
          { text: "9. How effectively do they manage their time?", type: "radio", options: ["Exceptional", "Strong", "Solid", "Developing", "Weak"], isRequired: true },
          { text: "10. Are they ready for the next level?", type: "radio", options: ["Ready Now", "In 6 Months", "Needs Development"], isRequired: true }
        ]
      }
    ]
  });

  const handleAddCriteria = () => {
    setFormData(prev => ({
      ...prev,
      criteria: [
        ...prev.criteria,
        {
          title: "",
          description: "",
          weight: 0,
          questions: [
            { text: "", type: "radio", options: ["Exceptional", "Strong", "Solid", "Developing", "Weak"], isRequired: true }
          ]
        }
      ]
    }));
  };

  const handleRemoveCriteria = (index: number) => {
    setFormData(prev => {
      const newCriteria = [...prev.criteria];
      newCriteria.splice(index, 1);
      return { ...prev, criteria: newCriteria };
    });
  };

  const handleCriteriaChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newCriteria = [...prev.criteria];
      newCriteria[index] = { ...newCriteria[index], [field]: value };
      return { ...prev, criteria: newCriteria };
    });
  };

  const handleAddQuestion = (criteriaIndex: number) => {
    setFormData(prev => {
      const newCriteria = [...prev.criteria];
      newCriteria[criteriaIndex].questions.push({
        text: "",
        type: "text",
        options: [],
        isRequired: true
      });
      return { ...prev, criteria: newCriteria };
    });
  };

  const handleRemoveQuestion = (criteriaIndex: number, questionIndex: number) => {
    setFormData(prev => {
      const newCriteria = [...prev.criteria];
      newCriteria[criteriaIndex].questions.splice(questionIndex, 1);
      return { ...prev, criteria: newCriteria };
    });
  };

  const handleQuestionChange = (criteriaIndex: number, questionIndex: number, field: string, value: any) => {
    setFormData(prev => {
      const newCriteria = [...prev.criteria];
      newCriteria[criteriaIndex].questions[questionIndex] = { 
        ...newCriteria[criteriaIndex].questions[questionIndex], 
        [field]: value 
      };
      return { ...prev, criteria: newCriteria };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalWeight = formData.criteria.reduce((sum, c) => sum + Number(c.weight), 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      toast.error(`Total criteria weight must equal 1.0. Current total is ${totalWeight.toFixed(2)}`);
      return;
    }

    try {
      const payload = {
        ...formData,
        criteria: formData.criteria.map((c, i) => ({
          ...c,
          weight: Number(c.weight),
          orderIndex: i,
          questions: c.questions.map((q, qi) => ({
            ...q,
            orderIndex: qi
          }))
        }))
      };

      await createMutation.mutateAsync(payload);
      toast.success("Review cycle created successfully.");
      onClose();
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to create review cycle."));
    }
  };

  const inputClass = `w-full p-2.5 text-sm rounded-sm outline-none border focus:border-blue-500 ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-200'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-sm shadow-xl ${isDarkMode ? 'bg-neutral-900' : 'bg-white'}`}>
        <div className="p-6 border-b flex justify-between items-center dark:border-neutral-800">
          <h3 className="text-xl font-bold dark:text-white">Create Review Cycle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-gray-200">General Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Cycle Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Year</label>
                <input 
                  required
                  type="number" 
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Submission Deadline</label>
                <input 
                  required
                  type="date" 
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Global Instructions</label>
                <input 
                  type="text" 
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-gray-200">Evaluation Criteria & Questions</h4>
              <button 
                type="button"
                onClick={handleAddCriteria}
                className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Criteria
              </button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-sm dark:bg-blue-900/10 dark:border-blue-900/50 flex items-start gap-3">
              <AlertCircle size={16} className="text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                All criteria weights must sum up to exactly 1.0 (100%). Current sum: 
                <strong className={Math.abs(formData.criteria.reduce((sum, c) => sum + Number(c.weight), 0) - 1.0) > 0.01 ? "text-red-500" : ""}> {formData.criteria.reduce((sum, c) => sum + Number(c.weight), 0).toFixed(2)}</strong>
              </p>
            </div>

            <div className="space-y-8">
              {formData.criteria.map((criteria, cIndex) => (
                <div key={cIndex} className="p-5 border rounded-sm border-gray-200 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-800/20">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-semibold text-slate-800 dark:text-gray-200">Criteria {cIndex + 1}</h5>
                    {formData.criteria.length > 1 && (
                      <button type="button" onClick={() => handleRemoveCriteria(cIndex)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
                      <input 
                        required
                        type="text" 
                        value={criteria.title}
                        onChange={(e) => handleCriteriaChange(cIndex, 'title', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Weight (e.g. 0.3)</label>
                      <input 
                        required
                        type="number" 
                        step="0.05"
                        min="0"
                        max="1"
                        value={criteria.weight}
                        onChange={(e) => handleCriteriaChange(cIndex, 'weight', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                    <textarea 
                      required
                      value={criteria.description}
                      onChange={(e) => handleCriteriaChange(cIndex, 'description', e.target.value)}
                      className={inputClass}
                      rows={2}
                    />
                  </div>

                  <div className="pl-4 border-l-2 border-gray-200 dark:border-neutral-700 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h6 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Questions</h6>
                      <button 
                        type="button"
                        onClick={() => handleAddQuestion(cIndex)}
                        className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Question
                      </button>
                    </div>

                    {criteria.questions.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-sm">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Question Text</label>
                            <input 
                              required
                              type="text" 
                              value={q.text}
                              onChange={(e) => handleQuestionChange(cIndex, qIndex, 'text', e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div className="w-40">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
                            <select 
                              value={q.type}
                              onChange={(e) => handleQuestionChange(cIndex, qIndex, 'type', e.target.value)}
                              className={inputClass}
                            >
                              <option value="text">Text</option>
                              <option value="radio">Radio (Single)</option>
                              <option value="multi_select">Multi Select</option>
                              <option value="yes_no">Yes / No</option>
                            </select>
                          </div>
                          <button type="button" onClick={() => handleRemoveQuestion(cIndex, qIndex)} className="mt-6 text-gray-400 hover:text-red-500 transition-colors">
                            <X size={18} />
                          </button>
                        </div>

                        {(q.type === 'radio' || q.type === 'multi_select') && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Options (Comma separated)</label>
                            <input 
                              required
                              type="text" 
                              value={q.options.join(', ')}
                              onChange={(e) => handleQuestionChange(cIndex, qIndex, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                              placeholder="Exceptional, Strong, Solid, Developing, Weak"
                              className={inputClass}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t dark:border-neutral-800 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-sm hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Create Review Cycle
          </button>
        </div>
      </div>
    </div>
  );
}
