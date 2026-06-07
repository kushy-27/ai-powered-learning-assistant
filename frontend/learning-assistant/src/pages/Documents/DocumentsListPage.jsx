import React, { useEffect, useState } from "react";
import { Plus, Upload, FileText, X } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import DocumentCard from "../../components/documents/DocumentCard";

const DocumentsListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();

      const actualData = data?.data?.data ?? data?.data ?? data;

      setDocuments(Array.isArray(actualData) ? actualData : []);
    } catch (error) {
      toast.error("Failed to fetch documents.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle.trim()) {
      toast.error("Please provide a title and select a file");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);

      toast.success("Document uploaded successfully!");

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");

      setLoading(true);
      await fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);

    try {
      await documentService.deleteDocument(selectedDoc._id);

      toast.success(`${selectedDoc.title} deleted.`);

      setDocuments((prevDocs) =>
        prevDocs.filter((d) => d._id !== selectedDoc._id)
      );

      setSelectedDoc(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-\[400px\]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6">
              <FileText
                className="w-10 h-10 text-slate-400"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="text-xl font-medium text-slate-900 tracking-tight mb-2">
              No Documents Yet
            </h3>

            <p className="text-sm text-slate-500 mb-6">
              Get started by uploading your first PDF document to begin learning
            </p>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {documents?.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen p-6 md:p-8 bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="absolute inset-0 bg-[radial-linear(#e5e7eb_1px,transparent_1px)] bg-position-\[size\:16px_16px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              My Documents
            </h1>

            <p className="text-sm text-slate-500">
              Manage and organize your learning materials
            </p>
          </div>

          {documents.length > 0 && (
            <Button onClick={() => setIsUploadModalOpen(true)} variant="blue">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </Button>
          )}
        </div>

        {renderContent()}
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Upload Document
              </h3>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>

                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  File
                </label>

                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>

              <Button type="submit" disabled={uploading} className="w-full">
                <Upload className="w-4 h-4" strokeWidth={2.5} />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Document?
            </h3>

            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-800">
                {selectedDoc.title}
              </span>
              ?
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsListPage;