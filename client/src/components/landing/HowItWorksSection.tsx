const STEPS = [
  { number: "01", title: "Ask naturally", description: "Start with a question, a topic, or the thing you’re trying to figure out." },
  { number: "02", title: "Oryn looks closer", description: "Live pages are gathered and the useful details are brought into focus." },
  { number: "03", title: "Follow the evidence", description: "Read a clear response, then open its references to go deeper." },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-[#f0f4ed] px-6 py-20 sm:px-10 sm:py-24" id="how">
      <div className="mx-auto max-w-5xl"><span className="text-[10px] font-bold tracking-[0.16em] text-[#718266]">THREE STEPS, ONE CLEAR ANSWER</span><h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#17211a] sm:text-4xl">Curiosity, meet clarity.</h2></div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3 sm:gap-10">{STEPS.map(step => <article key={step.number} className="border-t border-[#cdd8c8] pt-4"><b className="text-[10px] text-[#88a85d]">{step.number}</b><h3 className="mt-6 text-lg font-semibold tracking-tight text-[#243126]">{step.title}</h3><p className="mt-2 max-w-[250px] text-xs leading-5 text-[#68756a]">{step.description}</p></article>)}</div>
    </section>
  );
}
