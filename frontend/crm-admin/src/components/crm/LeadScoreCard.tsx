"use client";

import { cn } from "@/lib/cn";
import { TrendingUp, Target, AlertCircle, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { LeadScore } from "@/lib/types";
import { getTemperatureLabel, getTemperatureColor } from "@/lib/utils";

interface LeadScoreCardProps {
  leadScore: LeadScore | null;
  customerId: string;
  onRecalculate?: () => void;
  loading?: boolean;
}

export function LeadScoreCard({ leadScore, customerId, onRecalculate, loading }: LeadScoreCardProps) {
  if (!leadScore) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Target className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">امتیاز لید محاسبه نشده</h3>
          <p className="text-gray-500 mb-6">هنوز امتیازی برای این مشتری محاسبه نشده است</p>
          <Button onClick={onRecalculate} loading={loading}>
            محاسبه امتیاز
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { score, temperature, reasons, aiAnalysis, lastCalculatedAt } = leadScore;
  const tempLabel = getTemperatureLabel(temperature);
  const tempColor = getTemperatureColor(temperature);

  return (
    <Card variant="hover">
      <CardContent className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={temperature.toLowerCase() as "hot" | "warm" | "cold"} size="lg">
                {tempLabel}
              </Badge>
              {lastCalculatedAt && (
                <span className="text-sm text-gray-500">
                  بروزرسانی: {new Date(lastCalculatedAt).toLocaleString("fa-IR")}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">امتیاز لید بر اساس رفتار و تعاملات مشتری</p>
          </div>
          <Button variant="secondary" size="sm" onClick={onRecalculate} loading={loading}>
            محاسبه مجدد
          </Button>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-4xl font-bold text-gray-900">{score}</span>
            <span className="text-lg text-gray-500">/ 100</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                temperature === "HOT" && "bg-gradient-to-r from-red-500 to-red-600",
                temperature === "WARM" && "bg-gradient-to-r from-amber-500 to-amber-600",
                temperature === "COLD" && "bg-gradient-to-r from-blue-500 to-blue-600"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {reasons.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              دلایل امتیاز
            </h4>
            <div className="space-y-2">
              {reasons.slice(0, 5).map((reason, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm text-gray-700">{reason}</span>
                </div>
              ))}
              {reasons.length > 5 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  و {reasons.length - 5} دلیل دیگر...
                </div>
              )}
            </div>
          </div>
        )}

        {aiAnalysis && (
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              <HelpCircle className="text-gray-400" size={18} />
              تحلیل هوش مصنوعی
              <TrendingUp className="ml-auto text-gray-400 group-open:rotate-180 transition-transform" size={18} />
            </summary>
            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 whitespace-pre-line">
              {aiAnalysis}
            </div>
          </details>
        )}

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-4 bg-primary-light rounded-xl">
            <Target className="text-primary" size={24} />
            <div>
              <p className="font-medium text-primary-dark">پیشنهاد AI</p>
              <p className="text-sm text-primary mt-0.5">
                {temperature === "HOT"
                  ? "این مشتری آماده خرید به نظر می‌رسد. پیشنهاد می‌شود در اسرع وقت پیگیری شود."
                  : temperature === "WARM"
                  ? "مشتری علاقه‌مند است اما هنوز تصمیم خرید قطعی ندارد. اطلاعات بیشتری درباره محصول ارائه دهید."
                  : "فعلاً نشانه خرید قوی مشاهده نشده است."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}