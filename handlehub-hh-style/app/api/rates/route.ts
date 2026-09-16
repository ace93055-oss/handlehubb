import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUsdRate } from "@/lib/crypto/prices";
import { rateLimit } from "@/lib/server/security";
const Q=z.enum(["BTC","LTC","SOL","ETH"]);
export async function GET(req:NextRequest){const limited=rateLimit(req,30,60_000);if(limited)return limited;const parsed=Q.safeParse(req.nextUrl.searchParams.get("currency"));if(!parsed.success)return NextResponse.json({error:"Unsupported currency"},{status:400});try{return NextResponse.json({currency:parsed.data,usd:(await getUsdRate(parsed.data)).toString()})}catch{return NextResponse.json({error:"Rate unavailable"},{status:502})}}
