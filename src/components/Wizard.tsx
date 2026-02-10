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
    <div className="glass-card rounded-2xl p-8 md:p-12 max-w-2xl mx-auto animate-in">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-indigo-500" : "bg-zinc-700"
            }`}
          />
        ))}
      </div>

      <div className="mb-2 text-sm text-zinc-500">
        Step {step + 1} of {steps.length}
      </div>
      <h3 className="text-xl font-semibold mb-6">{current.label}</h3>

      {current.type === "text" && (
        <input
          type="text"
          value={data[current.id] || ""}
          onChange={(e) => setData({ ...data, [current.id]: e.target.value })}
          placeholder={current.placeholder}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
          autoFocus
        />
      )}

      {current.type === "select" && (
        <div className="grid gap-2">
          {current.options!.map((option) => (
            <button
              key={option}
              onClick={() => {
                setData({ ...data, [current.id]: option });
              }}
              className={`text-left px-4 py-3 rounded-xl border transition-all ${
                data[current.id] === option
                  ? "border-indigo-500 bg-indigo-500/10 text-white"
                  : "border-zinc-700 hover:border-zinc-500 text-zinc-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {current.type === "multiselect" && (
        <div className="grid grid-cols-2 gap-2">
          {current.options!.map((option) => {
            const isSelected = (selected[current.id] || []).includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleMulti(option)}
                className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/10 text-white"
                    : "border-zinc-700 hover:border-zinc-500 text-zinc-300"
                }`}
              >
                <span className="mr-2">{isSelected ? "✓" : "○"}</span>
                {option}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          className={`px-6 py-3 rounded-xl text-sm font-medium transition-colors ${
            step === 0
              ? "invisible"
              : "border border-zinc-700 hover:border-zinc-500 text-zinc-300"
          }`}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed || loading}
          className="px-8 py-3 rounded-xl text-sm font-medium bg-indigo-500 hover:bg-indigo-400 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : isLast ? (
            `Generate ${config.displayName} →`
          ) : (
            "Next →"
          )}
        </button>
      </div>
    </div>
  );
}
