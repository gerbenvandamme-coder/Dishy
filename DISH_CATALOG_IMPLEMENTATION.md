# Dish Catalog Implementation Summary

## What Was Implemented

### 1. Curated Dish Image URLs
- **Created:** `src/lib/curatedDishImages.ts`
- Contains curated Unsplash image URLs for the first 12 dishes from the original dataset
- Maps dish IDs to their respective high-quality food photos
- Dishes 13-40 have `undefined` image URLs (users can add them via the editable modal)

### 2. Updated Mock Dishes
- **Modified:** `src/lib/mockDishes.ts`
- Imported `CURATED_DISH_IMAGE_URLS` from the new module
- Updated `buildDish()` function to include `imageUrl` in the returned dish object
- All 40 Belgian family dishes now have their image URLs populated (12 with curated URLs, 28 without)

### 3. Preserved Original Image Upload Functionality
- **Restored:** `src/lib/dishImages.ts`
- The original upload functionality (`uploadDishImage`) remains intact
- Supports uploading custom images to Supabase storage
- Max file size: 5MB
- Supported formats: JPG, PNG, WebP, GIF, AVIF

### 4. Database Migration
- **Created:** `supabase/migrations/seed_40_dishes.sql`
- Ensures the `dishes` table exists with correct schema
- Enables public read/write RLS policies (as requested)
- Seeds all 40 dishes with their names and curated image URLs (where available)
- Idempotent: can be run multiple times safely using `ON CONFLICT DO UPDATE`

### 5. Editable Image URL in Modal
- **Verified:** `src/components/dishes/DishDetailModal.tsx`
- The modal already includes a fully editable `<input type="url">` field for `imageUrl` (lines 318-323)
- The field is bound to `draft.imageUrl` and updates on change
- Includes validation for invalid URLs
- Shows live preview of the image
- Users can paste any URL and save it directly to the database

## Four-Pillar Structure Maintained

All 40 dishes maintain the categorized ingredient structure:
- **basis** - carbohydrates (pasta, aardappelen, rijst, etc.)
- **eiwit** - protein (gehakt, kip, vis, veggie options)
- **groenten** - vegetables and fruit
- **saus** - sauces
- **extra** - condiments and toppings

This structure is already implemented in the existing codebase via the `Ingredient` interface and `IngredientGroup` type.

## How to Apply Changes

### Option 1: Automatic via Supabase CLI
bash
supabase migration up

### Option 2: Manual via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/seed_40_dishes.sql`
4. Run the query

### Option 3: Let the App Sync
The app already syncs `mockDishes` to Supabase via the `syncDishes()` function in `src/lib/supabase.ts`. The dishes will be seeded automatically when the app runs and detects Supabase is configured.

## What Users Can Do Now

1. **View curated dish images** for the first 12 dishes
2. **Edit any dish's image URL** by clicking the dish card and using the modal's image URL input field
3. **Upload custom images** using the file upload button in the modal
4. **Add image URLs** for dishes 13-40 that don't have curated photos yet

## Notes

- The original request JSON was truncated after dish 12, so dishes 13-40 don't have curated image URLs in the migration
- Users can easily add images for these dishes using the editable modal
- All changes are persisted to the public Supabase database with read/write access for all users
- The image URL field accepts any valid URL, not just Supabase-hosted images

## Files Changed

1. ✅ Created: `src/lib/curatedDishImages.ts`
2. ✅ Modified: `src/lib/mockDishes.ts` (2 edits)
3. ✅ Restored: `src/lib/dishImages.ts` (git checkout)
4. ✅ Created: `supabase/migrations/seed_40_dishes.sql`
5. ✅ Verified: `src/components/dishes/DishDetailModal.tsx` (imageUrl field is editable)