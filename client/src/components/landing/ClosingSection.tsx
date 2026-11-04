import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function ClosingSection({ destination }: { destination: string }) {
  return (
    <section className="relative isolate overflow-hidden px-5 py-28 text-center sm:py-36">
      <span className="text-[10px] font-bold tracking-[0.16em] text-[#718266]">YOUR NEXT GOOD QUESTION</span>
      <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#17211a] sm:text-6xl">Find your way<br />to a better answer.</h2>
      <p className="mt-4 text-sm text-stone-500">Bring your curiosity. Oryn will bring the context.</p>
      <Link href={destination} className="mx-auto mt-7 inline-flex h-11 items-center gap-3 rounded-full bg-[#18211b] px-5 text-xs font-semibold text-white shadow-lg shadow-[#15251c]/15 transition hover:bg-[#2b3b2d]">Start searching <ArrowUp size={15} /></Link>
    </section>
  );
}
