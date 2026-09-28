import { PublicShell } from "@/components/marketing/public-site";
import { legalContact, type getLegalCopy } from "@/config/legal";

type DocumentCopy = ReturnType<typeof getLegalCopy>["terms"];

export function LegalPage({ document }: { document: DocumentCopy }) {
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto w-full max-w-3xl px-6 py-20 lg:py-28">
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">{document.updated}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{document.title}</h1>
        <p className="mt-6 text-base leading-relaxed text-white/70">{document.intro}</p>
        <div className="mt-12 space-y-10">
          {document.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              {section.paragraphs.map((paragraph) => {
                const [before, after] = paragraph.split(legalContact);
                return (
                  <p key={paragraph} className="mt-3 text-sm leading-relaxed text-white/70">
                    {after === undefined ? (
                      paragraph
                    ) : (
                      <>
                        {before}
                        <a className="underline decoration-white/30 underline-offset-4 hover:text-white" href={`mailto:${legalContact}`}>
                          {legalContact}
                        </a>
                        {after}
                      </>
                    )}
                  </p>
                );
              })}
            </section>
          ))}
        </div>
      </main>
    </PublicShell>
  );
}
