"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function HeroSection({
  destination,
}: {
  destination: string;
}) {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#fbfcf9] px-5 pb-12 pt-24 text-center" id="home">
      <div className="absolute inset-0 -z-20 bg-[url('/nature.png')] bg-cover bg-[center_56%]" aria-hidden="true" />
      {/* <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/45 via-white/35 to-[#fbfcf9]/80" aria-hidden="true" /> */}
      <div className="absolute -inset-x-10 -bottom-24 -z-10 h-64 rounded-[50%] bg-[#fbfcf9]/75 blur-3xl" aria-hidden="true" />
      <div className="mx-auto mt-8 max-w-3xl">
        <span className="inline-flex items-center rounded-full border border-white/80 bg-white/65 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[#5f7760] shadow-sm backdrop-blur-md"><i className="mr-2 h-1.5 w-1.5 rounded-full bg-lime-500" />LIVE WEB, CLEAR ANSWERS</span>
        <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#17211a] sm:text-7xl">A clearer way<br />to <em className="font-serif font-normal text-[#58704b]">find the truth.</em></h1>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-[#53615a] sm:text-base">Ask anything. Oryn searches the live web and brings back thoughtful answers, grounded in sources you can check.</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link className="inline-flex h-11 items-center gap-3 rounded-full bg-[#18211b] px-5 text-xs font-semibold text-white shadow-lg shadow-[#15251c]/15 transition hover:bg-[#2b3b2d]" href={destination}>Start searching <ArrowUp size={15} /></Link>
          <a className="inline-flex h-11 items-center rounded-full border border-white/90 bg-white/70 px-5 text-xs font-semibold text-[#26332a] backdrop-blur-md transition hover:bg-white" href="#demo">See how it works</a>
        </div>
      </div>
    </section>
  );
}
