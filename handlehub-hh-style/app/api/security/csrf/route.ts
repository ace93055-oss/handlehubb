import { NextRequest, NextResponse } from "next/server";
import { newCsrfToken } from "@/lib/server/security";
export async function GET(req:NextRequest){const existing=req.cookies.get("hh_csrf")?.value;const token=existing||newCsrfToken();const res=NextResponse.json({csrfToken:token});if(!existing)res.cookies.set("hh_csrf",token,{httpOnly:false,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/",maxAge:3600});return res}
