import { LegalPage } from "@/components/marketing/legal-page";
import { productLegal } from "@/config/legal";
import type { Metadata } from "next";

const document = productLegal().terms;

export const metadata: Metadata = {
  title: document.title,
  description: document.description,
  alternates: { canonical: "/voorwaarden" },
  openGraph: { title: document.title, description: document.description, url: "/voorwaarden" },
};

export default function TermsPage() {
  return <LegalPage document={document} draft />;
}
