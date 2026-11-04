import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold text-teal-700">ORYN SIGN IN</p>
        <h1 className="mt-3 text-3xl font-bold text-stone-900">Google sign-in didn’t finish</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">Try again. If the problem continues, check that Google sign-in is configured for this app.</p>
        <Link href="/login" className="mt-7 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">Back to sign in</Link>
      </section>
    </main>
  );
}
