import { LegalPage } from "@/components/marketing/legal-page";
import { productLegal } from "@/config/legal";
import type { Metadata } from "next";

const document = productLegal().processor;

export const metadata: Metadata = {
  title: document.title,
  description: document.description,
  alternates: { canonical: "/verwerkersovereenkomst" },
  openGraph: { title: document.title, description: document.description, url: "/verwerkersovereenkomst" },
};

export default function ProcessorPage() {
  return <LegalPage document={document} draft />;
}
