This project is a data visualization of modern-day "neolabs."

We are going to be adding a new neolab to the dataset, which is stored in `src/data/`.

<lab-name>
???
</lab-name>

<lab-website>
???
</lab-website>

You must retrieve the following pieces of information:

1. A list of the lab's co-founders, with certain details specified below
2. A 2–3 sentence summary of what the stated purpose of the lab is
3. A single core research designation. Existing research areas are defined in `src/data/taxonomy.ts`
4. Optional tag(s) that help add color about the lab's areas of focus. Tags are defined in `src/data/taxonomy.ts`
5. The lab's latest valuation, or estimated valuation based on typical multiples. See `prompts/valuation-methodology.md`

<co-founder-research>
For each co-founder, you must gather what their prior affiliations are. A prior affiliation is defined as a past
place of employment, or the school where the individual did their PhD. Bachelors degrees, master degrees, internships,
advisor/investor designations, EIR positions, and other roles of this ilk are not to be included. 1-3 prior
affiliations are common. If the individual has more than that, use best judgement on whether they are relevant for this
lab or not.
</co-founder-research>

<research-area-disclaimer>
It is unlikely a lab does not fit into any of the existing research areas, especially given the existence
of a general bucket. However, if you have absolute conviction that a new area should be specified, you
may propose your recommendation.
</research-area-disclaimer>

<tag-disclaimer>
You are allowed to propose a new tag if you feel with absolute conviction that none of the existing ones
accurately capture what this lab does.
</tag-disclaimer>

<searching>
Please use parallel.ai for web search. You have access to a set of parallel.ai skills that demonstrate how to use
their tooling.
</searching>

<rules>
- You are free to read any/all source files
- You are _NOT_ allowed to make any changes to code/source files
- You _ARE_ allowed to dump your notes and proposed taxonomy into `.plans/<name-of-lab>/<name-of-lab>.md`
</rules>

Please let me know if you have any questions before proceeding.
