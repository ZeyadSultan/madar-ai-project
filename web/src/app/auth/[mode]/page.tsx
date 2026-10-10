import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Brand } from "@/components/Brand";
import { AuthForm } from "./AuthForm";

type Props = {
  params: Promise<{ mode: string }>;
  searchParams: Promise<{ next?: string; signedout?: string }>;
};

export default function AuthPage({ params, searchParams }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex h-[76px] w-full max-w-[1200px] items-center px-4 tab:px-6 desk:px-8">
        <Brand />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 tab:pt-12">
        {/* params/searchParams are runtime data, so they are read inside Suspense */}
        <Suspense>
          <AuthContent params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function AuthContent({ params, searchParams }: Props) {
  const { mode } = await params;
  const { next, signedout } = await searchParams;
  if (mode !== "sign-in" && mode !== "sign-up") notFound();

  // Only allow same-site relative redirects.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return <AuthForm mode={mode} next={safeNext} signedOut={signedout === "1"} />;
}
