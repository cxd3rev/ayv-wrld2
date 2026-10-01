"use client";

import { FormError } from "@/components/ui/form-error";
import { importCustomers } from "@/products/onderhoud/actions";
import { useState } from "react";

export function CustomerImport() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setMessage("");
    setPending(true);
    const result = await importCustomers(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const failed = result.errors.length ? ` ${result.errors.length} rijen zijn overgeslagen.` : "";
    setMessage(`${result.imported} klanten geïmporteerd.${failed}`);
  }

  return (
    <form action={onSubmit} className="mt-8 flex flex-wrap items-end gap-3">
      <label className="text-sm">
        Importeer CSV
        <input name="file" type="file" accept=".csv,text/csv" required className="mt-2 block text-sm" />
      </label>
      <button type="submit" disabled={pending} className="button-secondary">
        {pending ? "Bezig…" : "Importeren"}
      </button>
      <a href="/dashboard/klanten/export" className="button-secondary">Exporteer CSV</a>
      <p className="w-full text-xs text-muted">Kolommen: naam, email, telefoon, straat, postcode, gemeente, brandstof, vermogen_kw, geplaatst_op, laatste_onderhoud. In Excel: opslaan als CSV.</p>
      <FormError message={error} />
      {message ? <p className="w-full text-sm">{message}</p> : null}
    </form>
  );
}
