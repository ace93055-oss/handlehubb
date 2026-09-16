import { notFound,redirect } from "next/navigation";
import { getListing } from "@/lib/demo-data";
export default async function LegacyListing({params}:{params:Promise<{id:string}>}){const{id}=await params;const l=getListing(id);if(!l)notFound();redirect(`/${l.category}/${l.slug}`)}
