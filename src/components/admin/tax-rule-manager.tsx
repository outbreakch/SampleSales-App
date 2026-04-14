"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStaffCopy } from "@/lib/i18n";

type TaxRuleItem = {
  id: string;
  countryCode: "US" | "CA" | "AU";
  name: string;
  code: string;
  category: string;
  ratePercent: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  priority: number;
  isCompound: boolean;
  isActive: boolean;
};

type TaxRuleDraft = TaxRuleItem;

const newRule = (): TaxRuleDraft => ({
  id: "new",
  countryCode: "CA",
  name: "New tax rule",
  code: "NEW_RULE",
  category: "STANDARD",
  ratePercent: 0,
  effectiveFrom: new Date().toISOString(),
  effectiveTo: null,
  priority: 0,
  isCompound: false,
  isActive: true
});

export function TaxRuleManager({
  taxRules,
  language
}: {
  taxRules: TaxRuleItem[];
  language?: string | null;
}) {
  const router = useRouter();
  const copy = getStaffCopy(language);
  const [selectedId, setSelectedId] = useState<string>(taxRules[0]?.id ?? "new");
  const [drafts, setDrafts] = useState<Record<string, TaxRuleDraft>>(
    Object.fromEntries(taxRules.map((rule) => [rule.id, { ...rule }]))
  );
  const [creating, setCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedRule = useMemo(() => {
    if (creating) {
      return drafts.new ?? newRule();
    }

    return drafts[selectedId] ?? drafts[taxRules[0]?.id ?? ""];
  }, [creating, drafts, selectedId, taxRules]);

  function updateRule(patch: Partial<TaxRuleDraft>) {
    if (!selectedRule) {
      return;
    }

    const key = creating ? "new" : selectedRule.id;
    setDrafts((current) => ({
      ...current,
      [key]: {
        ...selectedRule,
        ...patch
      }
    }));
  }

  async function saveRule() {
    if (!selectedRule) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    const payload = {
      countryCode: selectedRule.countryCode,
      name: selectedRule.name,
      code: selectedRule.code,
      category: selectedRule.category,
      regionCode: "",
      ratePercent: selectedRule.ratePercent,
      effectiveFrom: new Date(selectedRule.effectiveFrom).toISOString(),
      effectiveTo: selectedRule.effectiveTo ? new Date(selectedRule.effectiveTo).toISOString() : "",
      priority: selectedRule.priority,
      isCompound: selectedRule.isCompound,
      isActive: selectedRule.isActive
    };

    const url = creating ? "/api/admin/tax-rules/new" : `/api/admin/tax-rules/${selectedRule.id}`;
    const method = creating ? "POST" : "PATCH";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const body = (await response.json()) as { error?: string | { formErrors?: string[] } };

    if (!response.ok) {
      setError(typeof body.error === "string" ? body.error : copy.unableToSaveTaxRule);
      setIsSaving(false);
      return;
    }

    setCreating(false);
    setMessage(copy.taxRuleSaved);
    setIsSaving(false);
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="bg-white/96">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone">{copy.taxesEyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">{copy.taxRulesTitle}</h2>
          </div>
          <Button
            onClick={() => {
              setCreating(true);
              setSelectedId("new");
              setDrafts((current) => ({ ...current, new: newRule() }));
            }}
            variant="success"
          >
            <Plus className="mr-2 size-4" />
            {copy.addRule}
          </Button>
        </div>
        <div className="mt-6 space-y-3">
          {taxRules.map((rule) => {
            const active = !creating && rule.id === selectedId;
            return (
              <button
                key={rule.id}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active ? "border-ink bg-sand/50" : "border-black/5 hover:bg-black/[0.02]"
                }`}
                onClick={() => {
                  setCreating(false);
                  setSelectedId(rule.id);
                  setMessage("");
                  setError("");
                }}
                type="button"
              >
                <p className="font-semibold text-ink">{rule.name}</p>
                <p className="text-sm text-stone">
                  {rule.countryCode} · {rule.ratePercent}%
                </p>
              </button>
            );
          })}
        </div>
      </Card>
      <Card className="bg-white/96">
        {selectedRule ? (
          <div className="grid gap-4">
            <p className="text-xs uppercase tracking-[0.24em] text-stone">
              {creating ? copy.createRule : copy.editRule}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.country}</label>
                <select
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink outline-none focus:border-ink"
                  value={selectedRule.countryCode}
                  onChange={(event) => updateRule({ countryCode: event.target.value as "US" | "CA" | "AU" })}
                >
                  <option value="US">US</option>
                  <option value="CA">CA</option>
                  <option value="AU">AU</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.nameLabel}</label>
                <Input value={selectedRule.name} onChange={(event) => updateRule({ name: event.target.value })} />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.codeLabel}</label>
                <Input value={selectedRule.code} onChange={(event) => updateRule({ code: event.target.value })} />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.category}</label>
                <Input value={selectedRule.category} onChange={(event) => updateRule({ category: event.target.value })} />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.ratePercent}</label>
                <Input type="number" step="0.001" value={selectedRule.ratePercent} onChange={(event) => updateRule({ ratePercent: Number(event.target.value) || 0 })} />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.effectiveFrom}</label>
                <Input type="datetime-local" value={selectedRule.effectiveFrom.slice(0, 16)} onChange={(event) => updateRule({ effectiveFrom: new Date(event.target.value).toISOString() })} />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.effectiveTo}</label>
                <Input type="datetime-local" value={selectedRule.effectiveTo ? selectedRule.effectiveTo.slice(0, 16) : ""} onChange={(event) => updateRule({ effectiveTo: event.target.value ? new Date(event.target.value).toISOString() : null })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-sand/40 px-4 py-3 text-sm text-ink">
                <input className="size-5 rounded" checked={selectedRule.isCompound} onChange={(event) => updateRule({ isCompound: event.target.checked })} type="checkbox" />
                {copy.compoundRule}
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-sand/40 px-4 py-3 text-sm text-ink">
                <input className="size-5 rounded" checked={selectedRule.isActive} onChange={(event) => updateRule({ isActive: event.target.checked })} type="checkbox" />
                {copy.ruleActive}
              </label>
            </div>
            <div className="flex gap-3">
              <Button disabled={isSaving} onClick={saveRule} variant="success">
                {isSaving ? copy.saving : copy.saveRule}
              </Button>
            </div>
            {message ? <p className="text-sm text-success">{message}</p> : null}
            {error ? <p className="text-sm text-danger">{error}</p> : null}
          </div>
        ) : (
          <p className="text-sm text-stone">{copy.noTaxRuleSelected}</p>
        )}
      </Card>
    </div>
  );
}
