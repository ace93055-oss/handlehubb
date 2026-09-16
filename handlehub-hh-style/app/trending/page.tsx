import { PageShell } from "@/components/page-shell";
import { demoListings } from "@/lib/demo-data";
export default function Trending(){const listings=[...demoListings].sort((a,b)=>Number(b.featured)-Number(a.featured)||b.sales-a.sales);return <PageShell title="Trending" listings={listings} trending/>}
