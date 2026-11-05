"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { Check, Clock, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Dish, IngredientGroup } from "@/types/dish";
import { cn } from "@/lib/utils";
import { DISH_IMAGE_ACCEPT, uploadDishImage } from "@/lib/dishImages";
import { DishImage } from "@/components/dishes/DishImage";
import {
  DETAIL_PILLARS,
  createId,
  normalizeName,
  safeImageUrl,
  sameName,
} from "@/components/dishes/dishHelpers";
import {
  dialogSurface,
  neoButton,
  neoIconButton,
  neoSection,
  neoToggle,
  neoWell,
  pillInset,
  pillRaised,
  sageButton,
} from "@/components/dishes/neo";

/* ------------------------------------------------------------------ */
/* Small building blocks                                              */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, error, className, children }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm font-medium", className)}>
      {label}
      {children}
      {error && (
        <span role="alert" className="text-xs font-normal text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}

interface AddRowProps {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
}

/** Debossed text input with an add button. Enter submits. */
function AddRow({ label, placeholder, onAdd }: AddRowProps) {
  const [value, setValue] = useState("");
  const isEmpty = normalizeName(value).length === 0;

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (isEmpty) return;
        onAdd(value);
        setValue("");
      }}
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        maxLength={80}
        className={neoWell}
      />
      <button type="submit" disabled={isEmpty} aria-label={`${label}: toevoegen`} className={neoIconButton}>
        <Plus className="size-4" aria-hidden />
      </button>
    </form>
  );
}

interface IngredientPillProps {
  name: string;
  optional: boolean;
  active: boolean;
  onRemove?: () => void;
}

