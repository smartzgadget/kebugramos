import { z } from "zod";

export const StoreSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  isShowcase: z.boolean().optional(),
});
export type Store = z.infer<typeof StoreSchema>;

export const InventoryItemSchema = z.object({
  id: z.string().min(1),
  storeId: z.string().min(1),
  productId: z.string().min(1),
  title: z.string().min(2).max(80),
  priceMinor: z.number().int().min(0),
  currency: z.string().length(3),
  stock: z.number().int().min(0),
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export const InventoryResponseSchema = z.object({ data: z.array(InventoryItemSchema) });
export const StoreResponseSchema = StoreSchema;

export const showcaseStore: Store = {
  id: "store-showcase-1",
  name: "KebuCraft Hub",
  slug: "kebucraft-hub",
  description: "One showcase storefront — inventory + publish via Java core.",
  status: "published",
  isShowcase: true,
};

export const showcaseInventory: InventoryItem[] = [
  { id: "inv-1", storeId: "store-showcase-1", productId: "prod-showcase-1", title: "KebuCraft Basket", priceMinor: 25000, currency: "RWF", stock: 12 },
];
