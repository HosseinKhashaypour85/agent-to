import { Plus } from "lucide-react";

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: string;
}) {
  return (
    <div className="relative mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      {/* Soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-0 h-40 w-40 rounded-full bg-[#10706B]/5 blur-3xl"
      />

      {/* Left: title block */}
      <div className="relative">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#DDEFEA] bg-[#F2F9F8] px-2.5 py-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10706B] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#10706B]" />
          </span>
          <span className="text-[10px] font-black tracking-[.2em] text-[#0B5B57]">
            {eyebrow || "AGENT-TO"}
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-[#0B2B29] md:text-[28px]">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#7A8785]">
            {description}
          </p>
        )}
      </div>

      {/* Right: action button */}
      {action && (
        <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B5B57] via-[#10706B] to-[#0B5B57] px-4 py-2.5 text-[13px] font-black text-white shadow-[0_10px_24px_-10px_rgba(16,112,107,0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-10px_rgba(16,112,107,0.9)]">
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          <span className="relative grid h-6 w-6 place-items-center rounded-lg bg-white/15">
            <Plus
              size={14}
              strokeWidth={2.6}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
          </span>
          <span className="relative">{action}</span>
        </button>
      )}
    </div>
  );
}