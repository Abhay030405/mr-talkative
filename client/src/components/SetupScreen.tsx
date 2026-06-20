'use client';

import { useState, useEffect } from "react";
import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/services/api";

const semesters = Array.from({ length: 8 }, (_, i) => {
  const n = i + 1;
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${suffix} Sem`;
});

const branches = [
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "IT", label: "Information Technology" },
  { value: "EE", label: "Electrical Engineering" },
  { value: "ECE", label: "Electronics & Communication Engineering" },
];

export interface UserContext {
  semester: string;
  branch: string;
  subject: string;
}

interface SetupScreenProps {
  onComplete: (ctx: UserContext) => void;
  onToggleSidebar?: () => void;
}

const SetupScreen = ({ onComplete, onToggleSidebar }: SetupScreenProps) => {
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");

  useEffect(() => {
    if (!branch || !semester) {
      setSubjects([]);
      setSubjectsError("");
      return;
    }
    const semNum = parseInt(semester);
    setSubjectsLoading(true);
    setSubjectsError("");
    setSubject("");

    fetch(`${API_URL}/api/upload/library/subjects?branch=${encodeURIComponent(branch)}&semester=${semNum}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load subjects");
        return res.json();
      })
      .then((data) => {
        const list: string[] = data?.data?.subjects ?? [];
        setSubjects(list);
        if (list.length === 0) setSubjectsError("No subjects available for this selection");
      })
      .catch(() => {
        setSubjects([]);
        setSubjectsError("No subjects available for this selection");
      })
      .finally(() => setSubjectsLoading(false));
  }, [branch, semester]);

  const isValid = semester && branch && subject;

  const handleBranchChange = (val: string) => {
    setBranch(val);
    setSubject("");
  };
  const handleSemChange = (val: string) => {
    setSemester(val);
    setSubject("");
  };

  return (
    <div className="flex-1 flex flex-col bg-chat-bg min-h-screen min-w-0">
      {/* Mobile header */}
      <div className="flex items-center gap-3 px-4 py-3 md:hidden border-b border-border">
        <button onClick={onToggleSidebar} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-display text-lg font-medium text-foreground/80">Mr. Talkative</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col items-center animate-fade-in">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-foreground/80 mb-4 select-none text-center">
          Mr. Talkative
        </h1>
        <p className="text-muted-foreground text-sm mb-8 text-center">
          Select your details to get started
        </p>

        <div className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Semester</label>
            <Select value={semester} onValueChange={handleSemChange}>
              <SelectTrigger className="w-full h-10 bg-chat-input">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Branch</label>
            <Select value={branch} onValueChange={handleBranchChange}>
              <SelectTrigger className="w-full h-10 bg-chat-input">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Subject</label>
            <Select
              value={subject}
              onValueChange={setSubject}
              disabled={!branch || !semester || subjectsLoading}
            >
              <SelectTrigger className="w-full h-10 bg-chat-input">
                <SelectValue
                  placeholder={
                    subjectsLoading
                      ? "Loading subjects…"
                      : !branch || !semester
                      ? "Select semester & branch first"
                      : subjectsError || "Select Subject"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {subjectsError && !subjectsLoading && branch && semester && (
              <p className="text-xs text-muted-foreground">{subjectsError}</p>
            )}
          </div>

          <Button
            onClick={() => onComplete({ semester, branch, subject })}
            disabled={!isValid}
            className="w-full mt-4"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Chat
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SetupScreen;
