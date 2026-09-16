import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
export const metadata: Metadata = { title: { default: "HandleHub", template: "%s | HandleHub" }, description: "Marketplace for handles, usernames and digital identity assets." };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/>{children}<Footer/></body></html>}
