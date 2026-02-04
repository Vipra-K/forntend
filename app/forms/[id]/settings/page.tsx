"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import {
  Settings2,
  Trash2,
  Save,
  Globe,
  Lock,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      const res = await api.get(`/forms/${id}`);
      setForm(res.data);
    } catch (err) {
      console.error("Failed to fetch form", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await api.patch(`/forms/${id}`, {
        title: form.title,
        description: form.description,
      });
      setMessage({
        type: "success",
        text: "Form settings synchronized successfully.",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Update failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/forms/${id}`);
      router.replace("/dashboard");
    } catch (err) {
      alert("Deletion failed");
    }
  };

  if (isLoading || !form) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <main className="p-8 lg:p-12">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Settings
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Manage form configuration and data visibility.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-10">
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`${message.type === "success" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"} border p-3 rounded-lg text-xs font-semibold flex items-center space-x-2`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* General Settings */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
                <FileText className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  General Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Form Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
                    placeholder="Enter title..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Description
                  </label>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 h-28 transition-all font-medium"
                    placeholder="Provide context for this form..."
                  />
                </div>
              </div>
            </section>

            {/* URL Settings */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
                <Globe className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Public Access
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Custom Link Slug
                </label>
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-xs font-mono text-slate-500">
                    /f/
                  </div>
                  <input
                    value={form.slug}
                    readOnly
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 ml-1">
                  Note: Changing this will invalidate existing links to this
                  form.
                </p>
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center space-x-2 disabled:opacity-50 shadow-sm"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isSaving ? "Updating..." : "Save Changes"}</span>
              </button>
            </div>

            {/* Danger Zone */}
            <section className="mt-16 pt-10 border-t border-slate-100">
              <div className="bg-red-50 border border-red-100 p-8 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide">
                      Delete Form
                    </h3>
                    <p className="text-xs text-red-500/80 font-medium">
                      Permanently remove this form and all its submissions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-white hover:bg-red-600 text-red-600 hover:text-white border border-red-200 p-2 rounded-lg transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 p-8 rounded-xl shadow-2xl text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold mb-2">Are you sure?</h2>
              <p className="text-slate-500 text-sm mb-8 font-medium">
                This action is irreversible. All form data will be permanently
                deleted.
              </p>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleDelete}
                  className="w-full py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Yes, delete form
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
