"use client";

import { CheckCircle2, Code2, Eye, Plus, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStaffCopy } from "@/lib/i18n";
import { buildReceiptPreviewValues, receiptTemplateStarter, renderTemplate } from "@/lib/receipt-template";

type TemplateItem = {
  id: string;
  name: string;
  countryCode: string;
  languageCode: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  isActive: boolean;
};

type CountryTemplateContext = {
  code: "US" | "CA" | "AU";
  name: string;
  currencyCode: string;
  defaultLocale: string;
  receiptFooter: string | null;
  legalLabel: string | null;
};

type NewTemplateDraft = {
  countryCode: "US" | "CA" | "AU";
  languageCode: string;
  name: string;
  subject: string;
  htmlBody: string;
  isActive: boolean;
};

export function EmailTemplateManager({
  templates,
  countries,
  language
}: {
  templates: TemplateItem[];
  countries: CountryTemplateContext[];
  language?: string | null;
}) {
  const router = useRouter();
  const copy = getStaffCopy(language);
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, TemplateItem>>(
    Object.fromEntries(templates.map((template) => [template.id, { ...template }]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editorMode, setEditorMode] = useState<"visual" | "html">("html");
  const [newTemplate, setNewTemplate] = useState<NewTemplateDraft>({
    countryCode: "US",
    languageCode: "en",
    name: copy.newReceiptTemplate,
    subject: "Your BESTSELLER sample sale receipt",
    htmlBody: receiptTemplateStarter,
    isActive: true
  });
  const mergeFieldGroups = [
    {
      label: copy.customerAndOrder,
      fields: ["{{customerName}}", "{{customerEmail}}", "{{customerPhone}}", "{{orderNumber}}", "{{orderDate}}"]
    },
    {
      label: copy.totalsAndMarketContext,
      fields: ["{{orderSubtotal}}", "{{orderTax}}", "{{orderTotal}}", "{{currencyCode}}", "{{countryName}}", "{{paymentMethodNote}}"]
    },
    {
      label: copy.receiptBlocks,
      fields: ["{{orderDetailsRows}}", "{{customerDetailsRows}}", "{{orderItemsRows}}", "{{orderItemsList}}", "{{orderSummaryRows}}", "{{orderItemCount}}", "{{orderQuantity}}", "{{receiptFooter}}", "{{legalLabel}}"]
    }
  ];

  const selectedTemplate = drafts[selectedId] ?? drafts[templates[0]?.id ?? ""];
  const selectedCountry =
    countries.find((country) => country.code === selectedTemplate?.countryCode) ??
    countries.find((country) => country.code === newTemplate.countryCode) ??
    countries[0];

  useEffect(() => {
    if (!templates.length) {
      return;
    }

    if (!drafts[selectedId]) {
      setSelectedId(templates[0].id);
    }
  }, [drafts, selectedId, templates]);

  const previewValues = useMemo(
    () =>
      selectedCountry
        ? buildReceiptPreviewValues({
            code: selectedCountry.code,
            name: selectedCountry.name,
            currencyCode: selectedCountry.currencyCode,
            defaultLocale: selectedCountry.defaultLocale,
            receiptFooter: selectedCountry.receiptFooter,
            legalLabel: selectedCountry.legalLabel
          })
        : null,
    [selectedCountry]
  );

  const previewHtml = useMemo(() => {
    if (!selectedTemplate || !previewValues) {
      return "";
    }

    return renderTemplate(selectedTemplate.htmlBody, previewValues);
  }, [previewValues, selectedTemplate]);

  function updateSelectedTemplate(patch: Partial<TemplateItem>) {
    if (!selectedTemplate) {
      return;
    }

    setDrafts((current) => ({
      ...current,
      [selectedTemplate.id]: {
        ...selectedTemplate,
        ...patch
      }
    }));
  }

  async function saveTemplate() {
    if (!selectedTemplate) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    const response = await fetch(`/api/admin/email-templates/${selectedTemplate.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: selectedTemplate.name,
        subject: selectedTemplate.subject,
        htmlBody: selectedTemplate.htmlBody,
        isActive: selectedTemplate.isActive
      })
    });

    const payload = (await response.json()) as { error?: string | { formErrors?: string[] } };

    if (!response.ok) {
      setError(typeof payload.error === "string" ? payload.error : copy.unableToSaveTemplate);
      setIsSaving(false);
      return;
    }

    setMessage(copy.templateSaved);
    setIsSaving(false);
    router.refresh();
  }

  async function createTemplate() {
    setIsSaving(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/email-templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTemplate)
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? copy.unableToCreateTemplate);
      setIsSaving(false);
      return;
    }

    setIsCreating(false);
    setIsSaving(false);
    setMessage(copy.templateCreated);
    router.refresh();
  }

  async function deleteTemplate() {
    if (!selectedTemplate) {
      return;
    }

    const confirmed = window.confirm(copy.deleteTemplateConfirmation);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setMessage("");
    setError("");

    const response = await fetch(`/api/admin/email-templates/${selectedTemplate.id}`, {
      method: "DELETE"
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? copy.unableToDeleteTemplate);
      setIsDeleting(false);
      return;
    }

    setMessage(copy.templateDeleted);
    setIsDeleting(false);
    router.refresh();
  }

  if (!selectedTemplate && templates.length === 0) {
    return <Card className="bg-white/96">{copy.noTemplatesFound}</Card>;
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="bg-white/96">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.28em] text-stone">{copy.templates}</p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">{copy.receiptTemplateEditor}</h2>
              <p className="mt-3 text-sm leading-6 text-stone">
                {copy.receiptTemplateEditorDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[280px]">
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.currentTemplate}</label>
                <select
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-ink outline-none focus:border-ink"
                  value={selectedId}
                  onChange={(event) => {
                    setSelectedId(event.target.value);
                    setMessage("");
                    setError("");
                  }}
                >
                  {templates.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name} · {entry.countryCode} · {entry.languageCode}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={() => setIsCreating(true)} variant="success">
                <Plus className="mr-2 size-4" />
                {copy.createTemplateTitle}
              </Button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-black/5 bg-sand/45 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.currentTemplate}</p>
              <p className="mt-1 font-semibold text-ink">{selectedTemplate.name}</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-stone">
              {selectedTemplate.countryCode} · {selectedTemplate.languageCode}
            </div>
            <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${selectedTemplate.isActive ? "border-success/20 bg-success/10 text-success" : "border-black/5 bg-white text-stone"}`}>
              {selectedTemplate.isActive ? copy.activeTemplate : copy.inactiveTemplate}
            </div>
          </div>
        </Card>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.95fr)_minmax(720px,1.05fr)]">
          <div className="grid gap-6">
          <Card className="bg-white/96">
            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  value={selectedTemplate.name}
                  onChange={(event) => updateSelectedTemplate({ name: event.target.value })}
                />
                <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-sand/40 px-4 py-3 text-sm text-ink">
                  <input
                    checked={selectedTemplate.isActive}
                    className="size-5 rounded"
                    onChange={(event) => updateSelectedTemplate({ isActive: event.target.checked })}
                    type="checkbox"
                  />
                  {copy.activeTemplate}
                </label>
              </div>
              <Input
                value={selectedTemplate.subject}
                onChange={(event) => updateSelectedTemplate({ subject: event.target.value })}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    updateSelectedTemplate({ htmlBody: receiptTemplateStarter });
                    setEditorMode("html");
                  }}
                >
                  <RotateCcw className="mr-2 size-4" />
                  {copy.resetToRecommendedLayout}
                </Button>
                <Button
                  type="button"
                  variant={editorMode === "visual" ? "primary" : "secondary"}
                  className={editorMode === "visual" ? "bg-ink text-white hover:bg-black" : ""}
                  onClick={() => setEditorMode("visual")}
                >
                  <Eye className="mr-2 size-4" />
                  {copy.visualEditor}
                </Button>
                <Button
                  type="button"
                  variant={editorMode === "html" ? "primary" : "secondary"}
                  className={editorMode === "html" ? "bg-ink text-white hover:bg-black" : ""}
                  onClick={() => setEditorMode("html")}
                >
                  <Code2 className="mr-2 size-4" />
                  {copy.htmlSource}
                </Button>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.templateBody}</p>
                  <p className="text-xs text-stone">
                    {editorMode === "html" ? copy.htmlModeHint : copy.visualModeHint}
                  </p>
                </div>
                {editorMode === "visual" ? (
                  <RichTextEditor
                    value={selectedTemplate.htmlBody}
                    onChange={(nextValue) => updateSelectedTemplate({ htmlBody: nextValue })}
                  />
                ) : (
                  <textarea
                    className="min-h-[34rem] w-full rounded-[24px] border border-black/10 bg-white px-5 py-4 font-mono text-[13px] leading-6 text-ink outline-none focus:border-ink"
                    value={selectedTemplate.htmlBody}
                    onChange={(event) => updateSelectedTemplate({ htmlBody: event.target.value })}
                  />
                )}
              </div>
              <div className="flex gap-3">
                <Button disabled={isSaving} onClick={saveTemplate} variant="success">
                  {isSaving ? copy.saving : copy.saveTemplate}
                </Button>
                <Button disabled={isDeleting} onClick={deleteTemplate} type="button" variant="danger">
                  {isDeleting ? copy.deleting : copy.deleteTemplate}
                </Button>
              </div>
              {message ? (
                <div className="flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="size-4" />
                  <span>{message}</span>
                </div>
              ) : null}
              {error ? <p className="text-sm text-danger">{error}</p> : null}
            </div>
          </Card>

          <Card className="bg-white/96">
            <div className="grid gap-4 xl:grid-cols-3">
              {mergeFieldGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone">{group.label}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.fields.map((field) => (
                      <span key={field} className="rounded-full border border-black/10 bg-sand/50 px-3 py-2 text-xs font-medium text-ink">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="bg-gradient-to-b from-[#fcfaf6] to-[#f6efe4] 2xl:sticky 2xl:top-28">
          <p className="text-xs uppercase tracking-[0.24em] text-stone">{copy.livePreview}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone">
            {copy.livePreviewDescription}
          </p>
          <div className="mt-5 overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-panel">
            <iframe
              className="block h-[34rem] w-full border-0 bg-white md:h-[40rem] xl:h-[46rem]"
              sandbox=""
              srcDoc={previewHtml}
              title="Email template preview"
            />
          </div>
        </Card>
      </div>
      </div>

      {isCreating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm">
          <Card className="relative w-full max-w-4xl overflow-hidden bg-white p-0">
            <button
              aria-label={copy.close}
              className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
              onClick={() => setIsCreating(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
            <div className="grid gap-0 xl:grid-cols-[1fr_1fr]">
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-stone">{copy.createTemplateTitle}</p>
                <h3 className="mt-2 text-3xl font-semibold text-ink">{copy.newReceiptTemplate}</h3>
                <p className="mt-3 text-sm text-stone">
                  {copy.newTemplateDescription}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.country}</label>
                    <select
                      className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink outline-none focus:border-ink"
                      value={newTemplate.countryCode}
                      onChange={(event) =>
                        setNewTemplate((current) => ({
                          ...current,
                          countryCode: event.target.value as "US" | "CA" | "AU"
                        }))
                      }
                    >
                      <option value="US">US</option>
                      <option value="CA">CA</option>
                      <option value="AU">AU</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.languageLabel}</label>
                    <Input
                      value={newTemplate.languageCode}
                      onChange={(event) =>
                        setNewTemplate((current) => ({ ...current, languageCode: event.target.value }))
                      }
                      placeholder="en"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.templateName}</label>
                    <Input
                      value={newTemplate.name}
                      onChange={(event) => setNewTemplate((current) => ({ ...current, name: event.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.emailSubject}</label>
                    <Input
                      value={newTemplate.subject}
                      onChange={(event) => setNewTemplate((current) => ({ ...current, subject: event.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-ink p-6 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">{copy.starterLayout}</p>
                <p className="mt-2 text-sm text-white/60">
                  {copy.starterLayoutDescription}
                </p>
                <div className="mt-5 max-h-[30rem] overflow-y-auto rounded-[24px] bg-white p-4 text-sm text-ink">
                  <pre className="whitespace-pre-wrap font-sans">{receiptTemplateStarter}</pre>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button disabled={isSaving} onClick={createTemplate} variant="success">
                    {isSaving ? copy.creating : copy.createTemplateTitle}
                  </Button>
                  <Button onClick={() => setIsCreating(false)} variant="danger">
                    {copy.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
