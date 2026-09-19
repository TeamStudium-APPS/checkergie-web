import type { ReactNode } from "react";

export const FoundationPage = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => {
  return (
    <main className="min-h-dvh bg-cg-surface px-5 py-8 font-cg-sans text-cg-ink sm:px-10 sm:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-10 border-b border-cg-border pb-8">
          <p className="text-cg-caption-sm text-cg-muted">Foundation / {title}</p>
          <h1 className="cg-text-balance mt-3 text-cg-heading-lg">{title}</h1>
          <p className="cg-text-pretty mt-3 max-w-3xl text-cg-body-md text-cg-muted">{description}</p>
        </header>
        {children}
      </div>
    </main>
  );
};

export const TokenCode = ({ children }: { children: ReactNode }) => {
  return <code className="font-cg-mono text-cg-caption-sm text-cg-ink" translate="no">{children}</code>;
};
