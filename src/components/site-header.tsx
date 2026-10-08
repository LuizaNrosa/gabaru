import Link from "next/link";
import { Wordmark } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-8 sm:px-8">
      <Link href="/" aria-label="GABARU, página inicial" className="block">
        <Wordmark className="h-auto w-28 text-ink sm:w-36" />
      </Link>
      <Link
        href="/login"
        className="flex min-h-12 items-center text-[15px] font-semibold hover:text-rosa"
      >
        Entrar
      </Link>
    </header>
  );
}
