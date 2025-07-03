"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Folder,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { useStatusStore } from "@/store/statusStore";
import { StatusCategory } from "@/lib/types";

export default function CategoriesPage() {
  // Get categories from store
  const { categories, fetchCategories, error } = useStatusStore();
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  
  // Form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      await fetchCategories();
      setIsLoading(false);
    };
    
    loadCategories();
  }, [fetchCategories]);
  
  // Reset form state
  const resetForm = () => {
    setNewCategoryName("");
    setNewDescription("");
    setNewIsActive(true);
    setFormError("");
    setShowAddForm(false);
    setEditingCategory(null);
    setEditName("");
    setEditDescription("");
    setEditIsActive(true);
  };
  
  // Handle Add Category form submission
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setFormError("Category name is required");
      return;
    }
    
    setIsSubmitting(true);
    setFormError("");
    
    try {
      const response = await fetch("/api/statuses/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newDescription.trim(),
          isActive: newIsActive,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to create category");
      }
      
      // Refresh categories
      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error("Error creating category:", error);
      setFormError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle Edit Category
  const startEditing = (category: StatusCategory) => {
    setEditingCategory(category._id);
    setEditName(category.name);
    setEditDescription(category.description || "");
    setEditIsActive(category.isActive);
  };
  
  // Handle Update Category
  const handleUpdateCategory = async (e: React.FormEvent, categoryId: string) => {
    e.preventDefault();
    
    if (!editName.trim()) {
      setFormError("Category name is required");
      return;
    }
    
    setIsSubmitting(true);
    setFormError("");
    
    try {
      const response = await fetch(`/api/statuses/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
          isActive: editIsActive,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to update category");
      }
      
      // Refresh categories
      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error("Error updating category:", error);
      setFormError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Start delete process
  const startDeleting = (category: StatusCategory) => {
    setDeletingCategory(category._id);
    setDeleteConfirmText("");
    setDeleteError("");
  };
  
  // Handle delete confirmation
  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (deleteConfirmText !== categoryName) {
      setDeleteError("Please type the category name correctly to confirm deletion");
      return;
    }
    
    setIsDeleting(true);
    setDeleteError("");
    
    try {
      const response = await fetch(`/api/statuses/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to delete category");
      }
      
      // Refresh categories
      await fetchCategories();
      setDeletingCategory(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      setDeleteError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
            Status Categories
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage categories for organizing social statuses
          </p>
        </div>

        <div className="flex gap-2">
          <Link 
            href="/admin/social-status" 
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Link>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </button>
        </div>
      </div>
      
      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Add New Category
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleAddCategory}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name*
                </label>
                <input
                  type="text"
                  id="name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Motivational, Funny, Business"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe this category..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Active Category
                </label>
              </div>
              
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-md p-3 text-sm text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Category
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-300 dark:border-red-900/50 shadow-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error Loading Categories</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchCategories()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </button>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && !error && categories.length === 0 && !showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-8 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Folder className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No Categories Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            You haven&apos;t created any categories yet. Categories help organize your statuses for easier discovery.
          </p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> Create First Category
          </button>
        </div>
      )}
      
      {/* Categories List */}
      {!isLoading && !error && categories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
              Available Categories
            </h3>
            <button
              onClick={() => fetchCategories()}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((category) => (
              <div key={category._id} className="p-4">
                {editingCategory === category._id ? (
                  <form onSubmit={(e) => handleUpdateCategory(e, category._id)}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor={`edit-name-${category._id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category Name*
                        </label>
                        <input
                          type="text"
                          id={`edit-name-${category._id}`}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`edit-description-${category._id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          id={`edit-description-${category._id}`}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-isActive-${category._id}`}
                          checked={editIsActive}
                          onChange={(e) => setEditIsActive(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`edit-isActive-${category._id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Active Category
                        </label>
                      </div>
                      
                      {formError && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-md p-3 text-sm text-red-600 dark:text-red-400">
                          {formError}
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3 mr-1.5" />
                              Update
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : deletingCategory === category._id ? (
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-900/30">
                    <h4 className="text-base font-medium text-red-800 dark:text-red-300 mb-2 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Confirm Deletion
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                      Are you sure you want to delete the category <strong>&quot;{category.name}&quot;</strong>? This action cannot be undone.
                    </p>
                    
                    {category.count && category.count > 0 && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md mb-4 text-sm text-red-700 dark:text-red-400">
                        <strong>Warning:</strong> This category is currently used by {category.count} status{category.count !== 1 ? 'es' : ''}. Deleting it may affect these statuses.
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type <span className="font-semibold">{category.name}</span> to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-md focus:ring-red-500 focus:border-red-500"
                        placeholder={`Type "${category.name}" to confirm`}
                      />
                    </div>
                    
                    {deleteError && (
                      <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
                        {deleteError}
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(null)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category._id, category.name)}
                        disabled={deleteConfirmText !== category.name || isDeleting}
                        className={`px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 flex items-center ${
                          deleteConfirmText !== category.name || isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3 w-3 mr-1.5" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <Folder className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <h4 className="text-base font-medium text-gray-800 dark:text-white flex items-center">
                          {category.name}
                          {!category.isActive && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                              Inactive
                            </span>
                          )}
                        </h4>
                        {category.count !== undefined && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                            {category.count} {category.count === 1 ? 'status' : 'statuses'}
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {category.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-shrink-0 space-x-2">
                      <button
                        onClick={() => startEditing(category)}
                        className="px-2.5 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-md text-sm flex items-center hover:bg-blue-200 dark:hover:bg-blue-800/40"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => startDeleting(category)}
                        className="px-2.5 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md text-sm flex items-center hover:bg-red-200 dark:hover:bg-red-800/40"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}