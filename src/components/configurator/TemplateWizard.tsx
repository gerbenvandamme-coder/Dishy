"use client";

import { useId, useState } from "react";
import { Check, ChefHat, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  neoButton,
  neoCard,
  neoToggle,
  pillInset,
  pillRaised,
} from "@/components/dishes/neo";
import { suggestDishName, type Draft } from "@/components/configurator/draft";
import {
  DISH_TEMPLATES,
  draftFromPicks,
  type Picks,
  type TemplateSection,
} from "@/components/configurator/templates";
import { wizardTrigger } from "@/components/configurator/styles";

type Direction = "forward" | "back";

interface TemplateWizardProps {
  /** True when the user already has ingredients selected, which applying a template replaces. */
  hasExistingDraft: boolean;
  onApply: (draft: Draft) => void;
}

/**
 * Step-by-step wizard with five predefined meal formulas. Picks stay local until the
 * user finishes the last step, then they replace the dish being composed.
 */
export function TemplateWizard({ hasExistingDraft, onApply }: TemplateWizardProps) {
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const panelId = `${baseId}-panel`;

  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>("forward");
  const [picks, setPicks] = useState<Picks>({});

  const template = DISH_TEMPLATES.find((candidate) => candidate.id === templateId) ?? null;
  const step = template ? template.steps[stepIndex] : null;
  const isLastStep = template ? stepIndex === template.steps.length - 1 : false;

  const missing = step
    ? step.sections.filter((section) => section.required && (picks[section.id] ?? []).length === 0)
    : [];
  const previewName = template ? suggestDishName(draftFromPicks(template, picks)) : "";

  const chooseTemplate = (id: string) => {
    setTemplateId(id);
    setStepIndex(0);
    setPicks({});
    setDirection("forward");
  };

  const backToPicker = () => {
    setTemplateId(null);
    setStepIndex(0);
    setPicks({});
  };

  const togglePick = (section: TemplateSection, label: string) =>
    setPicks((previous) => {
      const current = previous[section.id] ?? [];
      const selected = current.includes(label);
      let next: readonly string[];
      if (section.mode === "multi") {
        next = selected ? current.filter((item) => item !== label) : [...current, label];
      } else if (selected) {
        // A required single choice behaves like a radio group: it cannot be emptied.
        next = section.required ? current : [];
      } else {
        next = [label];
      }
      return { ...previous, [section.id]: next };
    });

  const goBack = () => {
    if (stepIndex === 0) {
      backToPicker();
      return;
    }
    setDirection("back");
    setStepIndex(stepIndex - 1);
  };

  const goNext = () => {
    if (missing.length > 0) return;
    setDirection("forward");
    setStepIndex(stepIndex + 1);
  };

  const apply = () => {
    if (!template || missing.length > 0) return;
    onApply(draftFromPicks(template, picks));
    setOpen(false);
    backToPicker();
  };

  const stepAnimation =
    direction === "forward"
      ? "animate-in fade-in slide-in-from-right-4 duration-300 motion-reduce:animate-none"
      : "animate-in fade-in slide-in-from-left-4 duration-300 motion-reduce:animate-none";

  return (
    <section className="tactile-raised rounded-3xl p-4 sm:p-6">
      <h2 className="font-display text-xl font-extrabold">
        <button
          id={triggerId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((previous) => !previous)}
          className={wizardTrigger}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl tactile-sunken">
            <ChefHat className="size-6" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-lg leading-tight font-extrabold sm:text-xl">
              Snel Samenstellen via Template
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              Vijf formules uit onze familiemaaltijden, in een paar tikken klaar.
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </h2>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="mt-5 flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-300 motion-reduce:animate-none"
        >
          {template === null || step === null ? (
            <>
              <p className="text-sm text-muted-foreground">Kies een formule om mee te starten.</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {DISH_TEMPLATES.map((candidate) => (
                  <li key={candidate.id} className="sm:last:col-span-2">
                    <button
                      type="button"
                      onClick={() => chooseTemplate(candidate.id)}
                      className={cn(neoCard, "h-full")}
                    >
                      <span className="text-3xl" aria-hidden>
                        {candidate.emoji}
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="font-display text-lg font-extrabold">{candidate.name}</span>
                        <span className="text-sm text-muted-foreground">{candidate.tagline}</span>
                      </span>
                      <span className={cn(pillInset, "self-start")}>
                        {candidate.steps.length} stappen
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-lg font-extrabold">
                  <span aria-hidden>{template.emoji} </span>
                  {template.name}
                </p>
                <button type="button" onClick={backToPicker} className={neoButton}>
                  <RotateCcw className="size-4" aria-hidden />
                  Andere template
                </button>
              </div>

              <ol className="flex flex-wrap gap-2" aria-label="Stappen">
                {template.steps.map((item, index) => {
                  const current = index === stepIndex;
                  const done = index < stepIndex;
                  return (
                    <li
                      key={item.id}
                      aria-current={current ? "step" : undefined}
                      className={current ? cn(pillInset, "text-foreground") : pillRaised}
                    >
                      {done && <Check className="size-3.5" aria-hidden />}
                      {index + 1}. {item.title}
                    </li>
                  );
                })}
              </ol>

              <div key={step.id} className={cn("flex flex-col gap-5", stepAnimation)}>
                <div>
                  <h3 className="font-display text-xl font-extrabold">
                    Stap {stepIndex + 1}: {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>

                {step.sections.map((section) => {
                  const labelId = `${baseId}-${section.id}`;
                  const chosen = picks[section.id] ?? [];
                  const multi = section.mode === "multi";
                  return (
                    <div
                      key={section.id}
                      role="group"
                      aria-labelledby={labelId}
                      className="flex flex-col gap-3"
                    >
                      <p
                        id={labelId}
                        className={step.sections.length > 1 ? "text-sm font-semibold" : "sr-only"}
                      >
                        {section.label}
                        {!section.required && (
                          <span className="font-normal text-muted-foreground"> (optioneel)</span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {section.options.map((option) => {
                          const checked = chosen.includes(option.label);
                          return (
                            <button
                              key={option.label}
                              type="button"
                              role={multi ? "checkbox" : undefined}
                              aria-checked={multi ? checked : undefined}
                              aria-pressed={multi ? undefined : checked}
                              onClick={() => togglePick(section, option.label)}
                              className={cn(neoToggle(checked), "text-left")}
                            >
                              {multi ? (
                                <span
                                  aria-hidden
                                  className="flex size-5 shrink-0 items-center justify-center rounded-md bg-(--tactile-bg) neo-inset"
                                >
                                  {checked && <Check className="size-3.5" />}
                                </span>
                              ) : (
                                checked && <Check className="size-4" aria-hidden />
                              )}
                              <span className="flex flex-col">
                                <span>{option.label}</span>
                                {option.hint && (
                                  <span className="text-xs font-normal text-muted-foreground">
                                    {option.hint}
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-1 text-sm">
                {previewName && (
                  <p>
                    <span className="text-muted-foreground">Tot nu toe: </span>
                    <span className="font-semibold">{previewName}</span>
                  </p>
                )}
                {missing.length > 0 && (
                  <p role="status" className="text-muted-foreground">
                    Nog te kiezen: {missing.map((section) => section.label).join(", ")}.
                  </p>
                )}
                {isLastStep && hasExistingDraft && (
                  <p className="text-muted-foreground">
                    Dit vervangt de ingrediënten die je hieronder al gekozen hebt.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button type="button" onClick={goBack} className={neoButton}>
                  <ChevronLeft className="size-4" aria-hidden />
                  Terug
                </button>
                {isLastStep ? (
                  <button
                    type="button"
                    onClick={apply}
                    disabled={missing.length > 0}
                    className={neoButton}
                  >
                    <Check className="size-4" aria-hidden />
                    Gebruik dit gerecht
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={missing.length > 0}
                    className={neoButton}
                  >
                    Volgende
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}