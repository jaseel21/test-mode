"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    Trash2,
    Plus,
    Bell,
    Mail,
    MessageSquare,
    FileText,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Copy,
    Check,
    Image,
    Edit
} from "lucide-react";

// Template types
const TEMPLATE_TYPES = [
    { id: "push", label: "Push Notification", icon: <Bell className="h-4 w-4 mr-2" /> },
    { id: "whatsapp", label: "WhatsApp Message", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
    { id: "email", label: "Email", icon: <Mail className="h-4 w-4 mr-2" /> },
];

interface Template {
    _id: string;
    name: string;
    type: string;
    subject?: string;
    title?: string;
    body: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export default function CreateTemplatePage() {
    // States
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [selectedType, setSelectedType] = useState("push");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [expandedTemplates, setExpandedTemplates] = useState<{ [key: string]: boolean }>({});

    // Form state
    const [form, setForm] = useState({
        name: "",
        type: "push",
        subject: "",
        title: "",
        body: "",
        imageUrl: ""
    });

    // Fetch templates on load
    useEffect(() => {
        fetchTemplates();
    }, []);

    // Fetch all templates
    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const response = await fetch('/api/notifications/templates', {
                headers: {
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch templates');
            }

            const data = await response.json();
            setTemplates(data.templates);
        } catch (error) {
            console.error('Error fetching templates:', error);
            setErrorMessage('Failed to load templates. Please try again.');
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle type selection
    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setForm(prev => ({ ...prev, type }));
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: "",
            type: "push",
            subject: "",
            title: "",
            body: "",
            imageUrl: ""
        });
        setSelectedType("push");
        setActiveTemplate(null);
    };

    // Create new template
    const handleCreateNew = () => {
        resetForm();
        setShowTemplateForm(true);
        setErrorMessage("");
        setSuccessMessage("");
    };

    // Edit existing template
    const handleEditTemplate = (template: Template) => {
        setForm({
            name: template.name,
            type: template.type,
            subject: template.subject || "",
            title: template.title || "",
            body: template.body,
            imageUrl: template.imageUrl || ""
        });
        setSelectedType(template.type);
        setActiveTemplate(template);
        setShowTemplateForm(true);
        setErrorMessage("");
        setSuccessMessage("");
    };

    // Confirm template deletion
    const confirmDeleteTemplate = (template: Template) => {
        setTemplateToDelete(template);
        setShowDeleteConfirm(true);
    };

    // Delete template
    const handleDeleteTemplate = async () => {
        if (!templateToDelete) return;

        try {
            const response = await fetch(`/api/notifications/templates/${templateToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete template');
            }

            // Remove from list and close modal
            setTemplates(templates.filter(t => t._id !== templateToDelete._id));
            setShowDeleteConfirm(false);
            setTemplateToDelete(null);
            setSuccessMessage("Template deleted successfully!");

            // If editing the deleted template, reset the form
            if (activeTemplate && activeTemplate._id === templateToDelete._id) {
                resetForm();
                setShowTemplateForm(false);
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            setErrorMessage('Failed to delete template. Please try again.');
        }
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setIsSubmitting(true);

        try {
            // Validate form
            if (!form.name.trim()) {
                throw new Error('Template name is required');
            }

            if (!form.body.trim()) {
                throw new Error('Template body is required');
            }

            if (form.type === 'email' && !form.subject?.trim()) {
                throw new Error('Email subject is required');
            }

            if (form.type === 'push' && !form.title?.trim()) {
                throw new Error('Notification title is required');
            }

            const endpoint = activeTemplate
                ? `/api/notifications/templates/${activeTemplate._id}`
                : '/api/notifications/templates';

            const method = activeTemplate ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save template');
            }

            const data = await response.json();

            if (activeTemplate) {
                // Update template in the list
                setTemplates(templates.map(t =>
                    t._id === activeTemplate._id ? data.template : t
                ));
                setSuccessMessage("Template updated successfully!");
            } else {
                // Add new template to the list
                setTemplates([...templates, data.template]);
                setSuccessMessage("Template created successfully!");
            }

            // Reset form after save
            resetForm();
            setShowTemplateForm(false);
        } catch (error) {
            console.error('Error saving template:', error);
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Copy template to clipboard
    const copyTemplate = (template: Template) => {
        let textToCopy = '';

        if (template.type === 'push') {
            textToCopy = `Title: ${template.title}\nBody: ${template.body}`;
        } else if (template.type === 'email') {
            textToCopy = `Subject: ${template.subject}\nBody: ${template.body}`;
        } else if (template.type === 'whatsapp') {
            textToCopy = template.body;
        }

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy template:', err);
            });
    };

    // Toggle template expanded view
    const toggleTemplateExpanded = (id: string) => {
        setExpandedTemplates(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Get template type label
    const getTemplateTypeLabel = (type: string) => {
        const templateType = TEMPLATE_TYPES.find(t => t.id === type);
        return templateType ? templateType.label : type;
    };

    // Render empty state
    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6">
                <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No templates found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create your first notification template to get started
            </p>
            <button
                onClick={handleCreateNew}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center"
            >
                <Plus className="h-4 w-4 mr-2" /> Create Template
            </button>
        </div>
    );

    // Get template card classes based on type
    const getTemplateCardClasses = (type: string) => {
        const baseClasses = "p-4 rounded-xl border relative transition-all hover:shadow-md";

        switch (type) {
            case 'push':
                return `${baseClasses} bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30`;
            case 'whatsapp':
                return `${baseClasses} bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30`;
            case 'email':
                return `${baseClasses} bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30`;
            default:
                return `${baseClasses} bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700`;
        }
    };

    // Get template icon based on type
    const getTemplateIcon = (type: string) => {
        switch (type) {
            case 'push':
                return <Bell className="h-4 w-4 text-purple-500 dark:text-purple-400" />;
            case 'whatsapp':
                return <MessageSquare className="h-4 w-4 text-green-500 dark:text-green-400" />;
            case 'email':
                return <Mail className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Notification Templates</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Create and manage templates for different notification channels
                    </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleCreateNew}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" /> New Template
                    </button>
                    <button
                        onClick={fetchTemplates}
                        className="px-3 py-2 bg-white/10 text-black dark:text-white backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoadingTemplates ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        href="/admin/notifications/send-notifications"
                        className="px-4 py-2 bg-white/10 text-black dark:text-white backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Link>
                </div>
            </div>

            {/* Success and error messages */}
            {errorMessage && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {successMessage}
                </div>
            )}

            {/* Main content */}
            <div className="grid grid-cols-1 gap-6">
                {/* Template form */}
                {showTemplateForm && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            {activeTemplate ? "Edit Template" : "Create New Template"}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Template name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Template Name*
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Give your template a name"
                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                                />
                            </div>

                            {/* Template type selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Template Type*
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {TEMPLATE_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => handleTypeChange(type.id)}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${selectedType === type.id
                                                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400"
                                                    : "bg-white/10 border-gray-200 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                {type.icon}
                                                <span>{type.label}</span>
                                            </div>
                                            {selectedType === type.id && (
                                                <div className="h-5 w-5 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic fields based on template type */}
                            <div className="space-y-4">
                                {selectedType === "email" && (
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email Subject*
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={form.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="Subject line for your email"
                                            className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                                        />
                                    </div>
                                )}

                                {selectedType === "push" && (
                                    <>
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Notification Title*
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={form.title}
                                                onChange={handleChange}
                                                required
                                                placeholder="Title of your push notification"
                                                className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Image URL (Optional)
                                            </label>
                                            <div className="flex">
                                                <input
                                                    type="text"
                                                    id="imageUrl"
                                                    name="imageUrl"
                                                    value={form.imageUrl}
                                                    onChange={handleChange}
                                                    placeholder="URL for notification image"
                                                    className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {selectedType === "email" ? "Email Body*" : selectedType === "whatsapp" ? "Message Text*" : "Notification Body*"}
                                    </label>
                                    <textarea
                                        id="body"
                                        name="body"
                                        rows={6}
                                        value={form.body}
                                        onChange={handleChange}
                                        required
                                        placeholder={
                                            selectedType === "email"
                                                ? "Content of your email. HTML is supported."
                                                : selectedType === "whatsapp"
                                                    ? "Your WhatsApp message content. You can use {name}, {id}, etc. as placeholders."
                                                    : "Content of your push notification"
                                        }
                                        className="px-3 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border dark:border-white/20 border-gray-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                                    />
                                </div>

                                {selectedType === "whatsapp" && (
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                                        <p className="font-medium mb-1">Available Placeholders:</p>
                                        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            <li><code>{"{name}"}</code> - Recipient&apos;s name</li>
                                            <li><code>{"{amount}"}</code> - Donation amount</li>
                                            <li><code>{"{date}"}</code> - Current date</li>
                                            <li><code>{"{id}"}</code> - Donation/Transaction ID</li>
                                            <li><code>{"{type}"}</code> - Donation type</li>
                                            <li><code>{"{org}"}</code> - Organization name</li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Form actions */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTemplateForm(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${isSubmitting
                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                            : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            {activeTemplate ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {activeTemplate ? "Update Template" : "Save Template"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Templates list */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Your Templates
                    </h3>

                    {/* Loading state */}
                    {isLoadingTemplates && (
                        <div className="flex justify-center items-center py-12">
                            <div className="relative w-12 h-12">
                                <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                                <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoadingTemplates && templates.length === 0 && renderEmptyState()}

                    {/* Templates grid */}
                    {!isLoadingTemplates && templates.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <div key={template._id} className={getTemplateCardClasses(template.type)}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center">
                                            {getTemplateIcon(template.type)}
                                            <span className="text-xs font-medium ml-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300">
                                                {getTemplateTypeLabel(template.type)}
                                            </span>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => copyTemplate(template)}
                                                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                                                title="Copy template"
                                            >
                                                {copySuccess ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => toggleTemplateExpanded(template._id)}
                                                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                                                title={expandedTemplates[template._id] ? "Collapse" : "Expand"}
                                            >
                                                {expandedTemplates[template._id] ? (
                                                    <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="font-medium text-gray-800 dark:text-white mb-2 line-clamp-1">
                                        {template.name}
                                    </h4>

                                    {template.type === 'push' && template.title && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 line-clamp-1">
                                            <span className="font-medium">Title:</span> {template.title}
                                        </p>
                                    )}

                                    {template.type === 'email' && template.subject && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 line-clamp-1">
                                            <span className="font-medium">Subject:</span> {template.subject}
                                        </p>
                                    )}

                                    <div className={`overflow-hidden transition-all ${expandedTemplates[template._id] ? '' : 'max-h-20'}`}>
                                        <p className={`text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line ${expandedTemplates[template._id] ? '' : 'line-clamp-3'}`}>
                                            {template.body}
                                        </p>
                                    </div>

                                    {template.type === 'push' && template.imageUrl && (
                                        <div className="mt-2 flex items-center">
                                            <Image className="h-4 w-4 text-gray-400 mr-1"
                                            aria-label="no image"
                                             />
                                            
                                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{template.imageUrl}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/30">
                                        <div className="text-xs text-gray-400">
                                            Updated: {new Date(template.updatedAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditTemplate(template)}
                                                className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                                                title="Edit template"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => confirmDeleteTemplate(template)}
                                                className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                                                title="Delete template"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && templateToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>

                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Are you sure you want to delete the template <span className="font-semibold">{templateToDelete.name}</span>?
                            <br /><br />
                            <span className="text-red-600 dark:text-red-400 text-sm">This action cannot be undone.</span>
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setTemplateToDelete(null);
                                }}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTemplate}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-300 flex items-center"
                            >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}