"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import {
  Plus,
  FileText,
  Settings,
  BarChart3,
  MoreVertical,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Copy,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Form {
  id: string;
  title: string;
  description: string;
  slug: string;
  fieldCount: number;
  version: number;
  createdAt: string;
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchForms();
    }
  }, [user]);

  const fetchForms = async () => {
    try {
      const res = await api.get("/forms");
      setForms(res.data);
    } catch (err) {
      console.error("Failed to fetch forms", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    document.getElementById("global-create-form-trigger")?.click();
  };

  return (
    <div className="max-w-6xl px-8 lg:px-12 py-12">
      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 mb-3">
            <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">
              My Forms
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium text-base">
            Create, manage, and track your forms in one place.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/dashboard/templates")}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-slate-300 hover:shadow-md transition-all"
          >
            Browse Templates
          </button>
          <button
            id="create-form-btn"
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create Form</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-slate-100 rounded-xl animate-pulse" />
                <div className="w-6 h-6 bg-slate-50 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-50 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-slate-50 rounded-lg animate-pulse" />
                <div className="h-16 bg-slate-50 rounded-lg animate-pulse" />
              </div>
              <div className="flex space-x-2">
                <div className="h-10 flex-1 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-10 flex-1 bg-slate-50 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl border border-slate-100">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6">
            <FileText className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            No Forms Yet
          </h3>
          <p className="text-slate-500 font-medium text-center max-w-sm mb-8">
            Get started by creating your first form or choose from our
            professional templates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={openCreateModal}
              className="px-8 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Create from Scratch
            </button>
            <button
              onClick={() => router.push("/dashboard/templates")}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:border-slate-300 hover:shadow-md transition-all"
            >
              Browse Templates
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onDelete={() => fetchForms()}
              onEdit={() => router.push(`/forms/${form.id}/edit`)}
              onViewInsights={() => router.push(`/forms/${form.id}/insights`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FormCard({
  form,
  onDelete,
  onEdit,
  onViewInsights,
}: {
  form: Form;
  onDelete: () => void;
  onEdit: () => void;
  onViewInsights: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/forms/${form.id}`);
      toast.success("Form deleted successfully");
      onDelete();
    } catch (err) {
      toast.error("Failed to delete form");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
          <FileText className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push(`/f/${form.slug}`);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Live Form</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigator.clipboard.writeText(
                        `${window.location.origin}/f/${form.slug}`,
                      );
                      toast.success("Link copied!");
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Form</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 mb-5">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-snug">
          {form.title}
        </h3>
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
          <Calendar className="w-3 h-3" />
          <span>
            {new Date(form.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <div className="text-lg font-black text-slate-900">
            {form.fieldCount}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Fields
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <div className="text-lg font-black text-slate-900">
            v{form.version}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Version
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onEdit}
          className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center space-x-1.5"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={onViewInsights}
          className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center space-x-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Insights</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Delete Form?
              </h2>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                This will permanently delete{" "}
                <span className="font-bold text-slate-900">"{form.title}"</span>{" "}
                and all its responses. This action cannot be undone.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all text-sm shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Forever"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
