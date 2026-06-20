'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Hash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { signupUser, ValidationError } from "@/services/api";

const FIELD_LABELS: Record<string, string> = {
  full_name: "Full name",
  email: "Email",
  password: "Password",
  branch: "Branch",
  semester: "Semester",
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

export default function SignUp() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const isFormValid =
    name && email && password && confirmPassword && passwordsMatch && regNumber && branch && semester;

  const clearErrors = () => {
    setError("");
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    clearErrors();
    setLoading(true);
    try {
      const data = await signupUser(name, email, password, branch, parseInt(semester), regNumber);
      login(data.data.user, data.data.access_token);
      router.push(`/student/${data.data.user.reg_number}`);
    } catch (err) {
      if (err instanceof ValidationError) {
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : "Sign up failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center bg-chat-bg px-4 py-10 sm:py-8">
      <div className="w-full max-w-sm animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-2">Create account</h1>
        <p className="text-muted-foreground text-sm mb-6 sm:mb-8">Join Mr. Talkative today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Full Name *"
                value={name}
                onChange={(e) => { setName(e.target.value); clearErrors(); }}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-chat-input border border-border text-foreground text-base sm:text-sm placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <FieldError msg={fieldErrors.full_name} />
          </div>

          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-chat-input border border-border text-foreground text-base sm:text-sm placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            {!fieldErrors.email && (
              <p className="text-xs text-muted-foreground mt-1">Must be a @mnnit.ac.in email</p>
            )}
            <FieldError msg={fieldErrors.email} />
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-chat-input border border-border text-foreground text-base sm:text-sm placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!fieldErrors.password && (
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
            )}
            <FieldError msg={fieldErrors.password} />
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-chat-input border border-border text-foreground text-base sm:text-sm placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-destructive mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Registration Number *"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-chat-input border border-border text-foreground text-base sm:text-sm placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
            />
          </div>

          <div>
            <Select value={branch} onValueChange={(v) => { setBranch(v); clearErrors(); }}>
              <SelectTrigger className="w-full py-3 h-auto rounded-xl bg-chat-input border-border text-base sm:text-sm">
                <SelectValue placeholder="Select Branch *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSE">Computer Science and Engineering</SelectItem>
                <SelectItem value="IT">Information Technology</SelectItem>
                <SelectItem value="EE">Electrical Engineering</SelectItem>
                <SelectItem value="ECE">Electronics and Communication Engineering</SelectItem>
              </SelectContent>
            </Select>
            <FieldError msg={fieldErrors.branch} />
          </div>

          <div>
            <Select value={semester} onValueChange={(v) => { setSemester(v); clearErrors(); }}>
              <SelectTrigger className="w-full py-3 h-auto rounded-xl bg-chat-input border-border text-base sm:text-sm">
                <SelectValue placeholder="Select Semester *" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 8 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    Semester {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError msg={fieldErrors.semester} />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
