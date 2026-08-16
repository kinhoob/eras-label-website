import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Clock3, LockKeyhole } from "lucide-react";
import type { StorefrontConfig } from "../../../shared/storefront";
import { getDropRemainingTime } from "../../../shared/storefront-logic";

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
  const units = useMemo(() => [
    [remaining.days, "dias"],
    [remaining.hours, "horas"],
    [remaining.minutes, "min"],
    [remaining.seconds, "seg"],
  ] as const, [remaining]);

  return (
    <div className="mt-10 w-full max-w-xl border border-[#d8d0c6] bg-white/60 p-5 text-center shadow-[0_18px_50px_rgba(30,26,20,0.08)]" aria-live="polite" role="status">
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
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f3ee] px-5 py-16 text-[#24211e] sm:px-8">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#b22222]/[0.06] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[#b22222]/[0.05] blur-3xl" aria-hidden="true" />
      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        <Link href="/" className="mb-14 text-2xl font-black tracking-[-0.1em] text-[#24211e]" aria-label="Eras Label">
          ERAS<span className="text-[#b22222]">.</span>
        </Link>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8d0c6] bg-white/70 text-[#b22222]">
          <LockKeyhole size={23} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.28em] text-[#b22222]">ERAS LABEL · EM BREVE</p>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{config.maintenance.title}</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#6e675f] sm:text-lg">{config.maintenance.message}</p>
        {config.drop.enabled && config.drop.targetAt && <DropCountdown config={config} />}
        <Link href="/admin" className="mt-10 inline-flex items-center gap-2 border border-[#24211e] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:bg-[#24211e] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b22222] focus-visible:ring-offset-2">
          {config.maintenance.accessLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
