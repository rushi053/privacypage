"use client";

import { useState } from "react";
import { WizardConfig } from "@/lib/wizardConfigs";

interface WizardProps {
  config: WizardConfig;
  onGenerate: (data: Record<string, string>) => void;
  loading: boolean;
}

export default function Wizard({ config, onGenerate, loading }: WizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  const steps = config.steps;
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const canProceed =
    current.type === "multiselect"
      ? (selected[current.id]?.length ?? 0) > 0
      : (data[current.id]?.trim().length ?? 0) > 0;

  const handleNext = () => {
    if (current.type === "multiselect") {
      setData({ ...data, [current.id]: (selected[current.id] || []).join(", ") });
    }
    if (isLast) {
      const finalData: Record<string, string> = { ...data, docType: config.type };
      if (current.type === "multiselect") {
        finalData[current.id] = (selected[current.id] || []).join(", ");
      }
      onGenerate(finalData);
    } else {
      setStep(step + 1);
    }
  };

  const toggleMulti = (option: string) => {
    const prev = selected[current.id] || [];
    if (option === "No Personal Data" || option === "None") {
      setSelected({ ...selected, [current.id]: [option] });
      return;
    }
    const filtered = prev.filter((o) => o !== "No Personal Data" && o !== "None");
    if (filtered.includes(option)) {
      setSelected({ ...selected, [current.id]: filtered.filter((o) => o !== option) });
    } else {
      setSelected({ ...selected, [current.id]: [...filtered, option] });
    }
  };

  return (
    <div className="bg-white border border-ink/10 rounded-[8px] max-w-[720px] mx-auto animate-in">
      {/* Progress rail */}
      <div className="px-6 md:px-8 pt-6 md:pt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[12px] text-seal">§ {step + 1} of {steps.length}</p>
          <p className="text-[12px] uppercase tracking-[0.08em] text-ink/50">{config.displayName}</p>
        </div>
        <ol className="flex gap-1" aria-label="Progress">
          {steps.map((s, i) => (
            <li key={s.id} className="flex-1 min-w-0">
              <span className={`block h-1 rounded-full transition-colors ${i < step ? "bg-seal" : i === step ? "bg-seal/60" : "bg-ink/10"}`} />
              <span className={`mt-2 hidden sm:flex items-center gap-1 text-[12px] truncate ${i === step ? "text-ink" : "text-ink/45"}`}>
                {i < step && <svg aria-hidden viewBox="0 0 24 24" className="w-3 h-3 text-seal shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
                {s.name ?? `Step ${i + 1}`}
              </span>
              <span className="sr-only">{i < step ? " (done)" : i === step ? " (current)" : ""}</span>
            </li>
          ))}
        </ol>
        <p className="sm:hidden mt-2 text-[12px] text-ink">{current.name}</p>
      </div>

      <div className="px-6 md:px-8 py-8">
        <h3 className="font-display text-[24px] md:text-[28px] leading-[1.25] tracking-[-0.01em] mb-2">{current.label}</h3>
        {current.why && <p className="text-[14px] leading-[1.5] text-ink/60 mb-6"><span className="text-seal font-medium">Why we ask: </span>{current.why}</p>}
        {!current.why && <div className="mb-4" />}

        {current.type === "text" && (
          <input
            type="text"
            value={data[current.id] || ""}
            onChange={(e) => setData({ ...data, [current.id]: e.target.value })}
            placeholder={current.placeholder}
            className="w-full h-12 bg-white border border-ink/15 rounded-[8px] px-4 text-[16px] text-ink placeholder-ink/40 focus:outline-none focus:border-seal transition-colors"
            onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
            autoFocus
          />
        )}

        {current.type === "select" && (
          <div className="grid gap-2" role="radiogroup" aria-label={current.label}>
            {current.options!.map((option) => {
              const on = data[current.id] === option;
              return (
                <button
                  key={option}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setData({ ...data, [current.id]: option })}
                  className={`flex items-center gap-4 text-left min-h-12 px-4 py-2 rounded-[8px] border text-[16px] transition-colors ${
                    on ? "border-seal bg-seal-tint text-ink" : "border-ink/15 hover:border-ink/30 text-ink/80 bg-white"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border shrink-0 ${on ? "border-seal border-[5px]" : "border-ink/30"}`} />
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {current.type === "multiselect" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {current.options!.map((option) => {
              const isSelected = (selected[current.id] || []).includes(option);
              return (
                <button
                  key={option}
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => toggleMulti(option)}
                  className={`flex items-center gap-4 text-left min-h-12 px-4 py-2 rounded-[8px] border text-[14px] transition-colors ${
                    isSelected ? "border-seal bg-seal-tint text-ink" : "border-ink/15 hover:border-ink/30 text-ink/80 bg-white"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-[4px] border shrink-0 flex items-center justify-center ${isSelected ? "bg-seal border-seal text-white" : "border-ink/30"}`}>
                    {isSelected && <svg aria-hidden viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center gap-4 px-6 md:px-8 py-6 border-t border-ink/10">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          className={`h-12 px-6 rounded-[8px] text-[16px] border border-ink/15 hover:border-ink/30 text-ink/80 bg-white transition-colors ${step === 0 ? "invisible" : ""}`}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed || loading}
          className="h-12 px-6 rounded-[8px] text-[16px] font-medium bg-seal hover:bg-seal-dark text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg aria-hidden className="w-4 h-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" /></svg>
              Drafting your document…
            </>
          ) : isLast ? (
            `Generate ${config.displayName}`
          ) : (
            "Next"
          )}
        </button>
      </div>
    </div>
  );
}
