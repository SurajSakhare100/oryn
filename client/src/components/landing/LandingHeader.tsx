import Link from "next/link";

export default function LandingHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="absolute left-1/2 top-4 z-30 flex h-14 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 items-center justify-between rounded-full border border-white/80 bg-white/85 px-4 shadow-[0_8px_30px_rgba(25,45,29,0.10)] backdrop-blur-xl sm:top-6 sm:px-6">
      <Link href="/" className="text-lg font-bold tracking-tight text-[#17211a]">oryn<span className="ml-0.5 text-lime-600"></span></Link>
      <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-5">
        <a className="rounded-full bg-lime-100 px-3 py-1.5 text-[11px] font-semibold text-[#26351e]" href="#home">Home</a>
        <a className="hidden text-[11px] font-medium text-stone-600 transition hover:text-stone-950 sm:block" href="#how">How it works</a>
        <a className="text-[11px] font-medium text-stone-600 transition hover:text-stone-950" href="#features">Features</a>
        <a className="hidden text-[11px] font-medium text-stone-600 transition hover:text-stone-950 sm:block" href="#features">FAQ</a>
      </nav>
      <Link className="rounded-full bg-[#17211a] px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-[#2b3b2d]" href={isLoggedIn ? "/chat" : "/login"}>
        {isLoggedIn ? "Open Oryn" : "Log in"}
      </Link>
    </header>
  );
}
