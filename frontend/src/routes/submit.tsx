import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/common/States";
import { api } from "@/lib/api";

export const Route = createFileRoute("/submit")({
  head: () => ({ meta: [{ title: "Submit Observation — SynapseOS" }] }),
  component: SubmitPage,
});

const DEPARTMENTS = [
  "Engineering",
  "Operations",
  "Sales",
  "Marketing",
  "Finance",
  "People",
  "Customer Support",
  "Product",
];

function SubmitPage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [department, setDepartment] = useState("");

  const mutation = useMutation({
    mutationFn: api.createObservation,
    onSuccess: (res) => {
      navigate({ to: "/analysis/$id", params: { id: res.id } });
    },
  });

  const tooShort = text.trim().length > 0 && text.trim().length < 10;
  const canSubmit = text.trim().length >= 10 && submittedBy.trim().length > 0 && !mutation.isPending;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-gradient-to-br from-primary/40 to-accent/30 grid place-items-center border border-border">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Submit an Observation</h1>
            <p className="text-sm text-muted-foreground">
              Share a friction, idea, or signal. Our agent network will analyze it in seconds.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            mutation.mutate({
              text: text.trim(),
              submitted_by: submittedBy.trim(),
              department: department || undefined,
            });
          }}
          className="rounded-xl border border-border bg-surface/70 backdrop-blur p-6 space-y-5"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Observation</span>
              <span className={`text-[11px] ${tooShort ? "text-warning" : "text-muted-foreground"}`}>
                {text.trim().length}/10 min
              </span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Describe what you noticed — a recurring issue, a duplicated effort, a process gap…"
              className="w-full rounded-lg bg-input/40 border border-border focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your name</label>
              <input
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full rounded-lg bg-input/40 border border-border focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 px-3 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department <span className="text-muted-foreground font-normal">(optional)</span></label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-lg bg-input/40 border border-border focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 px-3 py-2.5 text-sm"
              >
                <option value="">Select department…</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {mutation.error && (
            <ErrorState message={(mutation.error as Error).message} />
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="size-4" />
              {mutation.isPending ? "Submitting…" : "Submit for Analysis"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
