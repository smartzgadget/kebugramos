import { z } from "zod";

export const CampaignStatusSchema = z.enum(["draft", "active", "paused", "ended"]);
export const CampaignSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(80),
  budgetMinor: z.number().int().min(0),
  currency: z.string().length(3),
  status: CampaignStatusSchema,
  isShowcase: z.boolean().optional(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const AdSlotSchema = z.object({
  id: z.string().min(1),
  placement: z.enum(["feed_inline", "search_top", "sponsored"]),
  campaignId: z.string().min(1),
  creativeUrl: z.string().url().nullable().optional(),
  cta: z.string().max(40).optional(),
});
export type AdSlot = z.infer<typeof AdSlotSchema>;

export const SponsorshipSchema = z.object({
  id: z.string().min(1),
  postId: z.string().min(1),
  sponsorId: z.string().min(1),
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3),
  status: z.enum(["pending", "active", "settled"]),
  isShowcase: z.boolean().optional(),
});
export type Sponsorship = z.infer<typeof SponsorshipSchema>;

export const showcaseCampaign: Campaign = {
  id: "camp-showcase-1",
  title: "Timket Heritage — Sponsor",
  budgetMinor: 500000,
  currency: "RWF",
  status: "active",
  isShowcase: true,
};

export const showcaseSlot: AdSlot = {
  id: "slot-showcase-1",
  placement: "feed_inline",
  campaignId: "camp-showcase-1",
  creativeUrl: null,
  cta: "Learn more",
};

export const showcaseSponsorship: Sponsorship = {
  id: "sp-showcase-1",
  postId: "p-showcase-1",
  sponsorId: "brand-showcase-1",
  amountMinor: 10000,
  currency: "RWF",
  status: "active",
  isShowcase: true,
};

export function canServeAds(consentAds: boolean): boolean {
  return consentAds === true;
}
