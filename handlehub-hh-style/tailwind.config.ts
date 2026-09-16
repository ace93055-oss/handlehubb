import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { canvas:"#07090d", panel:"#0d1118", panel2:"#111722", line:"#202938", ink:"#f8fafc", muted:"#8490a3", accent:"#3b82f6" },
    boxShadow: { soft:"0 10px 35px rgba(0,0,0,.28)", blue:"0 0 0 1px rgba(59,130,246,.12),0 18px 45px rgba(0,0,0,.34)" },
    screens: { desktop:"900px" }
  }}, plugins: []
} satisfies Config;
