import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 border-t border-[#e7ebe5] px-6 py-7 text-[10px] text-stone-500 sm:gap-6">
      <Link href="/" className="text-lg font-bold tracking-tight text-[#17211a]">oryn<span className="ml-0.5 text-lime-600"></span></Link>
      <span>Search with a little more clarity.</span>
      <div className="order-3 flex w-full gap-5 sm:order-none sm:ml-auto sm:w-auto"><a href="#features">Features</a><a href="#how">How it works</a><Link href="/login">Log in</Link></div>
      <small className="ml-auto border-l border-[#e0e5de] pl-4">© 2026 Oryn</small>
    </footer>
  );
}
