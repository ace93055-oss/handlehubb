import { categories } from "@/lib/constants";

export type DemoListing = {
  id: string; slug: string; title: string; category: string; categoryName: string; priceUsd: number;
  description: string; seller: string; sellerAvatar: string; rating: number; sales: number;
  createdAt: string; featured: boolean; verified: boolean; status: "AVAILABLE" | "RESERVED";
};

const names: Record<string, string[]> = {
  telegram: ["@rain", "@vex", "@rare", "@west"], discord: ["vex", "rare", "ion", "six"], minecraft: ["Minecon Cape", "3L name", "OG account", "2015 Cape"],
  roblox: ["4L Username", "Rare Limiteds", "2010 Account", "Clean 5L"], instagram: ["olie", "@visual", "@frame", "@scope"], tiktok: ["@loops", "@motion", "@viral", "@clip"],
  snapchat: ["4L username", "aged username", "clean 5L", "short snap"], twitter: ["@signal", "@vector", "@mono", "@zero"], soundcloud: ["@echo", "@audio", "@wave", "@bass"],
  medal: ["3L profile", "OG tag", "clean handle", "short ID"], twitch: ["@quest", "@level", "@stream", "@live"], playstation: ["3L PSN", "OG PSN", "Short ID", "Aged account"],
  domains: ["pixel.gg", "nova.io", "handle.xyz", "rare.bio"], epicgames: ["OG display", "rare account", "short name", "aged account"], github: ["@kernel", "@stack", "@code", "@byte"], pinterest: ["@mood", "@boards", "@style", "@pins"],
  steam: ["3-char vanity", "aged account", "OG profile", "short URL"], ea: ["short EA ID", "aged account", "clean ID", "3L name"], facebook: ["short username", "aged profile", "page handle", "clean name"],
  uplay: ["3L Uplay", "OG Ubisoft ID", "short name", "aged account"], whatsapp: ["business handle", "channel name", "community handle", "short name"]
};
const sellers=["rain", "north", "atlas", "mono", "vera", "noir"];
export const demoListings: DemoListing[] = categories.flatMap(([slug, categoryName], ci) =>
  (names[slug] ?? ["Rare handle", "Clean username", "Premium listing", "OG handle"]).map((title, i) => ({
    id: `${slug}-${i + 1}`,
    slug: String(title).toLowerCase().replace(/^@/,"").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `${slug}-${i+1}`,
    title,
    category: slug,
    categoryName,
    priceUsd: 35 + ci * 7 + i * 28,
    description: `${categoryName} listing with a clean transfer flow and direct seller contact through HandleHub.`,
    seller: sellers[ci % sellers.length], sellerAvatar: "", rating: [5,4.98,4.96,4.91][i%4], sales: 9 + ci * 2 + i,
    createdAt: new Date(Date.now() - (ci * 3 + i) * 86400000).toISOString(), featured: i===0 && ci%2===0,
    verified: (ci+i)%2===0, status: i===3 && ci%4===0 ? "RESERVED" : "AVAILABLE"
  }))
);
export function getListing(idOrSlug: string, category?: string) {
  return demoListings.find(x => (x.id === idOrSlug || x.slug === idOrSlug) && (!category || x.category===category));
}
