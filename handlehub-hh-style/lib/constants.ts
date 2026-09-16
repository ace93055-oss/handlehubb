export const TELEGRAM_URL = "https://t.me/rainownsyou";

export const categories = [
  ["telegram", "Telegram"], ["discord", "Discord"], ["minecraft", "Minecraft"], ["roblox", "Roblox"],
  ["instagram", "Instagram"], ["tiktok", "TikTok"], ["snapchat", "Snapchat"], ["twitter", "X / Twitter"],
  ["soundcloud", "SoundCloud"], ["medal", "Medal"], ["twitch", "Twitch"], ["playstation", "PlayStation"],
  ["domains", "Domains"], ["epicgames", "Epic Games"], ["github", "GitHub"], ["pinterest", "Pinterest"],
  ["steam", "Steam"], ["ea", "EA"], ["facebook", "Facebook"], ["uplay", "Ubisoft / Uplay"], ["whatsapp", "WhatsApp"]
] as const;

export type CategorySlug = typeof categories[number][0];
export const categorySlugs = new Set(categories.map(([slug]) => slug));

export const cryptoConfig = {
  BTC: { name: "Bitcoin", symbol: "BTC", decimals: 8, env: "BTC_RECEIVE_ADDRESS" },
  LTC: { name: "Litecoin", symbol: "LTC", decimals: 8, env: "LTC_RECEIVE_ADDRESS" },
  SOL: { name: "Solana", symbol: "SOL", decimals: 9, env: "SOL_RECEIVE_ADDRESS" },
  ETH: { name: "Ethereum", symbol: "ETH", decimals: 18, env: "ETH_RECEIVE_ADDRESS" },
} as const;
