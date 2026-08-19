import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  priceMinor: z.number().int().min(0),
  currency: z.string().length(3),
  imageUrl: z.string().url().nullable(),
  stock: z.number().int().min(0),
  isShowcase: z.boolean().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const CatalogResponseSchema = z.object({
  data: z.array(ProductSchema),
  nextCursor: z.string().nullable(),
});
export type CatalogResponse = z.infer<typeof CatalogResponseSchema>;

export const CartItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(1).max(99),
  priceMinor: z.number().int().min(0),
  title: z.string().min(1),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CheckoutRequestSchema = z.object({
  items: z.array(CartItemSchema).min(1),
  idempotencyKey: z.string().uuid(),
});
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const CheckoutResponseSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["created", "paid", "failed"]),
  totalMinor: z.number().int().min(0),
});
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

export const showcaseProduct: Product = {
  id: "prod-showcase-1",
  title: "KebuCraft Basket — Handwoven",
  description: "One showcase product proving catalog → search → cart → idempotent checkout.",
  priceMinor: 25000,
  currency: "RWF",
  imageUrl: "https://cdn.kebugram.com/showcase/basket.jpg",
  stock: 12,
  isShowcase: true,
};
