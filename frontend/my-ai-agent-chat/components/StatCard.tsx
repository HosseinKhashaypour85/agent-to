import { LucideIcon, ArrowUpLeft, TrendingUp } from "lucide-react";

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  caption,
}: {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  caption?: string;
}) {
  return (
    <div className="panel group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(16,112,107,0.45)]">
      {/* Corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#10706B]/5 blur-2xl transition-opacity duration-300 group-hover:bg-[#10706B]/10"
      />

      {/* Top hairline on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-l from-transparent via-[#10706B]/50 to-transparent transition-transform duration-500 group-hover:scale-x-100" />

      <div className="relative flex items-start justify-between">
        <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#E8F5F3] to-[#DDEFEA] text-[#10706B] shadow-[inset_0_0_0_1px_rgba(16,112,107,0.08)] transition-transform duration-300 group-hover:scale-105">
          <Icon size={20} strokeWidth={2.2} />
        </div>

        {change && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-[#EDF8F2] px-2 py-1 text-[11px] font-bold text-[#248357] ring-1 ring-[#C9EBD9]">
            <ArrowUpLeft size={12} strokeWidth={2.6} />
            {change}
          </span>
        )}
      </div>

      <div className="relative mt-5 flex items-end gap-2">
        <span className="text-2xl font-black tracking-tight text-[#0B2B29]">
          {value}
        </span>
        <span className="mb-1 inline-flex items-center gap-0.5 text-[10px] font-bold text-[#248357]">
          <TrendingUp size={11} strokeWidth={2.6} />
          رشد
        </span>
      </div>

      <div className="relative mt-1 text-xs font-bold text-[#5A6765]">
        {title}
      </div>

      {caption && (
        <div className="relative mt-3 flex items-center gap-1.5 text-[10px] font-medium text-[#9AA5A3]">
          <span className="inline-block h-1 w-1 rounded-full bg-[#10706B]/40" />
          {caption}
        </div>
      )}
    </div>
  );
}