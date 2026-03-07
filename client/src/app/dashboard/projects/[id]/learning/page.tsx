"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  UploadCloud,
  FileText,
  Loader2,
  Sparkles,
  Lightbulb,
  ListChecks,
  ChevronRight,
  Star,
  AlertCircle,
  X,
  Clock,
  Zap,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { learningApi } from "@/lib/api";
import type { Concept, SummaryLevel } from "@/types";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Design Tokens                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
const T = {
  bg: "var(--background)",
  surface: "var(--surface)",
  border: "var(--border)",
  borderHover: "var(--border-strong)",
  gold: "var(--gold)",
  cyan: "var(--accent)",
  glowCyan: "0 0 24px 0 rgba(96,165,250,0.25)",
  glowGold: "0 0 20px 0 rgba(212,170,112,0.30)",
} as const;

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Types                                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Framer Motion Variants                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const panelSlide = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, damping: 28, stiffness: 260 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" as const },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Helpers                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
function conceptPills(doc: DocFromApi) {
  if (doc.key_concepts && doc.key_concepts.length > 0) {
    return doc.key_concepts.slice(0, 3).map((c) => c.name);
  }
  const base = doc.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  const words = base.split(" ").filter(Boolean);
  if (words.length >= 3) return words.slice(0, 3);
  return [words[0] ?? "Document", "Analysis", "Concepts"];
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  LEARNING PAGE                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function LearningPage() {
  const params = useParams();
  const projectId = (params?.id ?? "") as string;

  /* ── State ──────────────────────────────────────────────────────────── */
  const [documents, setDocuments] = useState<DocFromApi[]>([]);
  const [selected, setSelected] = useState<DocFromApi | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [conceptsLoading, setConceptsLoading] = useState(false);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [summaryLevel, setSummaryLevel] = useState<SummaryLevel>("short");

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Load documents ─────────────────────────────────────────────────── */
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

  /* ── Upload ─────────────────────────────────────────────────────────── */
  async function handleUpload(file: File) {
    try {
      setUploading(true);
      setError("");
      const doc: any = await learningApi.uploadDocument(projectId, file);
      setDocuments((prev) => [doc, ...prev]);
      openPanel(doc);
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

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  /* ── Side-panel helpers ─────────────────────────────────────────────── */
  function openPanel(doc: DocFromApi) {
    setSelected(doc);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setTimeout(() => setSelected(null), 350);
  }

  /* ── Delete document ────────────────────────────────────────────────── */
  async function handleDeleteDoc(docId: string) {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    try {
      await learningApi.deleteDocument(projectId, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      closePanel();
    } catch (err: any) {
      setError(err.message || "Delete failed");
    }
  }

  /* ── AI actions ─────────────────────────────────────────────────────── */
  async function handleSummarize() {
    if (!selected) return;
    try {
      setSummaryLoading(true);
      const data: any = await learningApi.summarize(
        projectId,
        selected.id,
        summaryLevel,
      );
      const updated = { ...selected, summary: data.summary };
      setSelected(updated);
      setDocuments((prev) =>
        prev.map((d) => (d.id === selected.id ? updated : d)),
      );
    } catch (err: any) {
      setError(err.message || "Summarization failed");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleConcepts() {
    if (!selected) return;
    try {
      setConceptsLoading(true);
      const data: any = await learningApi.extractConcepts(
        projectId,
        selected.id,
      );
      const updated = { ...selected, key_concepts: data.concepts };
      setSelected(updated);
      setDocuments((prev) =>
        prev.map((d) => (d.id === selected.id ? updated : d)),
      );
    } catch (err: any) {
      setError(err.message || "Concept extraction failed");
    } finally {
      setConceptsLoading(false);
    }
  }

  async function handleSteps() {
    if (!selected) return;
    try {
      setStepsLoading(true);
      const data: any = await learningApi.generateSteps(
        projectId,
        selected.id,
      );
      const updated = { ...selected, implementation_steps: data.steps };
      setSelected(updated);
      setDocuments((prev) =>
        prev.map((d) => (d.id === selected.id ? updated : d)),
      );
    } catch (err: any) {
      setError(err.message || "Step generation failed");
    } finally {
      setStepsLoading(false);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                               */
  /* ══════════════════════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-[60vh]"
        style={{ background: T.bg }}
      >
        <Loader2 className="w-6 h-6 animate-spin text-accent mr-3" />
        <span className="text-gray-400 font-medium">
          Loading knowledge base…
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: T.bg }}
    >
      {/* ── Ambient glow blobs ────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-gold/8 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-10">
        {/* ══ HEADER ═════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.20)",
              }}
            >
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1
                className="text-3xl font-semibold tracking-tight text-white"
              >
                EasyLearn
              </h1>
              <p
                className="text-sm text-gray-500 mt-0.5"
              >
                Upload documents — let AI extract summaries, concepts &amp;
                implementation steps.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Error banner ────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div
                className="flex items-center gap-3 rounded-xl px-5 py-3 text-sm"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.20)",
                }}
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-red-300 flex-1">{error}</span>
                <button
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ UPLOAD ZONE ════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ borderColor: T.cyan, boxShadow: T.glowCyan }}
          className="relative mb-10 cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300"
          style={{
            background: dragOver ? "rgba(56,189,248,0.06)" : T.surface,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderColor: dragOver ? T.cyan : T.border,
            boxShadow: dragOver ? T.glowCyan : "none",
          }}
        >
          <div className="flex flex-col items-center justify-center py-14 sm:py-16">
            {uploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "linear",
                }}
                className="mb-3"
              >
                <Loader2 className="w-10 h-10 text-accent" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: "easeInOut",
                }}
                className="mb-3"
              >
                <UploadCloud className="w-10 h-10 text-gray-500" />
              </motion.div>
            )}
            <p className="text-sm text-gray-400 font-medium">
              {uploading
                ? "Uploading & processing…"
                : "Drop a PDF, TXT, or Markdown file here"}
            </p>
            <p className="text-xs text-gray-600 mt-1">or click to browse</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            className="hidden"
            onChange={onFileChange}
          />
        </motion.div>

        {/* ══ DOCUMENT GRID ══════════════════════════════════════════════ */}
        {documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-600 text-sm">
              No documents yet — upload one above to get started.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc, i) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                index={i}
                isSelected={selected?.id === doc.id}
                onSelect={() => openPanel(doc)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══ SUMMARY SIDE-PANEL ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {panelOpen && selected && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.aside
              variants={panelSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 z-50 h-screen w-full max-w-lg overflow-y-auto"
              style={{
                background: "rgba(8,14,30,0.92)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderLeft: `1px solid ${T.border}`,
              }}
            >
              <div className="p-6 sm:p-8">
                {/* Close row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(56,189,248,0.12)",
                        boxShadow: T.glowCyan,
                      }}
                    >
                      <FileText className="w-4 h-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-white truncate">
                        {selected.filename}
                      </h2>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(selected.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => selected && handleDeleteDoc(selected.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={closePanel}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* ── Summary Section ────────────────────────────────── */}
                <PanelSection
                  icon={<Sparkles className="w-4 h-4 text-gold" />}
                  title="AI Summary"
                >
                  {/* Level selector */}
                  <div className="flex items-center gap-2 mb-4">
                    {(
                      ["short", "detailed", "comprehensive"] as SummaryLevel[]
                    ).map((level) => (
                      <motion.button
                        key={level}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSummaryLevel(level)}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                        style={{
                          background:
                            summaryLevel === level
                              ? "rgba(255,215,0,0.15)"
                              : "rgba(255,255,255,0.04)",
                          border: `1px solid ${summaryLevel === level ? "rgba(255,215,0,0.35)" : T.border}`,
                          color:
                            summaryLevel === level ? T.gold : "#9CA3AF",
                        }}
                      >
                        {level}
                      </motion.button>
                    ))}
                  </div>

                  {selected.summary ? (
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selected.summary}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 italic">
                      No summary yet — generate one below.
                    </p>
                  )}

                  {/* Golden generate button */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: T.glowGold }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSummarize}
                    disabled={summaryLoading}
                    className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--gold) 0%, rgba(245,158,11,1) 100%)",
                      color: "#0F172A",
                    }}
                  >
                    {summaryLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {summaryLoading
                      ? "Generating…"
                      : "Generate Smart Notes"}
                  </motion.button>
                </PanelSection>

                {/* ── Concepts Section ───────────────────────────────── */}
                <PanelSection
                  icon={<Lightbulb className="w-4 h-4 text-amber-400" />}
                  title="Key Concepts"
                >
                  {selected.key_concepts &&
                  selected.key_concepts.length > 0 ? (
                    <div className="space-y-3">
                      {selected.key_concepts.map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-xl p-3"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid ${T.border}`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">
                              {c.name}
                            </span>
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
                            <p className="text-xs text-accent mt-1.5">
                              💡 {c.analogy}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic">
                      No concepts extracted yet.
                    </p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleConcepts}
                    disabled={conceptsLoading}
                    className="mt-4 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{
                      background: "rgba(56,189,248,0.12)",
                      border: "1px solid rgba(56,189,248,0.25)",
                      color: T.cyan,
                    }}
                  >
                    {conceptsLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lightbulb className="w-3.5 h-3.5" />
                    )}
                    {conceptsLoading ? "Extracting…" : "Extract Concepts"}
                  </motion.button>
                </PanelSection>

                {/* ── Steps Section ──────────────────────────────────── */}
                <PanelSection
                  icon={<ListChecks className="w-4 h-4 text-emerald-400" />}
                  title="Implementation Steps"
                >
                  {selected.implementation_steps &&
                  selected.implementation_steps.length > 0 ? (
                    <ol className="space-y-2">
                      {selected.implementation_steps.map((step, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 text-sm text-gray-300"
                        >
                          <span
                            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              background: "rgba(16,185,129,0.15)",
                              color: "#34D399",
                            }}
                          >
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </motion.li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-gray-600 italic">
                      No steps generated yet.
                    </p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSteps}
                    disabled={stepsLoading}
                    className="mt-4 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      color: "#34D399",
                    }}
                  >
                    {stepsLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    {stepsLoading ? "Generating…" : "Generate Steps"}
                  </motion.button>
                </PanelSection>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Document Card                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
function DocumentCard({
  doc,
  index,
  isSelected,
  onSelect,
}: {
  doc: DocFromApi;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const pills = conceptPills(doc);

  return (
    <motion.button
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={{ scale: 1.015 }}
      onClick={onSelect}
      className="text-left w-full group relative rounded-2xl p-5 transition-all"
      style={{
        background: isSelected ? "rgba(56,189,248,0.08)" : T.surface,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${isSelected ? "rgba(56,189,248,0.25)" : T.border}`,
      }}
    >
      {/* Hover glow overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ boxShadow: "inset 0 0 40px 0 rgba(56,189,248,0.06)" }}
      />

      <div className="relative z-10">
        {/* Icon + Title row */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
            style={{
              background: "rgba(56,189,248,0.10)",
              boxShadow: "0 0 16px 0 rgba(56,189,248,0.15)",
            }}
          >
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate group-hover:text-accent transition-colors duration-300">
              {doc.filename}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {new Date(doc.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-accent shrink-0 mt-1 transition-colors duration-300" />
        </div>

        {/* Concept pills */}
        <div className="flex flex-wrap gap-1.5">
          {pills.map((pill) => (
            <span
              key={pill}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                background: "rgba(56,189,248,0.08)",
                border: "1px solid rgba(56,189,248,0.15)",
                color: T.cyan,
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Panel Section                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
function PanelSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="rounded-xl p-5 mb-5"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${T.border}`,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3
          className="text-sm font-semibold text-white"
        >
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}
