'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLatestUploads } from "@/services/api";

interface UploadDoc {
  _id: string;
  title: string;
  branch: string;
  semester: number;
  subject: string;
  file_name: string;
  uploaded_at: string;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function LatestUploads() {
  const [uploads, setUploads] = useState<UploadDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getLatestUploads(20)
      .then((data) => {
        setUploads(data?.data?.documents ?? []);
      })
      .catch(() => {
        setError("Failed to load uploads. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </Link>

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Latest Uploads</h1>
            <p className="text-muted-foreground">
              Your recently uploaded study materials and documents.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">Loading uploads…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && uploads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">
                No uploads yet. Start uploading your study materials!
              </p>
            </div>
          )}

          {!loading && !error && uploads.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Document Name</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Uploaded At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploads.map((doc) => (
                      <TableRow key={doc._id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          {doc.file_name}
                        </TableCell>
                        <TableCell>{doc.branch}</TableCell>
                        <TableCell>Sem {doc.semester}</TableCell>
                        <TableCell>{doc.subject}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(doc.uploaded_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {uploads.map((doc) => (
                  <div
                    key={doc._id}
                    className="rounded-xl border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{doc.file_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">Branch:</span>
                      <span>{doc.branch}</span>
                      <span className="text-muted-foreground">Semester:</span>
                      <span>Sem {doc.semester}</span>
                      <span className="text-muted-foreground">Subject:</span>
                      <span>{doc.subject}</span>
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(doc.uploaded_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
