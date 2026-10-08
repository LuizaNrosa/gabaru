import { Wordmark } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-6xl border-t border-n2 px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Wordmark className="h-auto w-24 text-ink" />
        <p className="font-mono text-xs text-n5">gabaru.com.br · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
