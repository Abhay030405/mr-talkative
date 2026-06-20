'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, FileText, FolderOpen } from "lucide-react";
import { getDocuments } from "@/services/api";

const semesters = Array.from({ length: 8 }, (_, i) => `B.Tech ${i + 1}${getSuffix(i + 1)} Sem`);
const branches = ["CSE", "EE", "ECE", "IT"];

function getSuffix(n: number) {
  if (n === 1) return "st";
  if (n === 2) return "nd";
  if (n === 3) return "rd";
  return "th";
}

interface Doc {
  _id: string;
  title: string;
  branch: string;
  semester: number;
  subject: string;
  file_name: string;
  uploaded_at: string;
}

export default function Library() {
  const [selectedSem, setSelectedSem] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedSem || !selectedBranch) return;

    const semNum = Number.parseInt(/\d+/.exec(selectedSem)?.[0] ?? "1");
    setLoading(true);
    setError("");

    getDocuments(selectedBranch, semNum, 0, 100)
      .then((data) => {
        const all: Doc[] = data?.data?.documents ?? [];
        setDocuments(all.filter((d) => d.branch === selectedBranch && d.semester === semNum));
      })
      .catch(() => {
        setError("Failed to load materials. Please try again.");
        setDocuments([]);
      })
      .finally(() => setLoading(false));
  }, [selectedSem, selectedBranch]);

  const handleBack = () => {
    if (selectedBranch) {
      setSelectedBranch(null);
      setDocuments([]);
    } else if (selectedSem) {
      setSelectedSem(null);
    }
  };

  const breadcrumb = [
    "Library",
    ...(selectedSem ? [selectedSem] : []),
    ...(selectedBranch ? [selectedBranch] : []),
  ];

  return (
    <div className="min-h-screen bg-chat-bg text-foreground">
      <header className="border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-x-auto">
          {breadcrumb.map((item, i) => (
            <span key={item} className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
              {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
              <span
                className={
                  i === breadcrumb.length - 1
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }
              >
                {item}
              </span>
            </span>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {(selectedSem || selectedBranch) && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {!selectedSem && (
          <>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-2">Library</h1>
            <p className="text-muted-foreground text-sm mb-6 sm:mb-8">
              Browse study materials organized by semester and branch.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {semesters.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSem(sem)}
                  className="group flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl bg-accent/50 border border-border hover:border-primary/40 hover:bg-accent transition-all"
                >
                  <FolderOpen className="w-6 sm:w-8 h-6 sm:h-8 text-primary/70 group-hover:text-primary transition-colors" />
                  <span className="text-xs sm:text-sm font-medium text-center">{sem}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {selectedSem && !selectedBranch && (
          <>
            <h2 className="font-display text-xl sm:text-2xl font-semibold mb-2">{selectedSem}</h2>
            <p className="text-muted-foreground text-sm mb-6 sm:mb-8">Select your branch.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {branches.map((branch) => (
                <button
                  key={branch}
                  onClick={() => setSelectedBranch(branch)}
                  className="group flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl bg-accent/50 border border-border hover:border-primary/40 hover:bg-accent transition-all"
                >
                  <FolderOpen className="w-6 sm:w-8 h-6 sm:h-8 text-primary/70 group-hover:text-primary transition-colors" />
                  <span className="text-xs sm:text-sm font-medium">{branch}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {selectedSem && selectedBranch && (
          <>
            <h2 className="font-display text-xl sm:text-2xl font-semibold mb-2">
              {selectedSem} — {selectedBranch}
            </h2>
            <p className="text-muted-foreground text-sm mb-6 sm:mb-8">Study materials and resources.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {loading && (
                <div className="col-span-full flex items-center justify-center py-12">
                  <p className="text-muted-foreground text-sm">Loading materials…</p>
                </div>
              )}
              {!loading && error && (
                <div className="col-span-full">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              {!loading && !error && documents.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">No materials found for this selection.</p>
                </div>
              )}
              {!loading &&
                documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="group flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-xl bg-accent/50 border border-border hover:border-primary/40 hover:bg-accent transition-all cursor-pointer aspect-square"
                  >
                    <FileText className="w-8 sm:w-10 h-8 sm:h-10 text-primary/60 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] sm:text-xs text-center leading-tight font-medium line-clamp-2">
                      {doc.title}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground line-clamp-1">
                      {doc.subject}
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
