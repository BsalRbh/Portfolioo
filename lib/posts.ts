export type Post = {
  title: string;
  date: string;
  reading: string;
  excerpt: string;
  body: string[];
};

export const POSTS: Post[] = [
  {
    title: "Five years in the classroom, one year in react",
    date: "APR 2026",
    reading: "09 MIN",
    excerpt:
      "What teaching grade-school students taught me about onboarding flows, error messages, and patience under load.",
    body: [
      "Before I wrote any production code, I taught for five years. Mostly twelve-year-olds, mostly things they did not want to learn at eight in the morning. What I did not expect was how directly that work would map to building interfaces.",
      "A bad explanation in a classroom looks identical to a bad error message in a product: the receiver shuts down, blames themselves, and stops trying. Teachers spend years learning that the gap between what you said and what they heard is your problem, not theirs. Engineers, in my experience, take much longer to accept this.",
      "The other thing classroom teaching gives you is a calibrated sense of pacing. You feel, in your body, when a room loses you. You learn to put the hard part in the middle and a small win at the end. Onboarding flows, empty states, the first ten seconds of a demo — all of it is just lesson planning with smaller words and prettier fonts.",
      "I still teach, in a way. Code review is a kind of teaching. So is a good PR description. So is the title of a button.",
    ],
  },
  {
    title: "useEffect is a tax, not a tool",
    date: "FEB 2026",
    reading: "07 MIN",
    excerpt:
      "Most effects I see in code review can be deleted. A short guide to spotting them and what to reach for instead.",
    body: [
      "Most useEffects I see in code review are paying interest on a decision made three months ago. The component needed to do a thing, the easiest place to put the thing was inside an effect, and now everyone is debugging a stale ref at 11pm.",
      "The rule I use, when I remember to use it: an effect is for synchronizing with something outside React. A DOM API, a network, a timer, a third-party widget. Anything that lives inside React — state derived from other state, props feeding into props, a value you could just compute — does not need one.",
      "The tell is usually a useEffect that calls setState with no external input. That is a render, dressed up. Move it into the render body, or memoize it, or lift it. Almost always faster, almost always fewer bugs.",
      "I am not anti-effect. I am anti-effect-as-default. They are a tax you pay to leave React's world. Pay it when you have to.",
    ],
  },
  {
    title: "The bank counter was a UX lab",
    date: "NOV 2025",
    reading: "08 MIN",
    excerpt:
      "A year behind a teller window watching real people fight real forms. The lessons stuck.",
    body: [
      "After the classroom and before the code, I spent a year behind a counter at a bank. People came in with forms half-filled, wrong dates, signatures in the wrong box, ID photocopies the machine had eaten. I watched the same five mistakes happen five hundred times.",
      "Almost none of it was the customers' fault. The form asked for the date in three different formats on the same page. The signature box was next to a box that looked exactly like the signature box but was for the witness. The instructions were in a language one in three customers could not read fluently.",
      "I started keeping a tally of which fields people redid the most. I did not know I was doing UX research. I thought I was just bored.",
      "When I started building forms in code, I had a strong prior already: if the user gets it wrong, the form is wrong. Every constraint, every helper text, every default — they are not polish. They are the product.",
    ],
  },
  {
    title: "From accountant to engineer, slowly",
    date: "AUG 2025",
    reading: "06 MIN",
    excerpt:
      "The career switch nobody tells you about: spreadsheets are just very stubborn frontends.",
    body: [
      "The path from accountant to engineer is shorter than it looks from either side. Both jobs are about taking a messy reality, modeling it in something more rigid than reality, and then arguing with the model when it does not match.",
      "Double-entry bookkeeping was my first encounter with referential integrity. Every transaction touches two accounts, the sums have to agree, and if they do not, you stop and find out why before moving on. That is half the job of a backend engineer.",
      "The skill that transferred most was patience for tedium. Reconciling a ledger and chasing down a flaky test feel identical in the body. You sit, you bisect, you stop when the numbers tie out.",
      "What did not transfer: the assumption that there is one right answer. Accounting has rules. Software has trade-offs. It took me a year to stop looking for the rulebook.",
    ],
  },
];
