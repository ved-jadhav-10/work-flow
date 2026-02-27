"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Upload,
  FileText,
  Loader2,
  Sparkles,
  Lightbulb,
  ListChecks,
  ChevronRight,
  Star,
  AlertCircle,
} from "lucide-react";
import { learningApi } from "@/lib/api";
import type { Document, Concept, SummaryLevel } from "@/types";

/* ── Types (API shapes) ───────────────────────────────────────────────────── */

interface DocFromApi {
  id: string;
  project_id: string;
  filename: string;
  file_url?: string;
  doc_type: string;
  raw_text?: string;
  summary?: string;
  key_concepts?: Concept[];
  implementation_steps?: string[];
  created_at: string;
}

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function LearningPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [documents, setDocuments] = useState<DocFromApi[]>([]);
  const [selected, setSelected] = useState<DocFromApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // LLM generation states
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [conceptsLoading, setConceptsLoading] = useState(false);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [summaryLevel, setSummaryLevel] = useState<SummaryLevel>("short");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load documents ──────────────────────────────────────────────────────

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data: any = await learningApi.listDocuments(projectId);
      setDocuments(data.documents ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // ── Upload ──────────────────────────────────────────────────────────────

  async function handleUpload(file: File) {
    try {
      setUploading(true);
      setError("");
      const doc: any = await learningApi.uploadDocument(projectId, file);
      setDocuments((prev) => [doc, ...prev]);
      setSelected(doc);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  }

  // ── Drop zone handlers ─────────────────────────────────────────────────

  const [dragOver, setDragOver] = useState(false);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  // ── Summarize ───────────────────────────────────────────────────────────

  async function handleSummarize() {
    if (!selected) return;
    try {
      setSummaryLoading(true);
      const data: any = await learningApi.summarize(
        projectId,
        selected.id,
        summaryLevel,
      );
      setSelected((prev) =>
        prev ? { ...prev, summary: data.summary } : prev,
      );
      // Update in list too
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === selected.id ? { ...d, summary: data.summary } : d,
        ),
      );
    } catch (err: any) {
      setError(err.message || "Summarization failed");
    } finally {
      setSummaryLoading(false);
    }
  }

  // ── Extract concepts ────────────────────────────────────────────────────

  async function handleConcepts() {
    if (!selected) return;
    try {
      setConceptsLoading(true);
      const data: any = await learningApi.extractConcepts(
        projectId,
        selected.id,
      );
      setSelected((prev) =>
        prev ? { ...prev, key_concepts: data.concepts } : prev,
      );
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === selected.id ? { ...d, key_concepts: data.concepts } : d,
        ),
      );
    } catch (err: any) {
      setError(err.message || "Concept extraction failed");
    } finally {
      setConceptsLoading(false);
    }
  }

  // ── Generate steps ──────────────────────────────────────────────────────

  async function handleSteps() {
    if (!selected) return;
    try {
      setStepsLoading(true);
      const data: any = await learningApi.generateSteps(
        projectId,
        selected.id,
      );
      setSelected((prev) =>
        prev ? { ...prev, implementation_steps: data.steps } : prev,
      );
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === selected.id
            ? { ...d, implementation_steps: data.steps }
            : d,
        ),
      );
    } catch (err: any) {
      setError(err.message || "Step generation failed");
    } finally {
      setStepsLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading documents…
      </div>
    );
  }

  return (
    <div className="p-8 text-white max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <BookOpen className="w-6 h-6 text-indigo-400" />
        <h1 className="text-2xl font-bold">Learning Hub</h1>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Upload documents, generate AI summaries, extract key concepts, and get
        implementation steps.
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button
            className="ml-auto text-red-300 hover:text-red-100"
            onClick={() => setError("")}
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column: Upload + doc list ──────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Upload zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-indigo-400 bg-indigo-500/10"
                : "border-gray-700 hover:border-gray-500"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <p className="text-sm text-gray-400">Uploading & processing…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-500" />
                <p className="text-sm text-gray-400">
                  Drop a PDF, TXT, or MD file here
                </p>
                <p className="text-xs text-gray-600">or click to browse</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          {/* Document list */}
          <div className="space-y-2">
            {documents.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-4">
                No documents yet — upload one above.
              </p>
            )}
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelected(doc)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  selected?.id === doc.id
                    ? "bg-indigo-500/20 border border-indigo-500/40"
                    : "bg-gray-800/50 border border-gray-800 hover:border-gray-600"
                }`}
              >
                <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{doc.filename}</p>
                  <p className="text-xs text-gray-500">
                    {doc.doc_type.toUpperCase()} ·{" "}
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Right column: doc detail ────────────────────────────────── */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="border border-dashed border-gray-700 rounded-xl p-12 text-center text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Select a document to view its analysis</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Doc header */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-1">
                  {selected.filename}
                </h2>
                <p className="text-xs text-gray-500">
                  {selected.doc_type.toUpperCase()} · Uploaded{" "}
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>

              {/* ── Summary panel ──────────────────────────────────── */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold">AI Summary</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {(["short", "detailed", "exam-ready"] as SummaryLevel[]).map(
                      (level) => (
                        <button
                          key={level}
                          onClick={() => setSummaryLevel(level)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            summaryLevel === level
                              ? "bg-indigo-500 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {level}
                        </button>
                      ),
                    )}
                    <button
                      onClick={handleSummarize}
                      disabled={summaryLoading}
                      className="ml-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      {summaryLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Generate
                    </button>
                  </div>
                </div>
                {selected.summary ? (
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selected.summary}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 italic">
                    No summary yet — click Generate to create one.
                  </p>
                )}
              </div>

              {/* ── Concepts panel ─────────────────────────────────── */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold">Key Concepts</h3>
                  </div>
                  <button
                    onClick={handleConcepts}
                    disabled={conceptsLoading}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    {conceptsLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Lightbulb className="w-3 h-3" />
                    )}
                    Extract
                  </button>
                </div>
                {selected.key_concepts && selected.key_concepts.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selected.key_concepts.map((c, i) => (
                      <div
                        key={i}
                        className="bg-gray-900/60 border border-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{c.name}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s < c.importance
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-700"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {c.definition}
                        </p>
                        {c.analogy && (
                          <p className="text-xs text-indigo-400 mt-1">
                            💡 {c.analogy}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">
                    No concepts extracted yet — click Extract.
                  </p>
                )}
              </div>

              {/* ── Steps panel ────────────────────────────────────── */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold">Implementation Steps</h3>
                  </div>
                  <button
                    onClick={handleSteps}
                    disabled={stepsLoading}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    {stepsLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ListChecks className="w-3 h-3" />
                    )}
                    Generate
                  </button>
                </div>
                {selected.implementation_steps &&
                selected.implementation_steps.length > 0 ? (
                  <ol className="space-y-2">
                    {selected.implementation_steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-gray-300"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-gray-600 italic">
                    No steps generated yet — click Generate.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
