import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Clock3, KeyRound, LockKeyhole, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import type { StorefrontConfig } from "../../../shared/storefront";
import { getDropRemainingTime } from "../../../shared/storefront-logic";
import { trpc } from "@/lib/trpc";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function DropCountdown({ config }: { config: StorefrontConfig }) {
  const [remaining, setRemaining] = useState(() => getDropRemainingTime(config.drop.targetAt));

  useEffect(() => {
    const update = () => setRemaining(getDropRemainingTime(config.drop.targetAt));
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [config.drop.targetAt]);

  const hasStarted = remaining.total <= 0;
  const units = useMemo(
    () => [
      [remaining.days, "dias"],
      [remaining.hours, "horas"],
      [remaining.minutes, "min"],
      [remaining.seconds, "seg"],
    ] as const,
    [remaining],
  );

  return (
    <div className="mt-8 w-full max-w-xl border border-[#d8d0c6] bg-white/60 p-5 text-center shadow-[0_18px_50px_rgba(30,26,20,0.08)]" aria-live="polite" role="status">
      <div className="mb-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#8d3326]">
        <Clock3 size={14} aria-hidden="true" />
        <span>{config.drop.title}</span>
      </div>
      {hasStarted ? (
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#24211e]">O drop está a começar.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {units.map(([value, label]) => (
            <div key={label} className="border border-[#e2dbd2] bg-[#f8f5f0] px-2 py-3">
              <strong className="block text-2xl font-semibold tracking-[-0.05em] text-[#24211e] sm:text-3xl">{pad(value)}</strong>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-[#8b847b]">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StorefrontLockedPage({ config }: { config: StorefrontConfig }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const unlockMutation = trpc.catalog.unlockStorefront.useMutation({
    onSuccess: () => {
      toast.success("Acesso autorizado. A abrir a loja…");
      window.location.reload();
    },
    onError: (mutationError) => {
      setError(mutationError.message || "Não foi possível validar a palavra-passe.");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!password.trim()) {
      setError("Insira a palavra-passe para continuar.");
      return;
    }
    unlockMutation.mutate({ password });
  };

  return (
    <main className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto bg-[#f6f3ee] px-5 py-12 text-[#24211e] sm:px-8">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#b22222]/[0.06] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[#b22222]/[0.05] blur-3xl" aria-hidden="true" />
      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        <Link href="/" className="mb-10 text-2xl font-black tracking-[-0.1em] text-[#24211e]" aria-label="Eras Label">
          ERAS<span className="text-[#b22222]">.</span>
        </Link>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8d0c6] bg-white/70 text-[#b22222]">
          <LockKeyhole size={23} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.28em] text-[#b22222]">ERAS LABEL · ACESSO ANTECIPADO</p>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{config.maintenance.title}</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#6e675f] sm:text-lg">{config.maintenance.message}</p>

        {config.maintenance.passwordConfigured ? (
          <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md border border-[#d8d0c6] bg-white/75 p-5 text-left shadow-[0_18px_50px_rgba(30,26,20,0.08)] sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b22222]/10 text-[#b22222]">
                <KeyRound size={17} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b22222]">Acesso reservado</p>
                <p className="mt-1 text-sm text-[#6e675f]">Insira a palavra-passe recebida.</p>
              </div>
            </div>
            <label htmlFor="storefront-access-password" className="sr-only">Palavra-passe</label>
            <input
              id="storefront-access-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Palavra-passe"
              disabled={unlockMutation.isPending}
              className="h-12 w-full border border-[#d8d0c6] bg-[#fdfbf8] px-4 text-sm outline-none transition placeholder:text-[#9c9388] focus:border-[#b22222] focus:ring-2 focus:ring-[#b22222]/15"
            />
            {error && <p className="mt-3 text-sm font-medium text-[#b22222]" role="alert">{error}</p>}
            <button type="submit" disabled={unlockMutation.isPending} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 bg-[#24211e] px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#b22222] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b22222] focus-visible:ring-offset-2">
              {unlockMutation.isPending ? <><LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> A validar…</> : <>{config.maintenance.accessLabel}<ArrowRight size={15} aria-hidden="true" /></>}
            </button>
          </form>
        ) : (
          <div className="mt-8 max-w-md border border-[#d8d0c6] bg-white/70 p-5 text-sm leading-6 text-[#6e675f]">
            O acesso reservado ainda não foi configurado. O administrador pode defini-lo no painel, em <strong className="text-[#24211e]">Página em construção</strong>.
          </div>
        )}

        {config.drop.enabled && config.drop.targetAt && <DropCountdown config={config} />}
        <Link href="/admin" className="mt-8 inline-flex items-center gap-2 border border-[#24211e] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:bg-[#24211e] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b22222] focus-visible:ring-offset-2">
          Acesso administrativo
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
