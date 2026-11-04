export default function ProofSection() {
  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-6 py-20 sm:grid-cols-2 sm:items-end sm:py-28">
      <div><span className="text-[10px] font-bold tracking-[0.16em] text-[#718266]">LESS SCROLLING, MORE KNOWING</span><h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#17211a] sm:text-4xl">Search is only the start.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-stone-500">Move from a question to a useful, verifiable answer without losing the trail.</p></div>
      <div className="grid grid-cols-3 gap-4 border-t border-[#dfe5dc] pt-4">
        <div className="flex flex-col gap-3"><b className="text-[10px] text-[#93bd4c]">01</b><span className="text-xs leading-5 text-[#26332a] sm:text-sm">Fresh from<br/>the live web</span></div>
        <div className="flex flex-col gap-3"><b className="text-[10px] text-[#93bd4c]">02</b><span className="text-xs leading-5 text-[#26332a] sm:text-sm">Answers with<br/>their sources</span></div>
        <div className="flex flex-col gap-3"><b className="text-[10px] text-[#93bd4c]">03</b><span className="text-xs leading-5 text-[#26332a] sm:text-sm">Your research,<br/>kept private</span></div>
      </div>
    </section>
  );
}
