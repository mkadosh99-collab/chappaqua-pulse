import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2, Lock, MapPin, ExternalLink, Mail } from "lucide-react";
import type { BusinessSubmission } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const PASSWORD_KEY = "cp_admin_password";

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food & Drink",
  apparel: "Apparel & Accessories",
  specialty: "Specialty Retail",
  home: "Home & Design",
  wellness: "Health & Wellness",
  service: "Services",
  civic: "Civic & Community",
};

async function adminFetch(url: string, password: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      "x-admin-password": password,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
}

function LoginCard({ onSuccess }: { onSuccess: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      sessionStorage.setItem(PASSWORD_KEY, password);
      onSuccess(password);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-admin-password"
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-admin-login">
              {loading ? "Checking..." : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmissionCard({
  submission,
  password,
}: {
  submission: BusinessSubmission;
  password: string;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (action: "approve" | "reject") => {
      await adminFetch(`/api/admin/submissions/${submission.id}`, password, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      return action;
    },
    onSuccess: (action) => {
      toast({
        title: action === "approve" ? "Business approved" : "Submission rejected",
        description:
          action === "approve"
            ? `${submission.name} is now live in the directory.`
            : `${submission.name} was rejected.`,
      });
      qc.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card data-testid={`card-submission-${submission.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg" data-testid={`text-submission-name-${submission.id}`}>
            {submission.name}
          </CardTitle>
          <Badge variant="secondary">{CATEGORY_LABELS[submission.category] || submission.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-start gap-1.5 text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {submission.address}
        </p>
        {submission.description && <p>{submission.description}</p>}
        {submission.owner && (
          <p className="text-muted-foreground">Owner: {submission.owner}</p>
        )}
        {submission.website && (
          <a
            href={submission.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
            data-testid={`link-submission-website-${submission.id}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {submission.website}
          </a>
        )}
        {(submission.contactName || submission.contactEmail) && (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <Mail className="h-4 w-4" />
            {submission.contactName}
            {submission.contactName && submission.contactEmail ? " · " : ""}
            {submission.contactEmail}
          </p>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => mutation.mutate("approve")}
            disabled={mutation.isPending}
            data-testid={`button-approve-${submission.id}`}
            className="gap-1"
          >
            <Check className="h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => mutation.mutate("reject")}
            disabled={mutation.isPending}
            data-testid={`button-reject-${submission.id}`}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const [password, setPassword] = useState<string | null>(() =>
    sessionStorage.getItem(PASSWORD_KEY),
  );

  const { data, isLoading, isError, error } = useQuery<{ submissions: BusinessSubmission[] }>({
    queryKey: ["/api/admin/submissions"],
    enabled: !!password,
    queryFn: async () => {
      const res = await adminFetch("/api/admin/submissions?status=pending", password!);
      return res.json();
    },
  });

  if (!password) {
    return <LoginCard onSuccess={setPassword} />;
  }

  if (isError && error instanceof Error && error.message.startsWith("401")) {
    sessionStorage.removeItem(PASSWORD_KEY);
    setPassword(null);
  }

  const submissions = data?.submissions ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Business Submissions</h1>
          <p className="text-muted-foreground">Review and approve businesses for the directory.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            sessionStorage.removeItem(PASSWORD_KEY);
            setPassword(null);
          }}
          data-testid="button-admin-logout"
        >
          Log out
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground" data-testid="text-submissions-loading">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading submissions…
        </div>
      )}

      {!isLoading && submissions.length === 0 && (
        <p className="text-muted-foreground" data-testid="text-no-submissions">
          No pending submissions right now.
        </p>
      )}

      <div className="space-y-4">
        {submissions.map((s) => (
          <SubmissionCard key={s.id} submission={s} password={password} />
        ))}
      </div>
    </div>
  );
}
