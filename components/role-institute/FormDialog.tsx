// components/shared/EntityFormDialog.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ─── Field config types ─────────────────────────────────────────────────────
export type FieldType = "text" | "email" | "tel" | "number" | "select" | "textarea" | "date";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  /** key used in the form data object */
  name: string;
  /** label shown above the field */
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  /** options — required when type === "select" */
  options?: FormFieldOption[];
  /** span 1 or 2 columns in the grid (default 1) */
  span?: 1 | 2;
  /** simple client-side validation, return error string or null */
  validate?: (value: string) => string | null;
  onChange?: (value: string) => void;
}

export interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "create" shows Add copy, "edit" shows Update copy */
  mode: "create" | "edit";
  /** entity name shown in titles, e.g. "Student", "Company" */
  entityLabel: string;
  /** field definitions — fully driven from the calling page */
  fields: FormFieldConfig[];
  /** pre-filled values, used for edit mode (or drafts) */
  initialValues?: Record<string, string>;
  /** called with the full form data on submit */
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
  /** external loading flag (e.g. while the API call is in flight) */
  submitting?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EntityFormDialog({
  open,
  onOpenChange,
  mode,
  entityLabel,
  fields,
  initialValues = {},
  onSubmit,
  submitting = false,
}: EntityFormDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // reset / hydrate form whenever the dialog opens
  useEffect(() => {
    if (open) {
      const defaults: Record<string, string> = {};
      fields.forEach(f => { defaults[f.name] = initialValues[f.name] ?? ""; });
      setValues(defaults);
      setErrors({});
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateAll = (): boolean => {
    const nextErrors: Record<string, string> = {};
    fields.forEach(f => {
      const val = values[f.name]?.trim() ?? "";
      if (f.required && !val) {
        nextErrors[f.name] = `${f.label} is required`;
        return;
      }
      if (val && f.validate) {
        const err = f.validate(val);
        if (err) nextErrors[f.name] = err;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    await onSubmit(values);
  };

  const title = mode === "create" ? `Add ${entityLabel}` : `Edit ${entityLabel}`;
  const description =
    mode === "create"
      ? `Fill in the details below to add a new ${entityLabel.toLowerCase()}.`
      : `Update the details for this ${entityLabel.toLowerCase()}.`;
  const submitLabel = mode === "create" ? `Add ${entityLabel}` : "Save Changes";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-3xl">

        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 px-6 pt-6 pb-8">
          <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <DialogHeader className="relative">
            <DialogTitle className="text-xl font-bold text-white">{title}</DialogTitle>
            <DialogDescription className="text-sm text-white/70">{description}</DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Form body ── */}
        <div className="px-6 py-6 -mt-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(field => (
                <div
                  key={field.name}
                  className={field.span === 2 ? "sm:col-span-2" : "sm:col-span-1"}
                >
                  <Label htmlFor={field.name} className="text-xs font-semibold text-slate-600 mb-1.5 block">
                    {field.label}
                    {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                  </Label>

                  {field.type === "select" ? (
                    <Select
                      value={values[field.name] ?? ""}
                      onValueChange={(val) => handleChange(field.name, val)}
                    >
                      <SelectTrigger
                        id={field.name}
                        className={`rounded-xl text-sm ${errors[field.name] ? "border-rose-400 focus-visible:ring-rose-300" : "border-slate-200 focus-visible:ring-violet-400"}`}
                      >
                        <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={values[field.name] ?? ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`rounded-xl text-sm resize-none ${errors[field.name] ? "border-rose-400 focus-visible:ring-rose-300" : "border-slate-200 focus-visible:ring-violet-400"}`}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={values[field.name] ?? ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`rounded-xl text-sm ${errors[field.name] ? "border-rose-400 focus-visible:ring-rose-300" : "border-slate-200 focus-visible:ring-violet-400"}`}
                    />
                  )}

                  {errors[field.name] && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 pb-6 pt-0 gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2 shadow-sm shadow-violet-200"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}