"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="mx-auto max-w-xl px-4 py-24 text-center"><div className="text-6xl">⚠️</div><h1 className="mt-5 text-3xl font-black">Something went wrong</h1><p className="mt-3 text-zinc-500">HandleHub could not load this view.</p><button className="btn-primary mt-6" onClick={reset}>Try again</button></main>}
