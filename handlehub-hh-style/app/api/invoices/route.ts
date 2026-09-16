import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Decimal from "decimal.js";
import { CryptoCurrency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { demoListings } from "@/lib/demo-data";
import { destination, priceInvoice, publicInvoiceId } from "@/lib/crypto/invoice";
import { rateLimit, requireCsrf, sessionId } from "@/lib/server/security";

const Schema=z.object({listingId:z.string().min(1).max(100),currency:z.enum(["BTC","LTC","SOL","ETH"])});
const holdPlans: Record<string,{title:string;price:number}>={"hold-channel":{title:"Hold: Channel / Group verification",price:89},"hold-profile":{title:"Hold: Profile verification",price:49},"hold-bot":{title:"Hold: Bot verification",price:69}};
export async function POST(req:NextRequest){
  const limited=rateLimit(req,10,60_000);if(limited)return limited;const csrf=requireCsrf(req);if(csrf)return csrf;
  try{
    const body=Schema.parse(await req.json());
    let dbListing=await prisma.listing.findUnique({where:{id:body.listingId}}).catch(()=>null);
    const demo=demoListings.find(x=>x.id===body.listingId);
    const hold=holdPlans[body.listingId];
    if(!dbListing&&!demo&&!hold)return NextResponse.json({error:"Listing not found"},{status:404});
    const fiat=new Decimal(dbListing?.priceUsd?.toString() ?? demo?.priceUsd ?? hold!.price);
    const currency=body.currency as CryptoCurrency;const priced=await priceInvoice(fiat,currency);const wallet=destination(currency);const sid=sessionId(req);const ttl=Math.min(20,Math.max(10,Number(process.env.INVOICE_TTL_MINUTES||20)));
    if(!dbListing){
      const isHold=Boolean(hold);
      const categorySlug=isHold?"hold-service":demo!.category; const categoryName=isHold?"Hold Verification":demo!.categoryName;
      const cat=await prisma.category.upsert({where:{slug:categorySlug},update:{},create:{slug:categorySlug,name:categoryName,active:false}});
      const sellerName=isHold?"handlehub":demo!.seller;
      let user=await prisma.user.findUnique({where:{username:sellerName}});if(!user)user=await prisma.user.create({data:{username:sellerName,role:"SELLER"}});
      const seller=await prisma.seller.upsert({where:{userId:user.id},update:{},create:{userId:user.id,displayName:sellerName,verified:true,rating:new Decimal(5),salesCount:0}});
      dbListing=await prisma.listing.create({data:{id:body.listingId,slug:isHold?body.listingId:demo!.slug,title:isHold?hold!.title:demo!.title,categoryId:cat.id,sellerId:seller.id,priceUsd:fiat,description:isHold?"Annual HandleHub Hold verification service.":demo!.description,images:[],featured:false,verified:true}});
    }
    const invoice=await prisma.invoice.create({data:{publicId:publicInvoiceId(),listingId:dbListing.id,buyerSession:sid,currency,fiatAmount:fiat,baseCryptoAmount:priced.baseAmount,cryptoAmount:priced.amount,walletAddress:wallet,exchangeRate:priced.rate,expiresAt:new Date(Date.now()+ttl*60_000)}});
    const paymentUri=currency==="BTC"?`bitcoin:${wallet}?amount=${invoice.cryptoAmount}`:currency==="LTC"?`litecoin:${wallet}?amount=${invoice.cryptoAmount}`:currency==="SOL"?`solana:${wallet}?amount=${invoice.cryptoAmount}`:`ethereum:${wallet}?value=${invoice.cryptoAmount}`;
    const res=NextResponse.json({publicId:invoice.publicId,currency,cryptoAmount:invoice.cryptoAmount.toString(),walletAddress:wallet,status:invoice.status,expiresAt:invoice.expiresAt,transactionHash:null,confirmations:0,paymentUri});
    if(!req.cookies.get("hh_session"))res.cookies.set("hh_session",sid,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
    return res;
  }catch(e:any){if(e instanceof z.ZodError)return NextResponse.json({error:"Invalid invoice request",details:e.issues},{status:400});console.error("invoice_create",e);return NextResponse.json({error:"Could not create invoice"},{status:500})}
}
