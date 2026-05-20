import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Revival Admin" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/admin" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const action = mode === "signin" ? signIn : signUp;
    const { error } = await action(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (mode === "signup") {
      toast.success("Account created. Check your email to confirm, then sign in.");
      setMode("signin");
    } else {
      toast.success("Welcome back.");
      navigate({ to: "/admin" });
    }
  };

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col">
      <div className="px-6 md:px-10 py-6 border-b border-border/40">
        <Link to="/" className="inline-flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-display tracking-[0.22em] uppercase text-sm">Revival</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <p className="text-[11px] tracking-editorial uppercase text-primary mb-4">
            § Admin Access
          </p>
          <h1 className="font-display text-bone text-4xl mb-2">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            {mode === "signin"
              ? "Use your admin credentials to manage the studio."
              : "First registered user can claim the admin role inside the panel."}
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] tracking-editorial uppercase text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border h-11 rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] tracking-editorial uppercase text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-border h-11 rounded-none"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-none bg-bone text-ink hover:bg-primary hover:text-primary-foreground tracking-editorial uppercase text-[11px]"
            >
              {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}