import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { categories,categorySlugs } from "@/lib/constants";
import { demoListings } from "@/lib/demo-data";
export function generateStaticParams(){return categories.map(([category])=>({category}));}
export default async function CategoryPage({params}:{params:Promise<{category:string}>}){const{category}=await params;if(!categorySlugs.has(category as any))notFound();const meta=categories.find(([slug])=>slug===category)!;return <PageShell title={`${meta[1]} usernames`} active={category} listings={demoListings.filter(x=>x.category===category)}/>}