function IngredientPill({ name, optional, active, onRemove }: IngredientPillProps) {
  return (
    <span className={cn(pillRaised, "text-sm", !active && "opacity-55")}>
      {name}
      {optional && (
        <span className="text-[0.7rem] font-normal tracking-wide text-muted-foreground uppercase">
          optioneel
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Verwijder ${name}`}
          className="-mr-1 inline-flex size-5 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Modal body (remounted per dish, so its state resets on every open)  */
/* ------------------------------------------------------------------ */

interface DishDetailBodyProps {
  dish: Dish;
  editMode: boolean;
  isNew: boolean;
  initialActiveVariations?: string[];
  onActiveVariationsChange?: (variations: string[]) => void;
  onCancel: () => void;
  onSave: (dish: Dish) => void;
  onRequestDelete: (dish: Dish) => void;
}

function DishDetailBody({
  dish,
  editMode,
  isNew,
  initialActiveVariations,
  onActiveVariationsChange,
  onCancel,
  onSave,
  onRequestDelete,
}: DishDetailBodyProps) {
  const idBase = useId();
  const [draft, setDraft] = useState<Dish>(dish);
  const [activeVariations, setActiveVariations] = useState<string[]>(initialActiveVariations ?? []);
  const [nameError, setNameError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const current = editMode ? draft : dish;
  const variations = current.variations ?? [];

  /* Edit-mode handlers (the draft is only ever replaced, never mutated) */

  const updateDraft = (patch: Partial<Dish>) => setDraft((previous) => ({ ...previous, ...patch }));

  const handlePhotoFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the input so choosing the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    uploadDishImage(file)
      .then((url) => {
        updateDraft({ imageUrl: url });
        setImageError(false);
      })
      .catch((error: unknown) => {
        setUploadError(
          error instanceof Error ? error.message : "De foto kon niet worden geüpload.",
        );
      })
      .finally(() => setUploading(false));
  };

  const addIngredient = (group: IngredientGroup, rawName: string) => {
    const name = normalizeName(rawName);
    if (!name) return;
    setDraft((previous) => {
      const exists = previous.ingredients.some(
        (ingredient) => ingredient.group === group && sameName(ingredient.name, name),
      );
      if (exists) return previous;
      return {
        ...previous,
        ingredients: [
          ...previous.ingredients,
          { id: createId("ing"), name, group, isSelected: true },
        ],
      };
    });
  };

  const removeIngredient = (id: string) =>
    setDraft((previous) => ({
      ...previous,
      ingredients: previous.ingredients.filter((ingredient) => ingredient.id !== id),
    }));

  const addVariation = (rawName: string) => {
    const name = normalizeName(rawName);
    if (!name) return;
    setDraft((previous) => {
      const list = previous.variations ?? [];
      if (list.some((existing) => sameName(existing, name))) return previous;
      return { ...previous, variations: [...list, name] };
    });
  };

  const removeVariation = (name: string) =>
    setDraft((previous) => ({
      ...previous,
      variations: (previous.variations ?? []).filter((existing) => existing !== name),
    }));

  const handleSave = () => {
    if (uploading) return;
    const name = normalizeName(draft.name);
    const rawImage = (draft.imageUrl ?? "").trim();
    const imageUrl = safeImageUrl(rawImage);
    const invalidName = name.length === 0;
    const invalidImage = rawImage.length > 0 && !imageUrl;

    setNameError(invalidName);
    setImageError(invalidImage);
    if (invalidName || invalidImage) return;

    const prepTime = normalizeName(draft.prepTime ?? "");
    const notes = (draft.notes ?? "").trim();
    const list = draft.variations ?? [];

    onSave({
      ...draft,
      name,
      imageUrl,
      prepTime: prepTime || undefined,
      notes: notes || undefined,
      variations: list.length > 0 ? list : undefined,
    });
  };

  /* View-mode handler */

  const toggleVariation = (name: string) => {
    const next = activeVariations.includes(name)
      ? activeVariations.filter((item) => item !== name)
      : [...activeVariations, name];
    setActiveVariations(next);
    onActiveVariationsChange?.(next);
  };

  /** An optional ingredient only counts when a variation with the same name is switched on. */
  const isActive = (name: string, optional: boolean | undefined) =>
    editMode || !optional || activeVariations.some((variation) => sameName(variation, name));

  return (
    <div className="-m-2 flex min-h-0 min-w-0 flex-col gap-6 overflow-y-auto overscroll-contain p-2 break-words">
      <DishImage
        src={safeImageUrl(current.imageUrl ?? "")}
        alt={current.name || "Nieuw gerecht"}
        className="aspect-[16/10] w-full"
      />

      <DialogHeader className="pr-10">
        {editMode ? (
          <>
            <DialogTitle className="sr-only">
              {isNew ? "Nieuw gerecht" : `Bewerk ${dish.name}`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Pas de gegevens, ingrediënten en varianten van dit gerecht aan.
            </DialogDescription>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Naam"
                className="sm:col-span-2"
                error={nameError ? "Geef het gerecht een naam." : undefined}
              >
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft({ name: event.target.value })}
                  aria-invalid={nameError}
                  maxLength={120}
                  placeholder="Bijvoorbeeld: Stoofvlees met friet"
                  className={neoWell}
                />
              </Field>
              <Field label="Bereidingstijd">
                <input
                  value={draft.prepTime ?? ""}
                  onChange={(event) => updateDraft({ prepTime: event.target.value })}
                  maxLength={30}
                  placeholder="Bijvoorbeeld: 30 min"
                  className={neoWell}
                />
              </Field>
              <Field
                label="Foto-link"
                error={
                  imageError
                    ? "Geef een geldige link die met http of https begint."
                    : (uploadError ?? undefined)
                }
              >
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    value={draft.imageUrl ?? ""}
                    onChange={(event) => updateDraft({ imageUrl: event.target.value })}
                    aria-invalid={imageError}
                    placeholder="https://"
                    className={neoWell}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={neoButton}
                  >
                    {uploading ? (
                      <Loader2 aria-hidden className="size-4 animate-spin" />
                    ) : (
                      <ImagePlus aria-hidden className="size-4" />
                    )}
                    {uploading ? "Uploaden…" : "Foto uploaden"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={DISH_IMAGE_ACCEPT}
                    onChange={handlePhotoFile}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                  />
                </div>
              </Field>
              <Field label="Notities" className="sm:col-span-2">
                <textarea
                  value={draft.notes ?? ""}
                  onChange={(event) => updateDraft({ notes: event.target.value })}
                  rows={3}
                  maxLength={500}
                  className={cn(neoWell, "min-h-20 resize-y")}
                />
              </Field>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="text-2xl leading-tight font-semibold tracking-tight text-balance">
              {dish.name}
            </DialogTitle>
            {dish.prepTime && (
              <span className={cn(pillInset, "w-fit")}>
                <Clock className="size-3.5" aria-hidden />
                {dish.prepTime}
              </span>
            )}
            {dish.notes ? (
              <DialogDescription className="text-sm leading-relaxed">{dish.notes}</DialogDescription>
            ) : (
              <DialogDescription className="sr-only">Details van {dish.name}.</DialogDescription>
            )}
          </>
        )}
      </DialogHeader>

      <div className="flex flex-col gap-4">
        {DETAIL_PILLARS.map((pillar) => {
          const items = current.ingredients.filter((ingredient) => ingredient.group === pillar.group);
          if (!editMode && items.length === 0) return null;
          const headingId = `${idBase}-${pillar.group}`;

          return (
            <section
              key={pillar.group}
              aria-labelledby={headingId}
              className={cn(neoSection, "flex flex-col gap-3")}
            >
              <div>
                <h3 id={headingId} className="text-sm font-semibold">
                  {pillar.title}
                </h3>
                <p className="text-xs text-muted-foreground">{pillar.hint}</p>
              </div>

              {items.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {items.map((ingredient) => (
                    <li key={ingredient.id}>
                      <IngredientPill
                        name={ingredient.name}
                        optional={Boolean(ingredient.isOptional)}
                        active={isActive(ingredient.name, ingredient.isOptional)}
                        onRemove={editMode ? () => removeIngredient(ingredient.id) : undefined}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">Nog niets toegevoegd.</p>
              )}

              {editMode && (
                <AddRow
                  label={`${pillar.title} toevoegen`}
                  placeholder="Nieuw ingrediënt"
                  onAdd={(value) => addIngredient(pillar.group, value)}
                />
              )}
            </section>
          );
        })}

        {(editMode || variations.length > 0) && (
          <section
            aria-labelledby={`${idBase}-variations`}
            className={cn(neoSection, "flex flex-col gap-3")}
          >
            <div>
              <h3 id={`${idBase}-variations`} className="text-sm font-semibold">
                Varianten
              </h3>
              <p className="text-xs text-muted-foreground">
                {editMode ? "Voeg eigen varianten toe of haal ze weg." : "Tik om een variant aan of uit te zetten."}
              </p>
            </div>

            {editMode ? (
              <>
                {variations.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {variations.map((variation) => (
                      <li key={variation}>
                        <span className={cn(pillInset, "text-sm")}>
                          {variation}
                          <button
                            type="button"
                            onClick={() => removeVariation(variation)}
                            aria-label={`Verwijder variant ${variation}`}
                            className="-mr-1 inline-flex size-5 cursor-pointer items-center justify-center rounded-full hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring"
                          >
                            <X className="size-3.5" aria-hidden />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <AddRow label="Variant toevoegen" placeholder="Nieuwe variant" onAdd={addVariation} />
              </>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {variations.map((variation) => {
                  const pressed = activeVariations.includes(variation);
                  return (
                    <li key={variation}>
                      <button
                        type="button"
                        aria-pressed={pressed}
                        onClick={() => toggleVariation(variation)}
                        className={neoToggle(pressed)}
                      >
                        {pressed && <Check className="size-4" aria-hidden />}
                        {variation} toevoegen
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>

      {editMode && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isNew ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={() => onRequestDelete(dish)}
              className={cn(neoButton, "text-destructive")}
            >
              <Trash2 className="size-4" aria-hidden />
              Verwijderen
            </button>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={onCancel} className={neoButton}>
              Annuleren
            </button>
            <button type="button" onClick={handleSave} className={sageButton}>
              <Save className="size-4" aria-hidden />
              Opslaan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Public component                                                   */
/* ------------------------------------------------------------------ */

interface DishDetailModalProps {
  dish: Dish | null;
  open: boolean;
  editMode: boolean;
  /** True when the dish has not been saved to the library yet. */
  isNew: boolean;
  /** Variations that start switched on (for example the ones planned for a day). */
  activeVariations?: string[];
  onActiveVariationsChange?: (variations: string[]) => void;
  onOpenChange: (open: boolean) => void;
  onSave: (dish: Dish) => void;
  onRequestDelete: (dish: Dish) => void;
}

/** Raised dialog with the dish photo, grouped ingredients and variations. Editable in edit mode. */
export function DishDetailModal({
  dish,
  open,
  editMode,
  isNew,
  activeVariations,
  onActiveVariationsChange,
  onOpenChange,
  onSave,
  onRequestDelete,
}: DishDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogSurface, "max-h-[92dvh] sm:max-w-2xl")}>
        {dish && (
          <DishDetailBody
            key={dish.id}
            dish={dish}
            editMode={editMode}
            isNew={isNew}
            onCancel={() => onOpenChange(false)}
            initialActiveVariations={activeVariations}
            onActiveVariationsChange={onActiveVariationsChange}
            onSave={onSave}
            onRequestDelete={onRequestDelete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}