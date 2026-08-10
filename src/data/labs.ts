import { CITIES } from "./locations";
import type { Lab } from "./types";

/**
 * The dataset.
 *
 * Valuations are in millions USD and carry their qualifier, because in this
 * market "$1B" and ">$1B" and "~$1B (rumored)" are three different claims.
 *
 * Headquarters and founder prior-affiliations are not in the source table —
 * they're compiled from public reporting on each lab. Where a lab is genuinely
 * split across two sites (SSI: Palo Alto + Tel Aviv, AMI: New York + Paris) the
 * primary office is used.
 */
export const LABS: Lab[] = [
  {
    slug: "deepseek",
    name: "DeepSeek",
    // ~RMB 50bn raised at a ~$52B valuation, round closed June 2026 with
    // Tencent and CATL as largest external shareholders (Caixin). A second
    // round at ~$71B pre-money was reported in progress in July 2026 but had
    // not closed, so the figure below is the last closed round.
    valuation: { usdM: 52_000, qualifier: "exact" },
    year: 2023,
    domain: "general",
    tags: ["math", "open-source", "open-weights"],
    founders: [{ person: "liang-wenfeng", prior: ["highflyer"] }],
    knownFor:
      "Spun out of the quant fund High-Flyer; open-weight frontier models trained at a fraction of the compute cost US labs disclose.",
    location: CITIES.hangzhou,
  },
  {
    slug: "mistral",
    name: "Mistral AI",
    // €1.7B Series C at €11.7B post-money, led by ASML, September 2025;
    // converted at the announcement-date rate. A ~€20B round was reported in
    // talks in June 2026 but is not confirmed closed.
    valuation: { usdM: 13_800, qualifier: "approx" },
    year: 2023,
    domain: "general",
    tags: ["agents", "on-device", "open-weights", "sovereign"],
    founders: [
      { person: "arthur-mensch", prior: ["deepmind", "parissaclay"] },
      { person: "guillaume-lample", prior: ["meta", "sorbonne"] },
      { person: "timothee-lacroix", prior: ["meta", "ponts"] },
    ],
    knownFor:
      "Europe's frontier lab; Apache-licensed open-weight models alongside proprietary ones, positioned as a sovereign alternative to the US labs.",
    location: CITIES.paris,
  },
  {
    slug: "cohere",
    name: "Cohere",
    // $500M Series C at $6.8B (August 2025), extended by a $100M second close
    // in September 2025 that took it to roughly $7B. The ~$20B attached to the
    // announced Aleph Alpha merger is a combined-entity figure, not a closed
    // round.
    valuation: { usdM: 7_000, qualifier: "approx" },
    year: 2019,
    domain: "applied",
    tags: ["agents", "multimodal", "open-weights", "sovereign"],
    founders: [
      { person: "aidan-gomez", prior: ["google", "oxford"] },
      { person: "nick-frosst", prior: ["google"] },
      { person: "ivan-zhang", prior: ["forai"] },
    ],
    knownFor:
      "Enterprise LLMs sold on private deployment; the Command and Aya model families and the North agent platform. Announced a merger with Germany's Aleph Alpha in 2026.",
    location: CITIES.toronto,
  },
  {
    slug: "runway",
    name: "Runway",
    valuation: { usdM: 5_300, qualifier: "exact" },
    year: 2018,
    domain: "media",
    tags: ["multimodal", "video"],
    founders: [
      { person: "cristobal-valenzuela" },
      { person: "anastasis-germanidis", prior: ["ibm", "chartbeat"] },
      { person: "alejandro-matamala" },
    ],
    knownFor:
      "Generative video for film and production, from Gen-1 to Gen-4.5; a co-author of the latent diffusion work behind Stable Diffusion.",
    location: CITIES.newYork,
  },
  {
    slug: "black-forest-labs",
    name: "Black Forest Labs",
    valuation: { usdM: 3_250, qualifier: "exact" },
    year: 2024,
    domain: "media",
    tags: ["multimodal", "open-weights", "video"],
    founders: [
      { person: "robin-rombach", prior: ["stabilityai", "lmu"] },
      { person: "andreas-blattmann", prior: ["stabilityai", "lmu"] },
      {
        person: "patrick-esser",
        prior: ["stabilityai", "runway", "heidelberg"],
      },
    ],
    knownFor:
      "The Stable Diffusion authors' lab; the FLUX family of image models, part of it Apache-licensed, now extending into video and robot manipulation.",
    location: CITIES.freiburg,
  },
  {
    slug: "prime-intellect",
    name: "Prime Intellect",
    valuation: { usdM: 1_000, qualifier: "exact" },
    year: 2024,
    domain: "compute",
    tags: ["agents", "open-source", "open-weights", "training-infra-tools"],
    founders: [
      { person: "vincent-weisser", prior: ["molecule"] },
      {
        person: "johannes-hagemann",
        prior: ["bunchai", "alephalpha", "vitadao"],
      },
    ],
    knownFor:
      "Aggregated compute plus a training, sandbox and inference stack, sold on the pitch that any company can be its own lab; ships the INTELLECT open-weight models and an open RL toolchain.",
    location: CITIES.sf,
  },
  {
    slug: "trajectory",
    name: "Trajectory",
    // Set by the $15M seed announced in May 2026, led by Conviction.
    valuation: { usdM: 115, qualifier: "exact" },
    year: 2026,
    domain: "rsi",
    tags: ["agents", "continual-learning", "training-infra-tools"],
    founders: [
      { person: "ronak-malde", prior: ["windsurf", "deepmind", "stanford"] },
      { person: "michael-elabd", prior: ["deepmind", "google", "stanford"] },
      { person: "arjun-karanam", prior: ["apple", "stanford"] },
    ],
    knownFor:
      "A continual-learning layer that turns user feedback on agent trajectories into post-training data, helping deployed models improve from real-world use.",
    location: CITIES.sf,
  },
  {
    slug: "discovery-loop",
    name: "Discovery Loop",
    // Announced 5 Aug 2026 co-led by Radical Ventures and Khosla, with
    // Lightspeed, Kleiner Perkins, Doerr Capital and Alphabet participating.
    // The round had not closed and the company declined to state a valuation,
    // so usdM below is a nominal placeholder for bubble sizing only — the
    // 'undisclosed' qualifier keeps it off the magnitude ramp.
    valuation: { usdM: 1_000, qualifier: "undisclosed" },
    year: 2026,
    domain: "rsi",
    founders: [
      { person: "jeff-dean", prior: ["google", "deepmind", "washington"] },
      { person: "sanjay-ghemawat", prior: ["google", "mit"] },
      { person: "quoc-le", prior: ["google"] },
      { person: "oriol-vinyals", prior: ["deepmind", "google"] },
    ],
    knownFor:
      "Google's Chief Scientist, a Senior Fellow, and both Gemini co-leads leaving at once to automate the scientific method. A public benefit corporation.",
    location: CITIES.paloAlto,
  },
  {
    slug: "thinking-machines-lab",
    name: "Thinking Machines Lab",
    valuation: { usdM: 12_000, qualifier: "exact" },
    year: 2025,
    domain: "general",
    tags: ["open-source", "open-weights", "training-infra-tools"],
    founders: [
      { person: "mira-murati", prior: ["openai"] },
      { person: "john-schulman", prior: ["openai", "anthropic"] },
      { person: "barret-zoph", prior: ["openai"] },
      { person: "lilian-weng", prior: ["openai"] },
      { person: "luke-metz", prior: ["openai"] },
      { person: "andrew-tulloch", prior: ["openai", "meta"] },
    ],
    knownFor:
      "A research and product company building AI systems that are more understandable, customisable and capable.",
    location: CITIES.sf,
  },
  {
    slug: "project-prometheus",
    name: "Prometheus",
    priorNames: ["Project Prometheus"],
    valuation: { usdM: 41_000, qualifier: "exact" },
    year: 2025,
    domain: "physical",
    founders: [
      { person: "jeff-bezos", prior: ["amazon"] },
      { person: "vik-bajaj", prior: ["google", "startup"] },
    ],
    knownFor:
      "Jeff Bezos' return to an operating role; AI for the physical economy.",
    location: CITIES.sf,
  },
  {
    slug: "ssi",
    name: "SSI (Safe Superintelligence)",
    valuation: { usdM: 32_000, qualifier: "exact" },
    year: 2024,
    domain: "general",
    founders: [
      { person: "ilya-sutskever", prior: ["toronto", "google", "openai"] },
      { person: "daniel-gross", prior: ["apple"] },
      { person: "daniel-levy", prior: ["openai", "stanford"] },
    ],
    knownFor:
      "A straight-shot lab pursuing safe superintelligence, operating in total secrecy.",
    location: CITIES.paloAlto,
  },
  {
    slug: "reflection-ai",
    name: "Reflection AI",
    valuation: { usdM: 25_000, qualifier: "exact" },
    year: 2024,
    domain: "general",
    tags: ["open-weights", "sovereign"],
    founders: [
      { person: "misha-laskin", prior: ["deepmind"] },
      { person: "ioannis-antonoglou", prior: ["deepmind"] },
    ],
    knownFor:
      "American open-weights frontier models, built by ex-DeepMind researchers.",
    location: CITIES.newYork,
  },
  {
    slug: "skild-ai",
    name: "Skild AI",
    valuation: { usdM: 14_000, qualifier: "gt" },
    year: 2023,
    domain: "physical",
    tags: ["academic-spinout", "robot-foundation-models"],
    founders: [
      { person: "deepak-pathak", prior: ["cmu", "berkeley"] },
      { person: "abhinav-gupta", prior: ["cmu", "meta"] },
    ],
    knownFor: "Robot foundation models out of Carnegie Mellon.",
    location: CITIES.pittsburgh,
  },
  {
    slug: "poolside",
    name: "Poolside",
    valuation: { usdM: 12_000, qualifier: "exact", rumored: true },
    year: 2023,
    domain: "coding",
    tags: ["agents", "open-weights"],
    founders: [
      { person: "jason-warner", prior: ["github", "salesforce", "canonical"] },
      { person: "eiso-kant", prior: ["startup"] },
    ],
    knownFor:
      "Founded by GitHub's former CTO; builds frontier foundation models purpose-built for software development.",
    location: CITIES.sf,
  },
  {
    slug: "physical-intelligence",
    name: "Physical Intelligence",
    valuation: { usdM: 11_000, qualifier: "gt", rumored: true },
    year: 2024,
    domain: "physical",
    tags: ["open-source", "open-weights", "robot-foundation-models"],
    founders: [
      { person: "sergey-levine", prior: ["berkeley", "google", "deepmind"] },
      { person: "karol-hausman", prior: ["google", "deepmind", "stanford"] },
      { person: "chelsea-finn", prior: ["stanford", "google", "deepmind"] },
      { person: "brian-ichter", prior: ["google", "deepmind", "stanford"] },
      { person: "lachy-groom", prior: ["stripe"] },
      { person: "quan-vuong", prior: ["deepmind", "google", "microsoft"] },
      { person: "adnan-esmail", prior: ["anduril", "tesla"] },
    ],
    knownFor:
      "General-purpose robot policies from the Stanford/Berkeley/Google robotics world.",
    location: CITIES.sf,
  },
  {
    slug: "periodic-labs",
    name: "Periodic Labs",
    valuation: { usdM: 7_000, qualifier: "approx", rumored: true },
    year: 2025,
    domain: "science",
    tags: ["materials"],
    founders: [
      { person: "liam-fedus", prior: ["openai", "google"] },
      { person: "ekin-dogus-cubuk", prior: ["deepmind", "google"] },
    ],
    knownFor:
      "Autonomous labs for materials discovery; ex-OpenAI VP of Post-Training and ex-Google Brain/DeepMind materials lead.",
    location: CITIES.sf,
  },
  {
    slug: "ineffable-intelligence",
    name: "Ineffable Intelligence",
    valuation: { usdM: 5_100, qualifier: "exact" },
    year: 2026,
    domain: "rsi",
    tags: ["continual-learning"],
    founders: [
      {
        person: "heather-gorham",
        prior: ["flyingfish", "jpmorgan", "onsemi", "tesla"],
      },
      { person: "lasse-espeholt", prior: ["microsoft", "deepmind", "google"] },
      {
        person: "wojciech-marian-czarnecki",
        prior: ["fundamental", "deepmind", "isomorphic"],
      },
      { person: "junhyuk-oh", prior: ["deepmind"] },
      { person: "alex-laterre", prior: ["instadeep"] },
      { person: "chris-apps", prior: ["deepmind"] },
      { person: "david-silver", prior: ["deepmind"] },
    ],
    knownFor:
      "David Silver's lab building reinforcement-learning \"superlearners\" that learn from experience rather than human data.",
    location: CITIES.london,
  },
  {
    slug: "world-labs",
    name: "World Labs",
    valuation: { usdM: 5_000, qualifier: "approx", rumored: true },
    year: 2024,
    domain: "world",
    tags: ["multimodal"],
    founders: [
      {
        person: "fei-fei-li",
        prior: ["google", "stanford", "princeton", "uiuc", "caltech"],
      },
      { person: "justin-johnson", prior: ["stanford", "meta", "michigan"] },
      {
        person: "christoph-lassner",
        prior: ["epicgames", "meta", "bodylabs", "amazon"],
      },
      {
        person: "ben-mildenhall",
        prior: ["google", "fyusion", "pixar", "berkeley"],
      },
    ],
    knownFor:
      "Spatial intelligence and 3D world generation, from the creator of ImageNet.",
    location: CITIES.sf,
  },
  {
    slug: "river-ai",
    name: "River AI",
    // Reported fundraising discussions valued the company at up to $5B; the
    // round and valuation were not confirmed by River.
    valuation: { usdM: 5_000, qualifier: "lt", rumored: true },
    year: 2026,
    domain: "applied",
    tags: ["training-infra-tools"],
    founders: [
      { person: "igor-babuschkin", prior: ["deepmind", "openai", "xai"] },
      { person: "dmytro-soboliev", prior: ["apple", "openai", "xai"] },
      { person: "ievgen-soboliev", prior: ["meta", "apple", "xai"] },
      { person: "aaron-rogers", prior: ["amd", "qualcomm", "tesla"] },
    ],
    knownFor:
      "Personal AI agents that learn from and are controlled by their users, built on an end-to-end stack spanning training, models, products and on-device hardware.",
    location: CITIES.paloAlto,
  },
  {
    slug: "recursive-superintelligence",
    name: "Recursive Superintelligence",
    valuation: { usdM: 4_650, qualifier: "exact" },
    year: 2025,
    domain: "rsi",
    tags: ["agents"],
    founders: [
      {
        person: "richard-socher",
        prior: ["salesforce", "stanford", "startup"],
      },
      { person: "tim-rocktaschel", prior: ["deepmind", "ucl"] },
      { person: "alexey-dosovitskiy", prior: ["google"] },
      { person: "josh-tobin", prior: ["openai", "startup"] },
      { person: "caiming-xiong", prior: ["salesforce", "startup"] },
      { person: "yuandong-tian", prior: ["meta"] },
      { person: "tim-shi", prior: ["openai", "startup"] },
      { person: "jeff-clune", prior: ["deepmind", "openai", "alberta"] },
    ],
    knownFor:
      "Self-improving AI; raised $500M+ within four months of founding.",
    location: CITIES.sf,
  },
  {
    slug: "ami-labs",
    name: "AMI Labs",
    valuation: { usdM: 4_500, qualifier: "approx" },
    year: 2025,
    domain: "world",
    founders: [
      { person: "yann-lecun", prior: ["meta"] },
      { person: "alexandre-lebrun", prior: ["meta", "startup"] },
    ],
    knownFor: "LeCun's post-Meta bet on world models over LLMs.",
    location: CITIES.paris,
  },
  {
    slug: "unconventional-ai",
    name: "Unconventional AI",
    valuation: { usdM: 4_500, qualifier: "exact" },
    year: 2025,
    domain: "compute",
    founders: [
      {
        person: "naveen-rao",
        prior: ["databricks", "mosaicml", "intel", "nervana", "qualcomm"],
      },
      {
        person: "meelan-lee",
        prior: ["chipletz", "google", "qualcomm", "atheros"],
      },
      { person: "michael-carbin", prior: ["mit", "microsoft", "mosaicml"] },
      {
        person: "sara-achour",
        prior: ["stanford", "sendyne", "aarno", "qualcomm", "salk"],
      },
    ],
    knownFor:
      "Serial hardware founder (Nervana→Intel, MosaicML→Databricks) building analog AI chips for biology-scale efficiency.",
    location: CITIES.sf,
  },
  {
    slug: "humans-and",
    name: "humans&",
    valuation: { usdM: 4_480, qualifier: "exact" },
    year: 2026,
    domain: "general",
    founders: [
      { person: "eric-zelikman", prior: ["xai", "stanford"] },
      { person: "georges-harik", prior: ["google"] },
      { person: "andi-peng", prior: ["anthropic"] },
      { person: "yuchen-he", prior: ["xai", "openai", "meta"] },
      { person: "noah-goodman", prior: ["google", "stanford"] },
    ],
    knownFor:
      "Human-centric frontier lab founded by alumni of xAI, OpenAI, Meta, Anthropic, Google, and Stanford; $480M seed within months of founding.",
    location: CITIES.sf,
  },
  {
    slug: "core-automation",
    name: "Core Automation",
    valuation: { usdM: 4_000, qualifier: "approx", rumored: true },
    year: 2026,
    domain: "rsi",
    tags: ["continual-learning"],
    founders: [
      { person: "jerry-tworek", prior: ["openai"] },
      { person: "rohan-anil", prior: ["deepmind", "google", "anthropic"] },
      { person: "joanne-jang", prior: ["openai"] },
      { person: "anmol-gulati", prior: ["deepmind"] },
      { person: "julia-villagra", prior: ["openai"] },
    ],
    knownFor: "Ex-OpenAI VP building “the world's most automated AI lab”.",
    location: CITIES.sf,
  },
  {
    slug: "inflection-ai",
    name: "Inflection AI",
    valuation: { usdM: 4_000, qualifier: "approx" },
    year: 2022,
    domain: "applied",
    founders: [
      { person: "mustafa-suleyman", prior: ["deepmind"] },
      { person: "karen-simonyan", prior: ["deepmind"] },
      { person: "reid-hoffman", prior: ["startup", "greylock"] },
    ],
    knownFor:
      "The Pi assistant, then a 2024 Microsoft reverse acquihire of its co-founders and much of its team; rebuilt since under CEO Sean White as an enterprise AI company.",
    location: CITIES.paloAlto,
    exit: { type: "acquihire", absorbed: false, to: "Microsoft", year: 2024 },
  },
  {
    slug: "luma-ai",
    name: "Luma AI",
    valuation: { usdM: 4_000, qualifier: "approx" },
    year: 2021,
    domain: "media",
    tags: ["agents", "video"],
    founders: [
      { person: "amit-jain", prior: ["apple", "circlemedical"] },
      {
        person: "alex-yu",
        prior: ["berkeley", "google", "adobe"],
      },
      {
        person: "alberto-taiuti",
        prior: ["apple", "codeplay"],
      },
    ],
    knownFor:
      "Dream Machine and the Ray video-model family; evolved from neural rendering and smartphone 3D capture into generative video.",
    location: CITIES.paloAlto,
  },
  {
    slug: "hark",
    name: "Hark",
    valuation: { usdM: 6_000, qualifier: "exact" },
    year: 2025,
    domain: "applied",
    tags: ["agents"],
    founders: [{ person: "brett-adcock", prior: ["archer", "figureai"] }],
    knownFor:
      "Personalised multimodal AI and bespoke hardware designed as a new interface to computing.",
    location: CITIES.sanJose,
  },
  {
    slug: "ricursive",
    name: "Ricursive Intelligence",
    valuation: { usdM: 4_000, qualifier: "exact" },
    year: 2025,
    domain: "compute",
    founders: [
      {
        person: "anna-goldie",
        prior: ["google", "deepmind", "anthropic", "stanford"],
      },
      {
        person: "azalia-mirhoseini",
        prior: ["google", "deepmind", "anthropic", "stanford"],
      },
    ],
    knownFor:
      "The researchers behind AI-designed chip floorplanning, now doing it commercially.",
    location: CITIES.paloAlto,
  },
  {
    slug: "xaira-therapeutics",
    name: "Xaira Therapeutics",
    valuation: { usdM: 3_350, qualifier: "undisclosed" },
    year: 2023,
    domain: "science",
    tags: ["drug-discovery"],
    founders: [
      { person: "marc-tessier-lavigne", prior: ["stanford", "genentech"] },
      { person: "david-baker", prior: ["washington"] },
      { person: "hetu-kamisetty", prior: ["meta", "washington"] },
      { person: "vikram-bajaj", prior: ["foresite"] },
    ],
    knownFor:
      "An AI-native drug-discovery company combining model research, data generation and therapeutic development.",
    location: CITIES.southSf,
  },
  {
    slug: "isomorphic-labs",
    name: "Isomorphic Labs",
    valuation: { usdM: 3_500, qualifier: "undisclosed" },
    year: 2021,
    domain: "science",
    tags: ["drug-discovery"],
    structure: "subsidiary",
    founders: [{ person: "demis-hassabis", prior: ["deepmind"] }],
    knownFor:
      "Alphabet’s AI drug-discovery company, building predictive and generative models beyond AlphaFold.",
    location: CITIES.london,
  },
  {
    slug: "decart",
    name: "Decart",
    valuation: { usdM: 4_000, qualifier: "approx" },
    year: 2023,
    domain: "world",
    tags: ["video"],
    founders: [
      { person: "dean-leitersdorf", prior: ["technion", "unit8200"] },
      { person: "moshe-shalev", prior: ["unit8200"] },
    ],
    knownFor: "Real-time generative world models — Oasis and Mirage.",
    location: CITIES.telAviv,
  },
  {
    slug: "sakana-ai",
    name: "Sakana AI",
    valuation: { usdM: 2_650, qualifier: "exact" },
    year: 2023,
    domain: "general",
    tags: ["sovereign"],
    founders: [
      { person: "david-ha", prior: ["google"] },
      { person: "llion-jones", prior: ["google"] },
      { person: "ren-ito", prior: ["startup"] },
    ],
    knownFor:
      "Japan's first AI unicorn, co-founded by a Transformer co-author; nature-inspired model merging and AI for science, betting on sample efficiency over raw compute.",
    location: CITIES.tokyo,
  },
  {
    slug: "general-intuition",
    name: "General Intuition",
    valuation: { usdM: 2_300, qualifier: "exact" },
    year: 2025,
    domain: "world",
    tags: ["video"],
    founders: [
      { person: "pim-de-witte", prior: ["medal"] },
      { person: "eloi-alonso", prior: ["geneva", "ubisoft", "microsoft"] },
      {
        person: "adam-jelley",
        prior: ["cambridge", "dataiku", "edinburgh", "microsoft"],
      },
      {
        person: "vincent-micheli",
        prior: ["epfl", "geneva", "microsoft", "wayve"],
      },
    ],
    knownFor:
      "Action and world models trained on gameplay video to perceive, predict and act in virtual and physical environments.",
    location: CITIES.newYork,
  },
  {
    slug: "liquid-ai",
    name: "Liquid AI",
    valuation: { usdM: 2_000, qualifier: "gt" },
    year: 2023,
    domain: "general",
    tags: ["academic-spinout", "on-device", "open-weights"],
    founders: [
      { person: "daniela-rus", prior: ["mit", "cornell", "dartmouth"] },
      {
        person: "ramin-hasani",
        prior: ["mit", "vanguard", "tuwien", "infineon"],
      },
      { person: "mathias-lechner", prior: ["mit", "ista"] },
      { person: "alexander-amini", prior: ["mit", "themis"] },
    ],
    knownFor:
      "MIT CSAIL spinout; liquid neural networks for on-device inference.",
    location: CITIES.cambridgeMa,
  },
  {
    slug: "h-company",
    name: "H (The H Company)",
    valuation: { usdM: 370, qualifier: "undisclosed" },
    year: 2024,
    domain: "applied",
    tags: ["agents", "open-weights"],
    founders: [
      {
        person: "charles-kantor",
        prior: ["psl", "centralesupelec", "stanford", "harvard"],
      },
      {
        person: "laurent-sifre",
        prior: ["polytechnique", "ponts", "deepmind"],
      },
      { person: "daan-wierstra", prior: ["idsia", "deepmind"] },
      {
        person: "karl-tuyls",
        prior: ["vub", "maastricht", "liverpool", "deepmind"],
      },
      {
        person: "julien-perolat",
        prior: ["lille", "deepmind"],
      },
    ],
    knownFor:
      "French agentic/computer-use AI company, founded by a large ex-DeepMind contingent.",
    location: CITIES.paris,
  },
  {
    slug: "rhoda-ai",
    name: "Rhoda AI",
    valuation: { usdM: 1_700, qualifier: "exact" },
    year: 2024,
    domain: "physical",
    tags: ["robot-foundation-models"],
    founders: [{ person: "jagdeep-singh", prior: ["startup"] }],
    knownFor:
      "Serial founder Jagdeep Singh's robotics startup; FutureVision, a video-pretrained foundation model ('Direct Video-Action') that predicts the next frames of a scene and converts them into motor commands, driving a bimanual manipulation platform on factory lines.",
    location: CITIES.sf,
  },
  {
    slug: "axiom-math",
    name: "Axiom Math",
    valuation: { usdM: 1_600, qualifier: "gt" },
    year: 2025,
    domain: "science",
    tags: ["math", "open-source"],
    founders: [
      { person: "carina-hong", prior: ["stanford"] },
      { person: "shubho-sengupta", prior: ["meta", "google"] },
    ],
    knownFor:
      "AxiomProver, an AI system for mathematical research that generates formally verified Lean proofs.",
    location: CITIES.paloAlto,
  },
  {
    slug: "flapping-airplanes",
    name: "Flapping Airplanes",
    valuation: { usdM: 1_500, qualifier: "exact" },
    year: 2025,
    domain: "general",
    founders: [
      { person: "ben-spector", prior: ["stanford"] },
      { person: "asher-spector", prior: ["stanford"] },
      { person: "aidan-smith", prior: ["georgiatech", "neuralink"] },
    ],
    knownFor:
      "A research lab pursuing radically more data-efficient AI, especially in data-constrained fields such as robotics and science.",
    location: CITIES.sf,
  },
  {
    slug: "magic",
    name: "Magic",
    valuation: { usdM: 1_500, qualifier: "approx", rumored: true },
    year: 2022,
    domain: "coding",
    founders: [
      { person: "eric-steinberger", prior: ["meta"] },
      { person: "sebastian-de-ro", prior: ["startup"] },
    ],
    knownFor:
      "AI models for software development, including ultra-long-context systems.",
    location: CITIES.sf,
  },
  {
    slug: "harmonic",
    name: "Harmonic",
    valuation: { usdM: 1_450, qualifier: "exact" },
    year: 2023,
    domain: "science",
    tags: ["math"],
    founders: [
      { person: "vlad-tenev", prior: ["startup", "stanford"] },
      { person: "tudor-achim", prior: ["cmu", "stanford", "startup", "quora"] },
    ],
    knownFor:
      "Co-founded by Robinhood's Vlad Tenev (chairman) and CEO Tudor Achim, building formally verified mathematical superintelligence (the Aristotle model).",
    location: CITIES.paloAlto,
  },
  {
    slug: "ai21-labs",
    name: "AI21 Labs",
    valuation: { usdM: 1_400, qualifier: "exact" },
    year: 2017,
    domain: "applied",
    tags: ["open-weights"],
    founders: [
      { person: "ori-goshen", prior: ["startup"] },
      { person: "yoav-shoham", prior: ["stanford", "google"] },
      { person: "amnon-shashua", prior: ["mobileye", "hebrew"] },
    ],
    knownFor:
      "The original Israeli LLM company, predating the current wave by five years; its Jamba models pair Mamba state-space layers with transformer blocks for long context at lower memory cost.",
    location: CITIES.telAviv,
  },
  {
    slug: "lila-sciences",
    name: "Lila Sciences",
    // Reuters, 14 Oct 2025: the $115M NVentures extension closing the Series A
    // "lifted its valuation to more than $1.3 billion" — a bound, never a point
    // value, hence `gt`. Total raised is $550M: a $200M Flagship-led seed
    // unveiled Mar 2025, then a $235M Series A co-led by Braidwell and
    // Collective Global announced 15 Sep 2025 and extended to $350M on 14 Oct
    // 2025 with NVentures, Analog Devices, IQT, Dauntless, Catalio and Pennant
    // joining.
    //
    // Deliberately not updated to the $8.5B circulating since 3 Jun 2026.
    // Bloomberg has the company "in talks to raise about $2 billion" at that
    // figure; both Lila and CalPERS declined to comment, it is a pre-money on
    // an unclosed round, Sacra states terms are not final, and Lila's own news
    // feed runs to Jul 2026 with no Series B item. An asking price is not a
    // valuation. Caplight's $10.5B post and $785M raised are its own
    // arithmetic on that story, not a disclosure. The four "Lila Sciences"
    // Form Ds on EDGAR are third-party SPV feeders (Alumni Ventures, Sydecar)
    // whose $30K-$1.56M offerings price nothing, though the two with Jun 2026
    // first sales do corroborate a raise being assembled when Bloomberg
    // reported it.
    valuation: { usdM: 1_300, qualifier: "gt" },
    year: 2023,
    domain: "science",
    tags: ["agents", "drug-discovery", "materials"],
    founders: [
      { person: "geoffrey-von-maltzahn", prior: ["mit", "startup"] },
      { person: "noubar-afeyan", prior: ["mit", "startup"], isBacker: true },
    ],
    knownFor:
      "Flagship Pioneering's scientific superintelligence venture: the Lila Iris reasoning model driving AI Science Factory autonomous labs, which have closed the loop across hundreds of thousands of experiments spanning antibodies, genetic medicines, catalysts and coatings.",
    location: CITIES.cambridgeMa,
  },
  {
    slug: "chai-discovery",
    name: "Chai Discovery",
    valuation: { usdM: 3_800, qualifier: "exact" },
    year: 2024,
    domain: "science",
    tags: ["drug-discovery", "open-weights"],
    founders: [
      { person: "joshua-meier", prior: ["meta", "openai", "absci"] },
      { person: "jack-dent", prior: ["stripe"] },
      { person: "matthew-mcpartlon", prior: ["vantai"] },
      { person: "jacques-boitreaud", prior: ["aqemia"] },
    ],
    knownFor:
      "OpenAI-backed; Chai-1 structure prediction and Chai-2 de novo antibody design, used by Pfizer, Lilly and Novartis.",
    location: CITIES.sf,
  },
  {
    slug: "goodfire",
    name: "Goodfire",
    valuation: { usdM: 1_250, qualifier: "exact" },
    year: 2024,
    domain: "safety",
    founders: [
      { person: "eric-ho", prior: ["startup"] },
      { person: "tom-mcgrath", prior: ["deepmind"] },
      { person: "dan-balsam", prior: ["startup"] },
    ],
    knownFor:
      "One of the first companies built entirely around mechanistic interpretability; Ember, an API for inspecting and steering model internals.",
    location: CITIES.sf,
  },
  {
    slug: "evolutionaryscale",
    name: "EvolutionaryScale",
    // $142M raised in two tranches: ~$40M led by Lux in Aug 2023, then $102M
    // at the ESM3 launch in Jun 2024 (Nat Friedman and Daniel Gross with Lux,
    // Amazon and Nvidia's NVentures). Only the first was ever priced in
    // public — Forbes' sources put it at $200M post. The Jun 2024 tranche has
    // no reported figure and the Nov 2025 Biohub transaction was explicitly
    // undisclosed, so the nominal steps that anchor up for a $102M raise at
    // ~17% dilution. UpMarket's $1.14B is a secondary-marketplace model
    // rather than a round, and is not used.
    valuation: { usdM: 600, qualifier: "undisclosed" },
    year: 2024,
    domain: "science",
    tags: ["drug-discovery", "open-weights"],
    founders: [
      { person: "alexander-rives", prior: ["meta"] },
      { person: "tom-sercu", prior: ["meta"] },
      { person: "sal-candido", prior: ["meta"] },
    ],
    knownFor:
      "Creator of ESM3, a generative model for protein sequence, structure and function that produced a novel fluorescent protein; its team later joined Biohub.",
    location: CITIES.newYork,
    exit: {
      type: "acquihire",
      absorbed: true,
      to: "Chan Zuckerberg Biohub",
      year: 2025,
    },
  },
  {
    slug: "moonvalley",
    name: "Moonvalley",
    // $154M raised, per the company's own release: a $70M seed (General
    // Catalyst and Khosla, Nov 2024) and $84M more (General Catalyst, with
    // CAA, CoreWeave and Comcast Ventures, Jul 2025). The 84 that stood here
    // was the second round alone, not the total. Neither round was priced in
    // public — Private Capital Journal called the second a "lofty valuation"
    // without printing one — and the Reka merger was an all-share exchange
    // with no ratio disclosed, so no price can be derived from it. The
    // nominal prices the $84M at ~17% dilution.
    valuation: { usdM: 500, qualifier: "undisclosed" },
    year: 2024,
    domain: "media",
    tags: ["video"],
    founders: [
      {
        person: "naeem-talukdar",
        prior: ["toronto", "toggl", "zapier", "contentfly"],
      },
      {
        person: "mateusz-malinowski",
        prior: ["maxplanck", "saarland", "deepmind"],
      },
      {
        person: "mikolaj-binkowski",
        prior: ["imperial", "google", "mila", "deepmind"],
      },
      {
        person: "john-thomas",
        prior: ["toronto", "ibm", "jackman", "contentfly"],
      },
      { person: "bryn-mooser", prior: ["ryot", "verizon", "xtr", "asteria"] },
    ],
    knownFor:
      "Marey, a filmmaking-focused generative video model trained on licensed footage and built for precise creative control; later joined forces with Reka.",
    location: CITIES.toronto,
    exit: { type: "acquired", absorbed: true, to: "reka", year: 2026 },
  },
  {
    slug: "aaru",
    name: "Aaru",
    valuation: { usdM: 1_000, qualifier: "exact", rumored: true },
    year: 2024,
    domain: "world",
    founders: [
      { person: "cameron-fink" },
      { person: "ned-koh" },
      { person: "john-kessler", prior: ["mit"] },
    ],
    knownFor:
      "AI-built populations and worlds that simulate how groups respond to new products, policies and other changed conditions.",
    location: CITIES.newYork,
  },
  {
    slug: "simile",
    name: "Simile",
    valuation: { usdM: 2_000, qualifier: "exact" },
    year: 2025,
    domain: "world",
    founders: [
      { person: "joon-sung-park", prior: ["stanford"] },
      { person: "michael-bernstein", prior: ["stanford"] },
      { person: "percy-liang", prior: ["stanford"] },
      { person: "lainie-yallen", prior: ["startup", "mcgill"] },
    ],
    knownFor: "The Stanford generative-agents lineage, commercialised.",
    location: CITIES.paloAlto,
  },
  {
    slug: "ndea",
    name: "Ndea",
    valuation: { usdM: 1_000, qualifier: "undisclosed" },
    year: 2025,
    domain: "rsi",
    founders: [
      { person: "francois-chollet", prior: ["google"] },
      { person: "mike-knoop", prior: ["startup"] },
    ],
    knownFor:
      "Keras and Zapier founders betting on program synthesis over scaling.",
    location: CITIES.sf,
  },
  {
    slug: "imbue",
    name: "Imbue",
    priorNames: ["Generally Intelligent"],
    valuation: { usdM: 1_000, qualifier: "gt" },
    year: 2022,
    domain: "applied",
    tags: ["agents", "open-source"],
    founders: [
      { person: "kanjun-qiu", prior: ["startup"] },
      { person: "josh-albrecht", prior: ["startup"] },
    ],
    knownFor:
      "Reached unicorn status early via a 2023 Nvidia-backed round; now known for Sculptor, a sandboxed parallel coding-agent tool.",
    location: CITIES.sf,
  },
  {
    slug: "aai",
    name: "doubleAI",
    priorNames: ["AAI"],
    valuation: { usdM: 1_000, qualifier: "gt", rumored: true },
    year: 2023,
    domain: "general",
    founders: [
      { person: "amnon-shashua", prior: ["mobileye", "hebrew"] },
      { person: "shai-shalev-shwartz", prior: ["mobileye", "hebrew"] },
      { person: "yoav-levine", prior: ["ai21"] },
      { person: "or-sharir", prior: ["ai21"] },
      { person: "noam-wies", prior: ["startup"] },
      { person: "gal-beniamini", prior: ["google"] },
    ],
    knownFor:
      "A once-stealth lab pursuing 'Artificial Expert Intelligence' — deep domain-expert AI rather than AGI — now public with its first system, WarpSpeed, for GPU kernel optimisation.",
    location: CITIES.telAviv,
  },
  {
    slug: "reka",
    name: "Reka",
    valuation: { usdM: 1_000, qualifier: "exact" },
    year: 2022,
    domain: "physical",
    tags: ["multimodal"],
    founders: [
      { person: "dani-yogatama", prior: ["deepmind", "baidu", "cmu"] },
      {
        person: "cyprien-de-masson-dautume",
        prior: ["deepmind"],
      },
      {
        person: "qi-liu",
        prior: ["deepmind", "meta", "microsoft", "oxford", "nus", "shandong"],
      },
      { person: "mikel-artetxe", prior: ["meta", "deepmind", "basque"] },
      { person: "yi-tay", prior: ["google", "ntu"] },
    ],
    knownFor:
      "Models for physical-world intelligence: reasoning, simulation and action across robots, wearables, media and edge devices.",
    location: CITIES.sf,
  },
  {
    slug: "kyutai",
    name: "Kyutai",
    valuation: { usdM: 330, qualifier: "undisclosed" },
    year: 2023,
    domain: "media",
    structure: "nonprofit",
    tags: ["open-source", "open-weights", "voice"],
    founders: [
      { person: "patrick-perez", prior: ["valeo"] },
      { person: "neil-zeghidour", prior: ["deepmind", "google", "meta"] },
      { person: "alexandre-defossez", prior: ["meta"] },
      { person: "edouard-grave", prior: ["meta"] },
      { person: "laurent-mazare", prior: ["deepmind"] },
      { person: "herve-jegou", prior: ["meta"] },
      { person: "xavier-niel", prior: ["startup"], isBacker: true },
      { person: "rodolphe-saade", prior: ["startup"], isBacker: true },
    ],
    knownFor:
      "Non-profit European open-science lab; Moshi shipped real-time voice before the big labs.",
    location: CITIES.paris,
  },
  {
    slug: "arcee-ai",
    name: "Arcee AI",
    valuation: { usdM: 1_000, qualifier: "gt", rumored: true },
    year: 2023,
    domain: "applied",
    tags: ["open-source", "open-weights", "training-infra-tools"],
    founders: [
      { person: "mark-mcquade", prior: ["huggingface", "roboflow"] },
      { person: "jacob-solawetz", prior: ["startup"] },
      { person: "brian-benedict", prior: ["huggingface"] },
    ],
    knownFor:
      "Small enterprise language models; absorbed mergekit (created by Charles Goddard, now Arcee's Chief of Frontier Research) via a 2024 merger.",
    location: CITIES.miami,
  },
  {
    slug: "essential-ai",
    name: "Essential AI",
    // ~$65M raised, per the company: an $8.3M seed (Thrive) and a $56.5M
    // Series A (March Capital, with Google, Nvidia, AMD and Thrive, Dec
    // 2023); PitchBook carries $76M, implying an extension that was never
    // announced. Nothing was ever priced in public. The nominal prices the
    // Series A at ~22% dilution and deliberately does not step up from
    // there, because the lab did not: no round followed in the two and a half
    // years to the Nvidia acquihire. The "$1B valuation / $175M Series B"
    // figures on auto-generated profile sites are contradicted by Crunchbase,
    // Tracxn and PitchBook alike — do not adopt.
    valuation: { usdM: 250, qualifier: "undisclosed" },
    year: 2023,
    domain: "general",
    tags: ["open-weights"],
    founders: [
      { person: "ashish-vaswani", prior: ["google", "adept"] },
      { person: "niki-parmar", prior: ["google", "adept"] },
    ],
    knownFor:
      "An open platform for deep-learning research and engineering; released Rnj-1, an open-weight language-model family for code and STEM work.",
    location: CITIES.sf,
    exit: { type: "acquihire", absorbed: false, to: "Nvidia", year: 2026 },
  },
  {
    slug: "zyphra",
    name: "Zyphra",
    valuation: { usdM: 5_000, qualifier: "gt", rumored: true },
    year: 2021,
    domain: "general",
    tags: ["open-source", "open-weights"],
    founders: [
      {
        person: "krithik-puthalath",
        prior: ["cambridgequantum", "uiuc", "ibm", "xerion"],
      },
      { person: "danny-martinelli" },
      { person: "beren-millidge", prior: ["conjecture", "oxford", "edinburgh"] },
      {
        person: "tomas-figliolia",
        prior: ["apple", "xilinx", "qualcomm", "jhu"],
      },
    ],
    knownFor:
      "Outsized results from small models; the Zamba and Zaya (ZAYA1) stack.",
    location: CITIES.sf,
  },
  {
    slug: "mirendil",
    name: "Mirendil",
    valuation: { usdM: 1_000, qualifier: "exact" },
    year: 2026,
    domain: "rsi",
    founders: [
      {
        person: "behnam-neyshabur",
        prior: ["anthropic", "google", "deepmind"],
      },
      { person: "harsh-mehta", prior: ["anthropic", "google"] },
    ],
    knownFor:
      "Founded by ex-Anthropic researchers Behnam Neyshabur and Harsh Mehta, building self-improving AI for scientific R&D; backed by a16z and Kleiner Perkins.",
    location: CITIES.sf,
  },
  {
    slug: "nous-research",
    name: "Nous Research",
    valuation: { usdM: 1_000, qualifier: "exact" },
    year: 2023,
    domain: "applied",
    tags: ["agents", "open-source", "open-weights"],
    founders: [
      { person: "jeffrey-quesnelle", prior: ["startup"] },
      { person: "karan-malhotra", prior: ["startup"] },
      { person: "ryan-teknium", prior: ["stabilityai"] },
      { person: "shivani-mitra", prior: ["startup"] },
    ],
    knownFor:
      "Open-source Hermes models and decentralised training, from an internet-native collective.",
    location: CITIES.newYork,
  },
  {
    slug: "merge-labs",
    name: "Merge Labs",
    valuation: { usdM: 850, qualifier: "exact" },
    year: 2026,
    domain: "science",
    tags: ["neurotech"],
    founders: [
      {
        person: "mikhail-shapiro",
        prior: ["brown", "mit", "cyberkinetics", "thirdrock", "caltech"],
      },
      {
        person: "tyson-aflalo",
        prior: ["princeton", "caltech", "forestneuro"],
      },
      {
        person: "sumner-norman",
        prior: ["utah", "ucirvine", "caltech", "aestudio", "forestneuro"],
      },
      {
        person: "alex-blania",
        prior: ["fau", "maxplanck", "caltech", "toolsforhumanity"],
      },
      {
        person: "sandro-herbig",
        prior: ["fau", "maxplanck", "caltech", "toolsforhumanity"],
      },
      {
        person: "sam-altman",
        prior: ["stanford", "loopt", "ycombinator", "openai"],
        isBacker: true,
      },
    ],
    knownFor:
      "Less-invasive, high-bandwidth brain-computer interfaces combining biology, devices and AI.",
    location: CITIES.sf,
  },
  {
    slug: "inferact",
    name: "Inferact",
    valuation: { usdM: 800, qualifier: "exact" },
    year: 2026,
    domain: "inference",
    tags: ["open-source"],
    founders: [
      { person: "simon-mo", prior: ["berkeley", "anyscale", "characterai"] },
      {
        person: "woosuk-kwon",
        prior: ["berkeley", "seoulnational", "deepmind", "thinking-machines"],
      },
      { person: "kaichao-you", prior: ["tsinghua", "berkeley", "apple"] },
      { person: "roger-wang", prior: ["roblox", "waterloo", "washington"] },
    ],
    knownFor:
      "Founded by vLLM’s creators and core maintainers to build and commercialise open-source LLM inference infrastructure.",
    location: CITIES.berkeley,
  },
  {
    slug: "isara",
    name: "Isara Laboratories",
    valuation: { usdM: 650, qualifier: "exact" },
    year: 2025,
    domain: "applied",
    tags: ["agents"],
    founders: [
      { person: "eddie-zhang", prior: ["openai", "mit", "harvard"] },
      { person: "henry-gasztowtt", prior: ["oxbridge"] },
    ],
    knownFor:
      "OpenAI-backed; demoed ~2,000 agents forecasting commodity prices for finance and biotech analysis.",
    location: CITIES.sf,
  },
  {
    slug: "engram",
    name: "Engram",
    // $98M round announced 23 Jun 2026 at a reported $600M post-money
    // valuation, co-led by General Catalyst and Modern Capital.
    valuation: { usdM: 600, qualifier: "exact" },
    year: 2026,
    domain: "rsi",
    tags: ["agents", "continual-learning"],
    founders: [
      { person: "dan-biderman", prior: ["columbia", "stanford"] },
      { person: "sabri-eyuboglu", prior: ["stanford"] },
      { person: "jack-morris", prior: ["cornell", "meta", "google"] },
      { person: "jessy-lin", prior: ["berkeley", "meta"] },
      { person: "scott-linderman", prior: ["stanford", "harvard"] },
      { person: "chris-re", prior: ["stanford", "washington"] },
    ],
    knownFor:
      "A learned memory layer that trains models on an organization's knowledge in advance, creating compact, continuously improving memories that use up to 100× fewer tokens.",
    location: CITIES.sf,
  },
  {
    slug: "inception-labs",
    name: "Inception Labs",
    valuation: { usdM: 500, qualifier: "approx" },
    year: 2025,
    domain: "general",
    founders: [
      { person: "stefano-ermon", prior: ["stanford"] },
      { person: "aditya-grover", prior: ["ucla"] },
      { person: "volodymyr-kuleshov", prior: ["cornell"] },
    ],
    knownFor:
      "Develops and deploys diffusion-based language models, including Mercury, for production applications.",
    location: CITIES.paloAlto,
  },
  {
    slug: "elorian",
    name: "Elorian AI",
    valuation: { usdM: 300, qualifier: "exact" },
    year: 2025,
    domain: "general",
    tags: ["vision"],
    founders: [
      { person: "andrew-dai", prior: ["deepmind", "google"] },
      { person: "yinfei-yang", prior: ["apple", "google"] },
    ],
    knownFor:
      "Ex-DeepMind and Apple leads working on vision-grounded reasoning.",
    location: CITIES.paloAlto,
  },
  {
    slug: "standard-intelligence",
    name: "Standard Intelligence",
    valuation: { usdM: 500, qualifier: "exact" },
    year: 2024,
    domain: "general",
    tags: ["agents", "video"],
    founders: [
      { person: "galen-mead", prior: ["startup"] },
      { person: "devansh-pandey", prior: ["startup"] },
    ],
    knownFor: "FDM-1, a video-first computer-use model.",
    location: CITIES.sf,
  },
  {
    slug: "adaption-labs",
    name: "Adaption Labs",
    valuation: { usdM: 500, qualifier: "undisclosed" },
    year: 2025,
    domain: "rsi",
    tags: ["continual-learning"],
    founders: [
      { person: "sara-hooker", prior: ["cohere", "google"] },
      { person: "sudip-roy", prior: ["cohere", "google"] },
    ],
    knownFor: "Cohere For AI leadership betting that adaptation beats scale.",
    location: CITIES.sf,
  },
  {
    slug: "poetiq",
    name: "Poetiq",
    valuation: { usdM: 46, qualifier: "undisclosed" },
    year: 2025,
    domain: "rsi",
    tags: ["agents"],
    founders: [
      { person: "shumeet-baluja", prior: ["google", "deepmind", "startup"] },
      { person: "ian-fischer", prior: ["google", "deepmind", "startup"] },
    ],
    knownFor:
      "Model-agnostic, self-improving reasoning systems that learn from solving new tasks.",
    location: CITIES.mountainView,
  },
  {
    slug: "genesis-ai",
    name: "Genesis AI",
    valuation: { usdM: 3_000, qualifier: "approx", rumored: true },
    year: 2025,
    domain: "physical",
    tags: ["robot-foundation-models"],
    founders: [
      { person: "zhou-xian", prior: ["cmu"] },
      { person: "theophile-gervet", prior: ["mistral", "cmu", "skild"] },
    ],
    knownFor:
      "Robotics foundation models (the GENE series) on a proprietary physics-simulation engine; a Franco-American team out of CMU, Mistral and Skild AI.",
    location: CITIES.paris,
  },
  {
    slug: "cusp-ai",
    name: "CuspAI",
    valuation: { usdM: 2_600, qualifier: "approx" },
    year: 2024,
    domain: "science",
    tags: ["materials"],
    founders: [
      { person: "chad-edwards", prior: ["deepmind"] },
      { person: "max-welling", prior: ["amsterdam", "microsoft"] },
    ],
    knownFor:
      "AI materials-discovery platform — expanding from carbon capture into semiconductors, batteries, coatings and catalysts.",
    location: CITIES.cambridgeUk,
  },
  {
    slug: "radixark",
    name: "RadixArk",
    valuation: { usdM: 400, qualifier: "exact" },
    year: 2026,
    domain: "inference",
    tags: ["open-source", "training-infra-tools"],
    founders: [
      {
        person: "ying-sheng",
        prior: ["xai", "databricks", "stanford"],
      },
      {
        person: "banghua-zhu",
        prior: ["washington", "nvidia", "nexusflow"],
      },
    ],
    knownFor: "Commercialising SGLang; out of the LMSYS and xAI orbit.",
    location: CITIES.berkeley,
  },
  {
    slug: "qutwo",
    name: "QUTWO",
    valuation: { usdM: 380, qualifier: "exact" },
    year: 2026,
    domain: "compute",
    tags: ["sovereign"],
    founders: [
      { person: "peter-sarlin", prior: ["amd"] },
      { person: "kaj-mikael-bjork", prior: ["amd"] },
      { person: "kuan-yen-tan", prior: ["iqm"] },
    ],
    knownFor:
      "Qutwo OS and AI/quantum tooling for enterprises running classical, hybrid and quantum workloads.",
    location: CITIES.helsinki,
  },
  {
    slug: "sooth-labs",
    name: "Sooth Labs",
    valuation: { usdM: 335, qualifier: "exact" },
    year: 2026,
    domain: "world",
    founders: [
      { person: "chuck-hoover", prior: ["meta", "ea"] },
      { person: "yaser-sheikh", prior: ["meta", "cmu"] },
      { person: "ruslan-salakhutdinov", prior: ["meta", "cmu", "apple"] },
      { person: "david-larose", prior: ["carnegierobotics", "uber"] },
      { person: "shih-en-wei", prior: ["meta", "cmu"] },
    ],
    knownFor:
      "Ex-Meta Codec Avatars leadership, now on probabilistic forecasting.",
    location: CITIES.pittsburgh,
  },
  {
    slug: "stepfun",
    name: "StepFun",
    valuation: { usdM: 10_000, qualifier: "approx" },
    year: 2023,
    domain: "general",
    tags: ["multimodal", "open-weights"],
    founders: [
      { person: "jiang-daxin", prior: ["microsoft"] },
      { person: "zhu-yibo", prior: ["microsoft"] },
      { person: "jiao-binxing", prior: ["microsoft"] },
    ],
    knownFor:
      "The Step model series; unwound its VIE structure to file in Hong Kong.",
    location: CITIES.shanghai,
  },
  {
    slug: "galbot",
    name: "Galbot",
    valuation: { usdM: 3_000, qualifier: "gt" },
    year: 2023,
    domain: "physical",
    tags: ["humanoid", "robot-foundation-models"],
    founders: [
      { person: "wang-he", prior: ["peking", "stanford"] },
      { person: "yao-tengzhou" },
    ],
    knownFor:
      "Embodied foundation models and autonomous retail stores; over $900M raised.",
    location: CITIES.beijing,
  },
  {
    slug: "baichuan-ai",
    name: "Baichuan AI",
    valuation: { usdM: 2_900, qualifier: "approx" },
    year: 2023,
    domain: "applied",
    tags: ["agents"],
    founders: [{ person: "wang-xiaochuan", prior: ["sogou"] }],
    knownFor:
      "Sogou's founder; shifted strategic focus from the general-purpose LLM race toward AI-for-healthcare, while continuing to develop its base model series.",
    location: CITIES.beijing,
  },
  {
    slug: "01-ai",
    name: "01.AI",
    // Last widely reported valuation was >$1B in November 2023; no current
    // figure has been disclosed since it stepped back from frontier pretraining.
    valuation: { usdM: 1_000, qualifier: "undisclosed" },
    year: 2023,
    domain: "applied",
    tags: ["open-weights"],
    founders: [
      {
        person: "kai-fu-lee",
        prior: ["sinovation", "google", "microsoft", "apple", "sgi"],
      },
      { person: "ma-jie", prior: ["baidu", "startup"] },
      { person: "anita-huang", prior: ["sinovation", "google", "startup"] },
      { person: "shen-pengfei", prior: ["baidu", "startup"] },
      { person: "qi-ruifeng", prior: ["sap", "microsoft", "cisco"] },
      { person: "gu-xuemei", prior: ["google", "alibaba"] },
      { person: "dai-zonghong", prior: ["huawei", "startup"] },
      {
        person: "li-xiangang",
        prior: ["baidu", "didi", "startup", "peking"],
      },
    ],
    knownFor:
      "The Yi model family; stopped pretraining in March 2025 and now builds enterprise applications on DeepSeek's models.",
    location: CITIES.beijing,
  },

  {
    slug: "sarvam-ai",
    name: "Sarvam AI",
    // $234M first close of a $300M Series B at $1.5B post (June 2026), with an
    // Nvidia-led extension in August.
    valuation: { usdM: 1_500, qualifier: "exact" },
    year: 2023,
    domain: "general",
    tags: ["open-weights", "sovereign", "voice"],
    founders: [
      { person: "vivek-raghavan", prior: ["uidai", "startup"] },
      { person: "pratyush-kumar", prior: ["microsoft"] },
    ],
    knownFor:
      "Foundation models and speech built for Indian languages; selected under the IndiaAI Mission to build an indigenous foundational model.",
    location: CITIES.bengaluru,
  },
  {
    slug: "oak-lab",
    name: "Oak Lab",
    // Launched July 2026. No funding, investors or valuation disclosed.
    valuation: { usdM: 400, qualifier: "undisclosed" },
    year: 2026,
    domain: "rsi",
    tags: ["continual-learning"],
    founders: [
      { person: "richard-sutton", prior: ["keen", "deepmind", "alberta"] },
      { person: "khurram-javed", prior: ["keen", "alberta"] },
    ],
    knownFor:
      "The Turing laureate who wrote the book on reinforcement learning, arguing today's methods are a dead end and betting on agents that learn from their own experience — targeting a trillion-parameter agent that plans in real time on 20 watts.",
    location: CITIES.toronto,
  },
  {
    slug: "moonlake-ai",
    name: "Moonlake AI",
    // $28M seed (Threshold, AIX Ventures, NVIDIA Ventures) announced Oct 2025;
    // no valuation was disclosed, so usdM is a nominal placeholder only.
    valuation: { usdM: 120, qualifier: "exact" },
    year: 2025,
    domain: "world",
    founders: [
      { person: "fan-yun-sun", prior: ["stanford", "nvidia"] },
      { person: "sharon-lee", prior: ["stanford"] },
    ],
    knownFor:
      "Vibe-coding interactive worlds and games from text; $28M seed backed by Ian Goodfellow, Jeff Dean, and other angels.",
    location: CITIES.sf,
  },
  {
    slug: "inherent",
    name: "Inherent",
    // Never priced in public. TipRanks leaves the post-money column empty,
    // Notice.co says outright it is "missing all Inherent funding round
    // valuations", Crunchbase has no page, and none of Sifted, Tech.eu, TNW or
    // UKTN printed a figure. Dealroom's "$200-300m enterprise value" is the
    // same band it models for Orbital on $71M raised — it brackets capital,
    // not worth, and is not used. No Caplight, Forge or Hiive mark exists and
    // none can: the company was four months old at announcement. Tracxn also
    // carries an unrelated Inherent, a 1993 San Francisco IT-services firm.
    //
    // The round is firm: $50M seed announced 28 May 2026, co-led by Index
    // (Danny Rimer) and Radical, with Nvidia's NVentures, Ex/Ante, Metaplanet,
    // Macroscopic and Mythos — seven investors on a first cheque, per Wilson
    // Sonsini and TNW. Neither register helps. EDGAR full-text returns nothing
    // for "Inherent Laboratories", and its twelve Inherent registrants are
    // Inherent Group's ESG and credit funds, a Utah biotech and an LLC; the
    // identical query returns Deep Cogito's Form D and D/A, so the absence is
    // real. Inherent Laboratories Ltd (16968849, incorporated 16 Jan 2026) has
    // filed no SH01 and still stands at £1 of capital, so the equity sits in
    // the Delaware parent that the public-benefit structure and a San
    // Francisco Wilson Sonsini team imply; the opco's only substantive filings
    // are two HSBC Innovation Banking charges created 22 Apr 2026, dating the
    // money in the bank five weeks before the announcement.
    //
    // A public-benefit corporation is for-profit and dilutes normally, so the
    // nominal inverts the seed at the house default of 20%: $250M. Two
    // co-leads plus Nvidia on a $50M first round closing three months after
    // incorporation argue tighter, but eleven staff with nothing shipped and
    // no published work under the Inherent name argue softer, and the AI
    // mega-seed comparables — SSI, Thinking Machines — cluster at 20% rather
    // than at the 12.5-13% this file reserves for priced step-ups. $200M is
    // the floor (25%: a lab selling a quarter of itself at seed does not draw
    // two competing leads and Nvidia) and $333M the ceiling (15%, a pre-empt).
    // The 5.0x multiple of raised is not an independent check here — on a
    // single-round company it is just 1/0.20 restated.
    valuation: { usdM: 250, qualifier: "undisclosed" },
    year: 2026,
    domain: "rsi",
    tags: ["agents"],
    structure: "public-benefit",
    founders: [
      { person: "tantum-collins", prior: ["deepmind", "whitehouse"] },
      { person: "edward-hughes", prior: ["deepmind", "lse", "queenmary"] },
      {
        person: "louis-kirsch",
        prior: ["deepmind", "google", "idsia", "ucl", "hpi"],
      },
      { person: "kaloyan-aleksiev", prior: ["reka", "microsoft", "oxford"] },
    ],
    knownFor:
      "London public-benefit AI lab developing inventive research agents and redesigning the lab itself around recursive collective self-improvement.",
    location: CITIES.london,
  },
  {
    slug: "logical-intelligence",
    name: "Logical Intelligence",
    // No round amount has ever been disclosed and no priced valuation exists.
    // Crunchbase obfuscates every financial field, CB Insights masks the
    // amount, PitchBook's Amount, Raised-to-Date and Post-Val columns are all
    // empty on its single deal, and Dealroom carries "no known external
    // funding" at all — so there is not even a tracker EV range to argue with
    // here, and no secondary mark exists on Caplight, Forge, Hiive or
    // UpMarket. EDGAR full-text search returns zero Form D for "Logical
    // Intelligence" and "Logical Intelligence Inc", and none for the
    // personal-name variants tried; the EDGAR company index has no such
    // registrant either, and the same query returns Deep Cogito's Form D and
    // D/A, while "Pebblebed" returns four fund-level Form Ds — so the absence
    // is real rather than a broken search.
    //
    // What is on record is one seed, dated 1 Oct 2025 by CB Insights and 1 Nov
    // 2025 by PitchBook, with Pebblebed, Cathay Innovation and Roar Ventures
    // named and no lead disclosed. Pebblebed lists the company on its own
    // portfolio page and says it leads and makes ~20 investments per fund; its
    // Fund II Form D is $125M and Fund III $200M, so the lead's initial check
    // is single-digit millions and the seed is small.
    //
    // The only price-shaped number anywhere is the FT standfirst of 21 Jan
    // 2026 — "six-month-old US start-up ... as it targets $1bn-plus valuation"
    // — and that is an asking price, not a close. WIRED reported the raise as
    // open on 29 Jan 2026 and Morning Brew still had it open in Mar 2026.
    // Nothing has been announced since and no Form D has appeared. A target the
    // market has not met in seven months is not a valuation, so the qualifier
    // stays.
    //
    // With no priced round to invert, the nominal is a stage comparison. $150M
    // is the floor: that is Grafton Sciences, and where Grafton has fifteen
    // people and nothing published, this has 31 profiles on LinkedIn across SF
    // and Belgrade, two shipped systems (Kona 1.0 and the Aleph prover), Yann
    // LeCun as founding chair of its technical research board and Fields
    // Medalist Michael Freedman as chief science officer, FT/WIRED/TIME
    // coverage, and a named customer relationship in Nebius's Q1 2026
    // shareholder letter. $300M is the ceiling — Deep Cogito's mark, and it
    // has a competitively priced Series A and $53.4M raised where this has one
    // undisclosed seed. The file's 3.2-5.8x raised band cannot be applied at
    // all, because the capital base is unknown; if the seed proves to be
    // single-digit millions this figure is generous.
    valuation: { usdM: 200, qualifier: "undisclosed" },
    year: 2025,
    domain: "science",
    tags: ["agents", "math"],
    founders: [
      { person: "eve-bodnia", prior: ["ucsb"] },
    ],
    knownFor:
      "Energy-based reasoning models and formal-verification agents that enforce constraints and produce machine-checkable answers for critical systems.",
    location: CITIES.sf,
  },
  {
    slug: "latent-labs",
    name: "Latent Labs",
    // Never priced in public. PitchBook's Post-Val column is empty on both
    // rounds; Caplight and Hiive each carry a page with the valuation field
    // blank (Caplight's "$60M total raised" is also wrong). Dealroom models
    // enterprise value at $200-300M — a tracker bracketing capital raised, so
    // it corroborates rather than sets the figure, and its seed row wrongly
    // names Sequoia. PremierAlts' "$139.9M" is a secondary desk's own
    // arithmetic on a page that says "market implied" and "0 funding rounds on
    // record", and is not used; Forge's "Latent, $600M, $94M raised" is a
    // different company, as is the Latent that raised $80M from Spark in Mar
    // 2026 for medication-approval software.
    //
    // The rounds are hard. Latent Labs Technologies, Inc. (CIK 1989109) has
    // two Form Ds, both signed by Kohl as CEO. The first (17 Aug 2023): a
    // $10,000,002 offering, $9,114,910 sold, first sale 25 Jul 2023, 24
    // investors — the seed Sifted later attributed to Kindred, 8VC and Pillar.
    // The second (2 Jan 2025): $40,499,931 offered, $39,874,911 sold, first
    // sale 16 Dec 2024, 13 investors, no placement agent — the $40M Series A
    // announced 12 Feb 2025, co-led by Radical Ventures and Sofinnova Partners
    // with Flying Fish, Isomer and all three seed funds re-upping. So $50M is
    // the total and $40M is the round the nominal has to price. Companies
    // House adds nothing: Latent Labs Limited (14964224) is wholly owned by
    // the Delaware topco per its confirmation statements, and its three SH01s
    // state only aggregate nominal capital (£879.5 across 87,950 ordinary
    // £0.01 shares), never a premium.
    //
    // Two new outside co-leads at 4x the seed, every insider following, and
    // the AlphaFold Nobel two months old at first sale — but the offering
    // merely filled rather than oversubscribed, and the Form D adds no
    // director to Kohl, Tony Kulesa (Pillar) and John Cassidy (Kindred) from
    // the seed. Strong but not contested, so the nominal prices the $40M at
    // ~16% dilution: tighter than EvolutionaryScale's 17%, well short of the
    // ~13% Deep Cogito's competitive A commands. On $49.0M sold that is 5.1x,
    // between EvolutionaryScale's 4.2x and Orbital's 5.6x, and mid-band on
    // Dealroom's independent $200-300M. $160M is the floor (25%, the textbook
    // life-sciences Series A — Sofinnova co-leading is the argument for it,
    // and 3.3x raised sits beside Moonvalley and Xaira at the bottom of the
    // band, which is where a ~20-person lab with nothing shipped at the Dec
    // 2024 close belongs; Latent-X came seven months later). $400M is the
    // ceiling (10%) — the same arithmetic Deep Cogito's identically sized $40M
    // A gets, and 8x raised, off the top of the band.
    valuation: { usdM: 250, qualifier: "undisclosed" },
    // Incorporated in London 27 Jun 2023 (Companies House 14964224) and in
    // Delaware the same year per both Form Ds; TechCrunch has the company
    // incorporated "in London in mid-2023". 2025 is the stealth exit, not the
    // founding — the file dates by founding (D3).
    year: 2023,
    domain: "science",
    tags: ["agents", "drug-discovery"],
    founders: [{ person: "simon-kohl", prior: ["deepmind", "dkfz", "kit"] }],
    knownFor:
      "Generative protein, peptide and antibody design models and autonomous drug-design agents, paired with an in-house wet lab for experimental validation.",
    location: CITIES.london,
  },
  {
    slug: "autoscience",
    name: "Autoscience",
    // $14M seed announced 18 Mar 2026 — General Catalyst leading, with
    // Perplexity Fund, Toyota Ventures, S32 and MaC Ventures — and never
    // priced in public. Axios covered it the next day with no figure, as did
    // SiliconANGLE, R&D World, AIwire/BigDATAwire and FinSMEs; PitchBook's
    // Post-Val column is empty on the single row it carries. EDGAR full-text
    // returns zero for "Autoscience", "Autoscience Inc", "Autoscience
    // Institute" and the founder's name alike, while the identical query
    // returns Deep Cogito's Form D (8 Apr 2026) and D/A (24 Apr 2026) — so the
    // absence is real, and there is no Reg D filing to date the close or count
    // the investors. Nothing has been announced since.
    //
    // The $14 that stood here was capital raised, not worth. The nominal
    // inverts the seed at the house default of 20%: $70M. TechCrunch, 31 Mar
    // 2026, thirteen days after this round, has "$10 million at a $40 million
    // to $45 million post-money" as the typical AI seed — 22-25% — and sources
    // it partly to MaC Ventures, an investor in this very round; a five-fund
    // round with General Catalyst leading, a claimed Kaggle Santa 2025 silver
    // medal and Fortune 500 customers prices tighter than typical, which is
    // what 20% expresses. That is 5.0x the disclosed $14M, just under Orbital
    // and Deep Cogito at 5.6x; on PitchBook's $24.5M raised-to-date it is
    // 2.9x, below Moonvalley at the bottom of the band, so it survives either
    // reading of what has gone in. $56M is the floor (25%, the soft end of
    // TechCrunch's band — thirteen people with a shipped product and paying
    // enterprise customers do not price below market with GC leading) and
    // $93M the ceiling (15%, a pre-empted seed).
    //
    // Rejected: PitchBook's $24.5M, which is capital and contradicts the
    // company's own $14M; StartupHub.ai's "$98.0M effective valuation (range
    // $61.3M to $147.0M, 22% confidence), based on comparable companies", an
    // avowedly modelled number carried across two contradictory profiles of
    // the same company; and Dealroom's "Autoscience", which is
    // autoscience.info — a B2C dating and advertising company with "no known
    // external funding" — not this lab. Crunchbase's "uses science and tech to
    // improve vehicle automation, safety, and performance" is bleed from Auto
    // Science of Hatboro, PA (autoscience.com); its financial fields are all
    // paywall placeholders and its 1-10 headcount band is stale against
    // LinkedIn's 13. No Caplight, Forge, Hiive or UpMarket mark exists — too
    // early, as with Deep Cogito.
    valuation: { usdM: 70, qualifier: "undisclosed" },
    // LinkedIn dates the company to 2024, mirrored by RocketReach and Built
    // In, and autoscience.ai was already resolving in Wayback on 28 May 2024;
    // the Carl announcement and the first site content came Mar 2025. Only
    // PitchBook says 2025, and that is the launch.
    year: 2024,
    domain: "rsi",
    tags: ["agents"],
    founders: [{ person: "eliot-cowan", prior: ["google", "mit"] }],
    knownFor:
      "Autonomous AI scientists that read literature, propose and run experiments, and turn verified discoveries into improved production machine-learning models.",
    location: CITIES.sanMateo,
  },
  {
    slug: "lawzero",
    name: "LawZero",
    // Nonprofit: equity valuation is not applicable. About $30M was reportedly
    // raised at launch and is used only as a neutral bubble-size proxy.
    valuation: { usdM: 30, qualifier: "undisclosed" },
    year: 2025,
    domain: "safety",
    structure: "nonprofit",
    founders: [
      {
        person: "yoshua-bengio",
        prior: [
          "mila",
          "umontreal",
          "cifar",
          "ivado",
          "mcgill",
          "mit",
          "belllabs",
          "elementai",
        ],
      },
    ],
    knownFor:
      "Yoshua Bengio’s nonprofit developing safe-by-design advanced AI, centered on a transparent, non-agentic Scientist AI without goals of its own.",
    location: CITIES.montreal,
  },
  {
    slug: "oumi",
    name: "Oumi",
    // Never priced. The only round is the $10M seed announced 29 Jan 2025 with
    // the launch — Venrock and Obvious Ventures co-leading per Oumi's own
    // release (Ascend's post credits Venrock alone), Plug & Play and Ascend
    // joining, Venrock's Ganesh Srinivasan quoted in it. Nothing since: Oumi's
    // newsroom and blog run unbroken to Jul 2026 with no funding item, Tracxn
    // still shows one round on a 27 Jun 2026 refresh, Dealroom carries "no
    // known external funding" so there is not even a tracker EV band to argue
    // with, and EDGAR full-text returns zero for "Oumi Inc", "Oumi AI" and
    // "Oumi PBC" while the identical query returns Deep Cogito's Form D and
    // D/A — the absence is real, not a broken search. StartupHub.ai's profile
    // ($63M raised, a Series A, an $810.9M "effective valuation" at 32%
    // confidence, San Francisco, founded 2022, 39 staff) contradicts every
    // checkable field here and is not used — the same failure mode as the
    // unsupported Essential AI Series B.
    //
    // So the nominal inverts the seed at the house default of 20%: $50M. This
    // one reads mid-band rather than pre-empted — two funds splitting a $10M
    // lead is a syndicate, not a fight, and a public-benefit charter plus 16
    // Founding Scholars enlarges the non-investor cap table rather than
    // shrinking the investor slice, so the multi-cofounder block argues the
    // team wanted a high price, not that it got one. The multiple-of-raised
    // test is degenerate on a one-round company (5.0x is just 1/0.20
    // restated), but it lands between Essential AI's 3.8x and Orbital's 5.6x.
    // $40M is the floor (25% — pre-revenue until the commercial platform
    // shipped 31 Mar 2026, fourteen months later) and $67M the ceiling (15% —
    // a seed priced above that is a pre-empt, and a pre-empted team does not
    // then go eighteen months without a follow-on). This is the January 2025
    // price carried forward unrefreshed; 9.4K GitHub stars, ~20 staff and
    // ~1.2K PyPI installs a month are traction, not a new round.
    valuation: { usdM: 50, qualifier: "undisclosed" },
    // The oumi-ai GitHub org was created 18 Apr 2024 and the oumi repo 7 May
    // 2024; the company came out of stealth with the seed on 29 Jan 2025. Same
    // shape as Deep Cogito, which is dated to incorporation rather than launch.
    year: 2024,
    domain: "applied",
    tags: ["multimodal", "open-source", "open-weights", "training-infra-tools"],
    structure: "public-benefit",
    founders: [
      {
        person: "manos-koukoumidis",
        prior: ["google", "microsoft", "meta", "princeton", "mit"],
      },
      { person: "matthew-persons", prior: ["google", "microsoft", "cornell"] },
      {
        person: "jeremiah-greer",
        prior: ["google", "microsoft", "cincinnati"],
      },
      { person: "william-zeng", prior: ["google", "stanford"] },
      {
        person: "kostas-aisopos",
        prior: ["google", "microsoft", "princeton", "mit"],
      },
      {
        person: "oussama-elachqar",
        prior: ["apple", "twitter", "microsoft", "georgiatech"],
      },
      {
        person: "panos-achlioptas",
        prior: ["stanford", "steelperlot", "snap", "meta"],
      },
    ],
    knownFor:
      "Public-benefit lab and open platform for evaluating, fine-tuning and deploying specialized foundation models that organizations can own.",
    location: CITIES.bellevue,
  },
  {
    slug: "futurehouse",
    name: "FutureHouse",
    // Nonprofit: equity valuation is not applicable. $20M reflects FY2023
    // contributions and is used only as a neutral funding proxy.
    valuation: { usdM: 20, qualifier: "undisclosed" },
    year: 2023,
    domain: "science",
    tags: ["agents", "open-weights"],
    structure: "nonprofit",
    founders: [
      {
        person: "sam-rodriques",
        prior: ["franciscrick", "mit"],
      },
      {
        person: "andrew-white",
        prior: ["rochester", "uchicago", "washington", "maxplanck"],
      },
    ],
    knownFor:
      "Nonprofit building and wet-lab-validating AI scientists for basic research in biology and health; its commercial platform spun out as Edison Scientific in 2025.",
    location: CITIES.sf,
  },
  {
    slug: "cursive",
    name: "Cursive",
    // Never priced. SuperSeed is the only investor any source names: PitchBook
    // carries a single investor and states total VC raised as undisclosed,
    // Dealroom dates a SuperSeed seed to Feb 2026 with the amount masked and
    // offers no enterprise-value band, and TechFundingNews (28 Apr 2026) also
    // has "Total VC raised: Undisclosed". EDGAR full-text returns no Form D for
    // "Cursive AI" or "Cursive Labs", and the seven hits on "Cursive" alone are
    // two California hedge funds, an Ohio company and a Maryland one; the
    // identical query returns Deep Cogito's D and D/A, so the absence is real
    // rather than a broken search.
    //
    // Companies House is unusually informative here, and it is why the $100M
    // placeholder that stood in this slot cannot. The filing entity is Cursive
    // AI Ltd (16099785), incorporated 25 Nov 2024 as Persona Labs Ltd and
    // renamed 16 Apr 2026. Four allotments are on file, not the one previously
    // recorded: incorporation, 11 Mar 2025, 10 Jul 2025 and 26 Mar 2026. The
    // last does state a premium, which an SH01 usually does not, implying about
    // GBP 85,000 for the company. That is not a figure to record: the allotment
    // is voting ordinary in a founder-sized block, so it prices founder stock
    // and not the enterprise. Funding Spotter's "Cursive Ai Ltd Secures GBP 21k
    // in Early-Stage Funding" (25 Apr 2026) is that same subscription
    // auto-generated into a round, and is rejected.
    //
    // What the register does establish is that no priced institutional round
    // had closed by Mar 2026. The Nov 2025 confirmation statement shows a cap
    // table of founder vehicles plus a small non-voting A class, with SuperSeed
    // absent from it, so its money sits on a convertible, which carries a cap
    // and not a price. The UK Sovereign AI Fund allocation of Apr 2026 is up to
    // 1M GPU hours of AIRR compute rather than equity —
    // only Callosum took an equity cheque in that batch — so it is set aside,
    // though the fund holds a right of first refusal on future rounds.
    //
    // So there is no round to invert and the nominal is a stage comparison.
    // This file's seed cluster sits at $60-80M and every member has a
    // disclosed, priced round of $13.5-16.25M behind it; Oumi at $50M has a
    // disclosed $10M seed, and Poetiq at $46M is the nearest structural twin,
    // senior ex-DeepMind researchers in this same domain. Cursive has less than
    // any of them: no disclosed amount, no priced round sixteen months after
    // incorporation, and nothing shipped where they have. The house
    // default of 20% on a SuperSeed-sized seed of GBP 3-4M gives GBP 15-20M
    // post, roughly $20-27M, and $25M sits in that band. That round size is
    // inferred from the investor's stage, not reported, and is the weakest link
    // here. $15M is the floor — a GBP 1.5-2M pre-seed at a GBP 10-12M cap,
    // below which a team holding an AIRR allocation does not price — and $50M
    // the ceiling, Oumi's mark, which rests on a disclosed and priced seed
    // where this has neither.
    valuation: { usdM: 25, qualifier: "undisclosed" },
    // Incorporated 25 Nov 2024 as Persona Labs Ltd; the three-founder company
    // dates to Mar 2025, when its second and third directors were appointed.
    // Dealroom's launch date and TechFundingNews both say 2025, and founding
    // year is what this field carries — cf. PrismML and Fundamental.
    year: 2025,
    domain: "rsi",
    founders: [
      {
        person: "talfan-evans",
        prior: ["deepmind", "imperial", "ucl", "oxford"],
      },
      { person: "olivier-henaff", prior: ["deepmind", "nyu", "polytechnique"] },
      { person: "oliver-vikbladh", prior: ["nyu", "ucl"] },
    ],
    knownFor:
      "London frontier lab building foundation models and low-latency generative infrastructure for adaptive software and agents that improve continuously from use.",
    location: CITIES.london,
  },
  {
    slug: "transluce",
    name: "Transluce",
    // Nonprofit: equity valuation is not applicable. $7M approximates its 2024
    // contributions and grants and is used only as a neutral funding proxy.
    valuation: { usdM: 7, qualifier: "undisclosed" },
    year: 2024,
    domain: "safety",
    tags: ["open-source", "open-weights"],
    structure: "nonprofit",
    founders: [
      {
        person: "jacob-steinhardt",
        prior: ["berkeley", "openai", "openphilanthropy", "stanford", "mit"],
      },
      {
        person: "sarah-schwettmann",
        prior: ["mit", "ibm", "baylor", "uthealth", "rice"],
      },
    ],
    knownFor:
      "Nonprofit building open infrastructure for scalable oversight of frontier AI through automated interpretability, model-behavior analysis and evaluations.",
    location: CITIES.sf,
  },
  {
    slug: "cartesia",
    name: "Cartesia",
    // A floor, not a figure. No round has a disclosed post-money, but
    // certificate-of-incorporation filings price the Mar 2025 Series A at
    // $18.67/share for ~$404M post (up from ~$296M at the Dec 2024 seed). The
    // $100M Series B that followed in Oct 2025 is undisclosed and would almost
    // certainly have priced above the A, so ">$400M" is what the record
    // supports. Replace with the Series B post if it is ever reported.
    valuation: { usdM: 400, qualifier: "gt" },
    year: 2023,
    domain: "media",
    tags: ["academic-spinout", "agents", "voice"],
    founders: [
      { person: "karan-goel", prior: ["stanford"] },
      { person: "albert-gu", prior: ["stanford"] },
      { person: "arjun-desai", prior: ["apple", "stanford"] },
      { person: "brandon-yang", prior: ["snorkelai", "stanford", "google"] },
      { person: "chris-re", prior: ["stanford", "washington"] },
    ],
    knownFor:
      "Real-time voice built on state space models rather than transformers, out of the Stanford lab that invented them; the Sonic text-to-speech, Ink speech-to-text and Line agent stack, tuned for sub-100ms latency.",
    location: CITIES.sf,
  },
  {
    slug: "fundamental",
    name: "Fundamental",
    // $225M Series A led by Oak HC/FT on top of an earlier $30M seed, out of
    // stealth 5 Feb 2026. Post-money is reported as $1.4B by TechCrunch and
    // Axios Pro but $1.2B by Calcalist, so the qualifier is approximate rather
    // than exact — the round is confirmed, the figure is not settled.
    valuation: { usdM: 1_400, qualifier: "approx" },
    year: 2024,
    domain: "applied",
    tags: ["tabular"],
    founders: [
      {
        person: "jeremy-fraenkel",
        prior: ["bridgewater", "jpmorgan", "startup"],
      },
      { person: "marta-garnelo", prior: ["deepmind", "imperial"] },
      {
        person: "gabriel-suissa",
        prior: ["greenfieldpartners", "jpmorgan"],
      },
    ],
    knownFor:
      "NEXUS, a deterministic large tabular model pretrained on billions of enterprise spreadsheets and database tables, aimed at fraud detection, pricing and forecasting rather than free-text generation.",
    location: CITIES.sf,
  },
  {
    slug: "prior-labs",
    name: "Prior Labs",
    // Price never disclosed — SAP says so outright in both the 4 May
    // announcement and the 17 Jul completion notice — and the >€1B attached to
    // the deal is a four-year commitment to invest *into* the lab, not
    // consideration paid for it. Forbes' ">$1.14B" is that same commitment in
    // dollars and Forbes states it correctly as such; the conflation belongs
    // to Tech.eu ("acquired ... for over €1 billion"), not to them.
    //
    // The nominal is inferred instead from what reporting does support on
    // price: Forbes, and separately Pathfounders, describe substantial upfront
    // cash consideration, which set against the investor stake left after a
    // single €9M pre-seed — the company's first and only round — puts total
    // consideration near $700-800M. Reported rather than disclosed, and a
    // floor at that, so the qualifier stays
    // `undisclosed`; with `structure: 'subsidiary'` this renders as "Not
    // independently valued" and the figure only sets a bubble radius.
    valuation: { usdM: 750, qualifier: "undisclosed" },
    year: 2024,
    domain: "applied",
    tags: ["academic-spinout", "open-source", "open-weights", "tabular"],
    founders: [
      { person: "frank-hutter", prior: ["freiburg", "ubc", "bosch"] },
      { person: "noah-hollmann" },
      { person: "sauraj-gambhir" },
    ],
    knownFor:
      "Creator of TabPFN, a tabular foundation model that predicts on structured data by in-context learning over synthetic priors instead of per-dataset gradient training; spun out of the AutoML lab at Freiburg.",
    location: CITIES.freiburg,
    structure: "subsidiary",
    // Announced 4 May 2026, closed 17 Jul 2026. SAP runs it on as an
    // independent unit under its own name, hence absorbed: false.
    exit: { type: "acquired", absorbed: false, to: "SAP", year: 2026 },
  },
  {
    slug: "aleph-alpha",
    name: "Aleph Alpha",
    // Implied by the merger terms, not disclosed. Reuters reports the price as
    // undisclosed, and no standalone post-money was ever published — the Nov
    // 2023 round was headlined at $500M but trade press put only ~€110M of it
    // in cash equity, the rest compute and research credits. The figure below
    // is Aleph Alpha's implied share of the ~$20B the merged company is valued
    // at, per Handelsblatt. It rests on unnamed insiders via a single outlet,
    // hence rumored; the other outlets carrying it all trace back to the same
    // Handelsblatt reporting.
    valuation: { usdM: 2_000, qualifier: "approx", rumored: true },
    year: 2019,
    domain: "applied",
    tags: ["multimodal", "sovereign"],
    founders: [
      { person: "jonas-andrulis", prior: ["apple"] },
      { person: "samuel-weinbach" },
    ],
    knownFor:
      "Built the Luminous models as Europe's answer to OpenAI, then stepped back from frontier scale for PhariaAI, a sovereign platform sold into government, defence and regulated industry.",
    location: CITIES.heidelberg,
    // Announced 24 Apr 2026. Close is not cleanly documented: PitchBook
    // carries a 19 May 2026 deal date, but reporting that same day still
    // described the merger as in process, and no primary statement from
    // either company or a named regulator confirms completion. Recorded as
    // absorbed on the balance of that evidence rather than on a settled fact.
    exit: { type: "acquired", absorbed: true, to: "cohere", year: 2026 },
  },
  {
    slug: "edison-scientific",
    name: "Edison Scientific",
    // $70M seed announced 18 Dec 2025, co-led by Spark Capital and Triatomic
    // with an unnamed US biotech investor, joined by Pillar, Susa, Hawktail
    // and Olive. Post-money is cited as $244.55M by Forge and ~$250M by
    // Caplight, so the figure is approximate.
    valuation: { usdM: 250, qualifier: "approx" },
    year: 2025,
    domain: "science",
    tags: ["agents", "drug-discovery"],
    founders: [
      { person: "sam-rodriques", prior: ["futurehouse", "franciscrick", "mit"] },
      {
        person: "andrew-white",
        prior: ["futurehouse", "rochester", "uchicago", "washington", "maxplanck"],
      },
    ],
    knownFor:
      "FutureHouse's for-profit spinout, commercialising Kosmos — an agent that runs multi-day research campaigns across literature and proprietary data to propose therapeutic targets.",
    location: CITIES.sf,
  },
  {
    slug: "deepgram",
    name: "Deepgram",
    // $130M Series C at $1.3B post-money led by AVP, announced 13 Jan 2026,
    // with Twilio, ServiceNow Ventures, SAP and Citi Ventures joining existing
    // backers. Still private: no S-1, no listing, no acquisition on record.
    valuation: { usdM: 1_300, qualifier: "exact" },
    year: 2015,
    domain: "media",
    tags: ["agents", "voice"],
    founders: [
      { person: "scott-stephenson", prior: ["michigan", "ucdavis"] },
      { person: "adam-sypniewski", prior: ["michigan"] },
      { person: "noah-shutty" },
    ],
    knownFor:
      "Founded by Michigan particle physicists who repurposed dark-matter waveform analysis for speech; the Nova speech-to-text models and a voice-agent stack sold as enterprise API infrastructure.",
    location: CITIES.sf,
  },
  {
    slug: "orbital",
    // "Orbital" is what the company calls itself — its LinkedIn page and the
    // careers page both use it bare. The site is orbitalindustries.com
    // and the Series B release says "Orbital Industries", so the longer form is
    // a live alternate rather than a former name, and stays out of priorNames.
    name: "Orbital",
    priorNames: ["Orbital Materials"],
    // Undisclosed. TNW and Resilience Media both state no post-money was
    // released with the $50M Series B (Plural, 28 May 2026), and no figure
    // exists for the seed, Series A or the Oct 2024 NVentures round either.
    // The nominal is editorial, as it is for every `undisclosed` here: $71M of
    // capital raised is what the company has taken in, not what it is worth. A
    // $50M B at a hot-but-ordinary ~12.5% dilution implies ~$400M post, which
    // is ~5.6x raised — between Xaira's 3.4x and Isomorphic's 5.8x. Dealroom
    // models EV at $200-300M, consistent with the 20-25% dilution end; it is a
    // tracker's model, so it corroborates rather than sets the figure. $500M
    // (10% dilution) is the ceiling: a lab priced higher does not raise $50M.
    valuation: { usdM: 400, qualifier: "undisclosed" },
    // Founded and launched Sep 2022 as Orbital Materials; renamed 28 May 2026
    // alongside the Series B. Broad press coverage only began with the Feb
    // 2024 Series A.
    year: 2022,
    domain: "science",
    tags: ["agents", "materials", "open-source", "open-weights"],
    founders: [
      { person: "jonathan-godwin", prior: ["deepmind", "bloomsburyai"] },
      {
        person: "james-gin-pollock",
        prior: ["datasine", "plutodata", "imprintai"],
      },
      { person: "daniel-miodovnik" },
    ],
    knownFor:
      "Orb, an Apache-licensed universal interatomic potential fast enough to simulate 100,000 atoms on one GPU, and CurieOS, the agent OS built on top of it; renamed from Orbital Materials as it began selling what those models designed — a PFAS-free two-phase refrigerant for 2,000W+ GPUs, pitched as the first AI-designed molecule to reach commercial market.",
    // London HQ with a San Francisco office; 6 of 7 open roles are London. An
    // earlier advanced-materials R&D site in Princeton, NJ is not the seat.
    location: CITIES.london,
  },
  {
    slug: "generalist-ai",
    name: "Generalist AI",
    // $400M announced 4 Jun 2026, led by Radical Ventures, with 8VC, Union
    // Square, Hanabi and Norwest joining Nvidia's NVentures, Bezos Expeditions,
    // Boldstart, Spark and NFDG. The company's own post confirms the round and
    // a total "more than half a billion" but states no price; the $2B
    // post-money is Bloomberg's, carried unchanged by every outlet since, so
    // it's recorded as reported rather than rumored.
    valuation: { usdM: 2_000, qualifier: "exact" },
    // Incorporated March 2024 — Boldstart dates its first cheque to 24 Mar
    // 2024 — and out of stealth with a research preview in June 2025.
    year: 2024,
    domain: "physical",
    tags: ["robot-foundation-models"],
    founders: [
      { person: "pete-florence", prior: ["deepmind", "mit"] },
      { person: "andy-zeng", prior: ["deepmind", "princeton"] },
      { person: "andrew-barry", prior: ["broad", "bostondynamics", "mit"] },
    ],
    knownFor:
      "GEN-0 and GEN-1, embodied foundation models pretrained from scratch on hundreds of thousands of hours of raw physical interaction collected with handheld grippers rather than in simulation; the DeepMind robotics researchers behind PaLM-E and RT-2, selling cross-embodiment robot intelligence rather than robots.",
    // Two offices, the Bay Area and Boston. San Mateo is the headquarters of
    // record in Bloomberg, PitchBook and the company's own LinkedIn; the
    // careers page labels that same office "SFO".
    location: CITIES.sanMateo,
  },
  {
    slug: "irregular",
    name: "Irregular",
    priorNames: ["Pattern Labs"],
    // $80M across two back-to-back rounds announced together on 17 Sep 2025 —
    // ~$30M from Sequoia, then ~$50M weeks later with Sequoia, Redpoint, Swish
    // and angels (Wiz's Assaf Rappaport, Eon's Ofir Ehrlich). The company never
    // priced it publicly and Calcalist reports the valuation as undisclosed;
    // $450M post is TechCrunch's, from a source close to the deal, and Forbes
    // carries the same figure in a headline. Two independent outlets on one
    // point value is why this is `exact` rather than `rumored`. Secondary-market
    // data still implied $450M in July 2026 and no newer round is on record.
    valuation: { usdM: 450, qualifier: "exact" },
    year: 2023,
    domain: "applied",
    tags: ["security"],
    founders: [
      // Unit 81 and Unit 8200 are different IDF units — one founder from each.
      { person: "dan-lahav", prior: ["ibm", "unit81"] },
      { person: "omer-nevo", prior: ["google", "unit8200"] },
    ],
    knownFor:
      "Frontier AI security lab that stress-tests models for offensive cyber capability inside simulated networks; its evaluations ship inside OpenAI and Anthropic system cards, alongside the SOLVE vulnerability-scoring framework.",
    location: CITIES.telAviv,
  },
  {
    slug: "deep-cogito",
    name: "Deep Cogito",
    // Never priced in public: PitchBook's Post-Val column is empty across all
    // three rounds, Tracxn masks its own, and the company is far too early for
    // a secondary mark on Caplight or Forge. Dealroom's "$52-78M enterprise
    // value" brackets capital raised rather than worth, and is not used.
    //
    // What is hard is the round. Deep Cogito's Form D (8 Apr 2026) and D/A (23
    // Apr 2026) report a $39,999,956 Series A Preferred offering, first sale 24
    // Mar 2026, sold in full by the amendment across eight investors with no
    // placement agent — and a fourth board seat for Schuster Tanger of TQ
    // Ventures, a new outside lead seven months after Benchmark's $13M seed.
    // That is a competitive round, so the nominal prices the $40M at ~13%
    // dilution rather than the textbook 16-20%. On $53.4M raised to date that
    // is 5.6x, level with Orbital and just under Isomorphic at the top of the
    // band here. $200M is the floor (20% dilution) and $400M the ceiling (10%
    // — a lab priced above that does not raise only $40M).
    valuation: { usdM: 300, qualifier: "undisclosed" },
    // Incorporated 2024 per the Form D; out of stealth 8 Apr 2025 with Cogito v1.
    year: 2024,
    domain: "general",
    tags: ["open-weights"],
    founders: [
      { person: "drishan-arora", prior: ["google"] },
      { person: "dhruv-malrana", prior: ["deepmind", "google", "microsoft"] },
    ],
    knownFor:
      "Open-weight hybrid reasoning models trained by iterated distillation and amplification; the model's own search traces are folded back into its weights.",
    location: CITIES.sf,
  },
  {
    slug: "grafton-sciences",
    name: "Grafton Sciences",
    // Renamed from Grafton Biosciences; Grafton Biosciences, Inc. is still the
    // legal entity on the ARPA-H award and the SAM.gov registration.
    priorNames: ["Grafton Biosciences"],
    // The thinnest evidence base of any figure here. No equity round has ever
    // been reported: EDGAR full-text search returns zero hits for "Grafton
    // Sciences", "Grafton Biosciences" and "Sognef" alike — and the identical
    // query returns Deep Cogito's Form D and D/A, so the absence is real
    // rather than a broken search. Crunchbase renders every financial field as
    // an empty placeholder, no secondary mark exists on Caplight, Forge or
    // Hiive, and no investor has ever been named.
    //
    // The only disclosed capital is government and non-dilutive: an ARPA-H
    // POSEIDON award of 30 Sep 2025 that the company states as $42.5M and
    // ARPA-H's own directory as "up to $37.5M". These are Other Transactions
    // Agreements contingent on milestones, so both figures are ceilings. The
    // "$40 million in funding" on the old graftonbio.com is that same money
    // loosely stated, not a round — the Wayback capture carrying it is 4 Oct
    // 2025, four days after the award, and the Mar 2025 capture of that page
    // claims no funding at all.
    //
    // Private capital almost certainly exists but has never been disclosed.
    // ARPA-H records two corporate performers committing up to $21M of
    // resource sharing across the programme and marks Grafton as one of them;
    // a ~15-person company funds cost-share off its own balance sheet, not out
    // of the award. Its own phrasing reads the same way: "backed by leading
    // partners, *including* ARPA-H", "*other* leading partners".
    //
    // So the dilution method behind every other undisclosed figure here cannot
    // run — there is no priced round to invert. The nominal is a stage
    // comparison instead. ~3.5x the $42.5M capital base sits at the bottom of
    // this file's band (Moonvalley 3.2x, Xaira 3.4x, up to Isomorphic 5.8x),
    // which is where non-dilutive milestone-contingent money and zero
    // published work belong. $100M is the floor: fifteen people across three
    // sites with lab and manufacturing space are not worth less. $300M is the
    // ceiling — that is Deep Cogito's mark, and it has a competitively priced
    // Series A and three shipped model families where Grafton has neither.
    valuation: { usdM: 150, qualifier: "undisclosed" },
    year: 2024,
    domain: "physical",
    founders: [{ person: "anubhav-dubey", prior: ["startup"] }],
    knownFor:
      "Robot-run factories and laboratories, and the models to drive them, so an AI can run its own physical experiments; funded so far by a $42.5M ARPA-H award for at-home cancer screening.",
    // Three sites: Redwood City (1100 Island Dr, the HQ of record on LinkedIn
    // and Crunchbase), San Francisco (600 California St), and the Peachtree
    // Corners, GA bench that ARPA-H lists against the award.
    location: CITIES.redwoodCity,
  },
  {
    slug: "physical-superintelligence",
    name: "Physical Superintelligence",
    // Thinner even than Grafton, which at least had a non-dilutive award to
    // scale from. No round has ever been disclosed: PitchBook carries one row,
    // Early Stage VC of 01-May-2026, with amount, raised-to-date and post-money
    // all empty, and no tracker carries a figure at all. EDGAR full-text
    // returns zero for "Physical Superintelligence", "Physical
    // Superintelligence PBC", "Physical Superintelligence Inc" and "psi.inc"
    // across every form type, not just D, and the company-name index lists no
    // Form D filer under the name; the identical query returns Deep Cogito's D
    // and D/A, so the absence is real rather than a broken search. The only
    // account of the cap table is the company's own launch post of 15 Feb 2026,
    // naming SV Angel, Valkyrie, Solari Capital, 021T Capital, Thiel Macro and
    // Balaji Srinivasan alongside angels from OpenAI, SoftBank, NVIDIA, Hugging
    // Face, Google DeepMind and World — investors without amounts,
    // single-sourced to the company.
    //
    // Rejected, all of them name collisions: Tracxn's "PSI", a health-insurance
    // provider; Crunchbase's "Superintelligence"; and the Dealroom, Caplight and
    // UpMarket marks returned under the name, which belong to Physical
    // Intelligence, the unrelated robotics lab already in this file.
    //
    // So neither method runs: there is no round to invert and no capital base to
    // multiply, and multiple-of-raised is not merely degenerate but undefined.
    // The nominal is a stage comparison. This file's seed cluster sits at
    // $60-80M — Math, Inc. $60M, Unreasonable Labs $68M, Autoscience $70M,
    // PrismML $80M — and every one of those has a disclosed $13.5-16.25M round
    // behind it. A syndicate of comparable quality and one shipped artifact in
    // GPD argue for the cluster; a raise undocumented anywhere argues against
    // sitting inside it, so this takes the cluster floor, level with Math, Inc.
    // on a similar profile. $40M is the floor — TechCrunch's 31 Mar 2026 typical
    // AI seed is $10M at $40-45M post, and a round SV Angel and Thiel Macro join
    // does not price below the ordinary seed. $100M is the ceiling: above it
    // sits Grafton at $150M, and a lab priced there has a documented
    // institutional round where this has a stage label. That stage label is
    // itself the assumption — PitchBook's "Early Stage VC" spans seed and
    // Series A, and nothing narrows it.
    valuation: { usdM: 60, qualifier: "undisclosed" },
    // Incorporated 2025; out of stealth 15 Feb 2026.
    year: 2025,
    // Not robotics, despite the name: there is no embodiment anywhere in the
    // stack. The nearest neighbour here is Periodic Labs, not Physical
    // Intelligence.
    domain: "science",
    tags: ["agents", "open-source"],
    structure: "public-benefit",
    founders: [
      {
        person: "matthew-pines",
        prior: ["bitcoinpolicy", "sentinelone", "startup"],
      },
      { person: "alex-wissner-gross", prior: ["harvard", "startup"] },
    ],
    knownFor:
      "Get Physics Done, an open-source agentic AI physicist that scopes a problem, plans the research, runs its own derivations and numerical checks and verifies the results against physical constraints; a public benefit corporation industrialising physics discovery rather than building robots.",
    // Boston: 14 of 15 open roles are posted there, and the launch post has the
    // team expanding in Boston and San Francisco. PitchBook's Sunny Isles Beach,
    // FL is a registered address rather than an operating seat.
    location: CITIES.boston,
  },
  {
    slug: "math-inc",
    name: "Math, Inc.",
    // Never priced in public. Crunchbase records two seed rounds and three
    // investors with Chapter One leading; VCBacked puts the total at $15.0M
    // with the most recent announced March 2026, and the company confirmed
    // that round itself on LinkedIn (9 Mar 2026), naming Robot Ventures and
    // Tarun Chitra. No post-money appears in any tracker, and EDGAR full-text
    // returns no Form D for "Math, Inc.", "Math Inc", "Mathematical
    // Instrumentality Project", "math.inc" or either founder's name — the
    // identical query returns Deep Cogito's D and D/A, so the absence is real
    // rather than a broken search.
    //
    // The two rounds were never split out, so there is no single round to
    // invert and the nominal prices the seed programme whole: $15M at ~25%
    // cumulative dilution across two seeds — wider than the 20% a single seed
    // takes here, because two rounds compound — puts it near $60M. That is
    // 4.0x raised, between Essential AI's 3.8x and Oumi's 5.0x, which is where
    // a lab that has raised half again what Oumi did on a far stronger
    // technical record belongs. $50M is the floor (30% cumulative, the soft
    // end for two seeds) and $100M the ceiling at 6.7x raised, past the top of
    // the band — a lab priced above that does not raise $15M in total. DARPA's
    // expMath support is a non-dilutive research grant and is excluded.
    //
    // The Information's Feb 2026 "quintuples an AI math startup's valuation"
    // is Axiom, not this lab — Techmeme ran it alongside Wired's AxiomProver
    // story and the two are direct rivals. PitchBook's "Math (Information
    // Services)", a $5.75M seed of 16 Sep 2024 with Betaworks, predates this
    // company's launch by a year and is a different entity. Neither is used.
    valuation: { usdM: 60, qualifier: "undisclosed" },
    // The company was announced publicly on 11 Sep 2025, alongside the Gauss
    // Prime Number Theorem result. An earlier autoformalization of a classical
    // ABC-conjecture result shipped in June 2025, so the year holds either way.
    year: 2025,
    domain: "science",
    tags: ["agents", "math", "open-source"],
    founders: [
      { person: "jesse-michael-han", prior: ["openai", "pitt"] },
      {
        person: "christian-szegedy",
        prior: ["xai", "google", "cadence", "bonn"],
      },
    ],
    knownFor:
      "Gauss, an autoformalization agent that turns published mathematics into machine-checked Lean; it closed Terence Tao and Alex Kontorovich's 18-month Prime Number Theorem challenge in three weeks, then formalised Viazovska's Fields Medal sphere-packing proofs.",
    // Palo Alto is the HQ of record on Crunchbase and pr.ai; the San Francisco
    // references in circulation are personal locations, not the company's.
    location: CITIES.paloAlto,
  },
  {
    slug: "unreasonable-labs",
    name: "Unreasonable Labs",
    // Never priced in public. The $13.5M announced 10 Mar 2026 on emergence
    // from stealth — Playground Global leading, AIX Ventures, E14 Fund and
    // MS&AD Ventures joining — carries no valuation, and neither do
    // BusinessWire, HPCwire, Ventureburn, The AI Insider, Pulse 2.0 or
    // Cambridge Today. PitchBook's Post-Val column is empty on the single row
    // it carries; Crunchbase, Preqin, CB Insights and Tracxn all show the round
    // with no figure; there is no Dealroom enterprise-value band and no
    // secondary-market mark under the name. Crunchbase's other "Unreasonable
    // Labs" is a programme of Unreasonable Alchemy LLC, the Boulder impact
    // accelerator, and is a different company entirely.
    //
    // The round is harder-edged than the announcement. Knoxus.AI Ltd (CIK
    // 2090126), the filing entity, incorporated in California in 2025, has a
    // Form D of 7 Oct 2025 and a D/A of 3 Feb 2026: $12,500,000 offered,
    // $12,499,996 sold, $4 left, first sale 22 Sep 2025, three accredited
    // investors, and Playground's Sasha Ostojic named a director. So the price
    // was set in September 2025 and the March 2026 announcement is publicity,
    // not a close; the ~$1M between the filing and the announced total sits
    // outside this offering. A full-text search on the trading name returns
    // nothing — the filing is under the legal entity — while the identical
    // query returns Deep Cogito's Form D and D/A, so the absence is real.
    //
    // The nominal inverts the announced round at the house default of 20%:
    // $68M. A $1.2B deep-tech fund led and took a board seat, which argues
    // tighter — but the offering merely filled rather than upsizing, on a
    // three-investor syndicate, with nothing shipped and the company six months
    // from leaving stealth, where Autoscience prices at 20% on a larger round
    // with a shipped product and paying customers. The multiple-of-raised test
    // is degenerate on a one-round company (5.0x is 1/0.20 restated). $54M is
    // the floor (25%, the soft end of TechCrunch's 31 Mar 2026 band — a round
    // Playground leads and boards does not price at the market's bottom) and
    // $90M the ceiling (15%, a pre-empted seed, which eleven months without a
    // follow-on does not support). This is the September 2025 price carried
    // forward unrefreshed.
    valuation: { usdM: 68, qualifier: "undisclosed" },
    year: 2026,
    domain: "science",
    tags: ["materials"],
    founders: [
      {
        person: "yuan-cao",
        prior: ["deepmind", "google", "baidu", "kittai", "jhu"],
      },
      { person: "markus-buehler", prior: ["mit", "caltech", "maxplanck"] },
    ],
    knownFor:
      "Unreasonable.DISCOVERY, a cross-domain discovery engine that pairs LLMs with neurosymbolic abstractions over a unified world model of physics, biology, chemistry and materials — built to compose new hypotheses rather than retrieve known facts.",
    location: CITIES.paloAlto,
  },
  {
    slug: "prismml",
    name: "PrismML",
    // No post-money has ever been published, and there may be none to publish:
    // the March 2026 raise is described as SAFE and seed money, and a SAFE
    // carries a cap rather than a price. The round is reported at $16.25M
    // (HPCwire 3 Apr 2026; PitchBook $16.2M, Signalbase and Aventure $16.3M) but
    // the company's own release states no figure at all, naming only Khosla
    // Ventures as lead and Cerberus Ventures alongside it, with Google and
    // Caltech contributing compute grants rather than equity — compute is not
    // capital, so it is set aside here. Rejected: Dealroom's $65-98M
    // "enterprise value", which models money raised rather than worth;
    // Caplight, whose own round table leaves the valuation column empty; CB
    // Insights, which masks the figure as "$XXM". EDGAR has no Form D under any
    // name variant, and the control returns Deep Cogito's two filings, so the
    // null is real; the company-name index lists 78 Form D filers beginning
    // "Prism" without this one among them. The nominal below is therefore
    // derived: $16.25M at the 20% seed default gives ~$81M. The 15% ceiling
    // ($108M) is unearned — one lead, one other fund, and nothing shipped on the
    // day the round was announced, which is not a contested round. The 25% floor
    // ($65M) reads too soft for a raise Khosla Ventures led with an exclusive
    // Caltech patent licence attached. Multiple-of-raised is degenerate against
    // a single round: 4.9x is 1/0.205 restated, though it does sit inside the
    // file's 3-6x band.
    valuation: { usdM: 80, qualifier: "undisclosed" },
    // Founded June 2025, out of stealth 31 March 2026. Founding year is what
    // this field carries elsewhere — cf. Fundamental and Prior Labs.
    year: 2025,
    domain: "general",
    tags: [
      "academic-spinout",
      "multimodal",
      "on-device",
      "open-source",
      "open-weights",
    ],
    founders: [
      {
        person: "babak-hassibi",
        prior: ["neuralpropulsion", "caltech", "belllabs", "stanford"],
      },
      { person: "sahin-lale", prior: ["neuralpropulsion", "caltech"] },
      {
        person: "omead-pooladzandi",
        prior: ["neuralpropulsion", "caltech", "ucla"],
      },
      { person: "reza-sadri", prior: ["caltech", "instacart", "ucla"] },
    ],
    knownFor:
      "Caltech spinout built on a compression theory that pushes model weights down to 1 bit and ternary; the Apache-2.0 Bonsai family and its custom llama.cpp and MLX kernels fit a 27B-class model into 3.9GB, small enough to run on a phone.",
    location: CITIES.pasadena,
  },
  {
    slug: "universalagi",
    name: "UniversalAGI",
    // Never priced. PitchBook records one Early Stage VC deal dated 1 Jul 2025
    // with Amount, Raised to Date and Post-Val all empty; Premier Alternatives
    // renders valuation and total funding alike as N/A; no investor has been
    // named by anyone; and a Harmonic-sourced list still marked the company as
    // raising in May 2026, so that round is the only one closed.
    //
    // Rejected: Airframe's "Raised $10M" is an auto-generated profile with no
    // traceable source, and capital raised is not worth in any case. Dealroom's
    // Jul 2025 entry tags the round "Buyout", the company "Acquired", and names
    // Affinity Partners as the investor — Affinity led the Series A of Brain
    // Co., a different company, so that record reads as cross-contamination and
    // no exit is derived from it. Crunchbase's "Universal AGI" is a third
    // entity again, on universalagi.ai. The "$500 million valuation" Forbes
    // reported in Nov 2025 belongs to AGI, Inc., and was an open ask rather
    // than a close.
    //
    // EDGAR has nothing: zero hits for "UniversalAGI", "Universal AGI",
    // "UniversalAGI, Inc." and "UniversalAGI Inc" both across all forms and
    // filtered to Form D, and the company-name index matches nothing. The
    // control query returns Deep Cogito's D and D/A, so the absence is real
    // rather than a broken search.
    //
    // With no round size there is nothing to invert and no denominator for the
    // multiple check, so the nominal is a stage comparison. $150M is Grafton
    // Sciences' mark and is where this lands: Grafton has fifteen people and
    // nothing published against a disclosed $42.5M base, this has ~20 people, a
    // shipped model, a public API and a technical report against no disclosed
    // capital at all, and the two roughly offset. $75M is the floor — about a
    // $15M seed at 20%, and a team this size with a live product does not price
    // below an ordinary seed post. $300M is the ceiling: Deep Cogito's mark,
    // earned on a competitively priced $40M Series A with a Form D behind it
    // and $53.4M raised, where this has one undisclosed seed and no filing.
    // The round was priced eleven months before anything shipped; if a size
    // ever surfaces, rebuild this by inversion rather than adjusting it.
    valuation: { usdM: 150, qualifier: "undisclosed" },
    year: 2025,
    // Pivoted. NEA's table and Dealroom still describe a forward-deployed lab
    // building autonomous agents for enterprises and government; that was the
    // universalagi.ai business, which the company no longer does. Everything
    // published since roughly Aug 2025 is physics foundation models replacing
    // CFD, so `agents` should not be restored from those sources.
    domain: "physical",
    founders: [
      { person: "ameer-haj-ali", prior: ["brainco", "anyscale", "berkeley"] },
    ],
    knownFor:
      "Large physics models in place of the CAE loop: SUV-PT predicts surface pressure, wall shear stress and drag straight from 3D geometry in seconds where high-fidelity CFD takes days, on an in-house Latent Interaction Field Transformer trained on millions of generated simulations.",
    location: CITIES.sf,
  },
  {
    slug: "neocognition",
    name: "NeoCognition",
    // One round: a $40M seed announced 21 Apr 2026 on emergence from stealth,
    // oversubscribed, co-led by Cambium Capital and Walden Catalyst Ventures
    // with Vista Equity Partners participating. No pre- or post-money has ever
    // been published — TechCrunch, The Next Web, TechFundingNews and the wire
    // release all carry the round size and stop there. The company calls it
    // "committed" seed capital, wording unchanged on a 26 May 2026 recrawl, so
    // the round may be signed rather than fully called; PitchBook alone marks
    // it completed, and files it as a Series A against everyone else's seed.
    // Rejected: Dealroom's $160-240M is its modelled "enterprise value" band,
    // on a profile it labels "Made with AI"; PitchBook, Crunchbase, Tracxn and
    // Caplight are blank or gated and TrueUp states "not available"; and
    // startuphub.ai's $957M is comps output over a mismatched entity record it
    // also dates to 2023 in Columbus, Ohio running an AI consultancy. EDGAR has
    // nothing, under the name or four entity variants, full-text or company
    // index — the control query "Deep Cogito" returns its two known filings,
    // so the null is the search working rather than failing. The nominal is
    // therefore inverted from the round at the 20% seed default: 40/0.20 =
    // $200M. An oversubscribed book, two competing co-leads and a growth-stage
    // crossover in at seed argue against the 25% soft case; nothing shipped, a
    // placeholder research page and ~15 people argue against the 15%
    // pre-emption case, which no outlet reported anyway. $160M is the floor — 25%, and a book
    // that closes oversubscribed with two leads is not selling a quarter of
    // itself — and $270M the ceiling, 15%, where a seed priced that tightly is
    // normally reported as pre-empted by someone. The multiple-of-raised check
    // is degenerate on a single round, 5.0x being 1/0.20 restated, so it
    // corroborates nothing; Dealroom's band bracketing $200M is the same
    // tautology, since those bands model capital raised.
    valuation: { usdM: 200, qualifier: "undisclosed" },
    // Founded mid-2025 and out of stealth 21 Apr 2026. The company's own
    // LinkedIn record gives 2025; Dealroom's "2026" is its launch date.
    year: 2025,
    domain: "rsi",
    tags: ["continual-learning", "agents", "academic-spinout"],
    founders: [
      { person: "yu-su", prior: ["ohiostate", "microsoft", "ucsb"] },
      { person: "xiang-deng", prior: ["scaleai", "google", "ohiostate"] },
      { person: "yu-gu", prior: ["ohiostate"] },
    ],
    knownFor:
      "Ohio State's AI agent group commercialized: the team behind Mind2Web, MMMU and SeeAct, now building agents that learn a “world model of work” on the job and specialize into domain experts rather than one general super-agent.",
    location: CITIES.paloAlto,
  },
];

/** Sorted big → small, which is how every view wants them. */
export const LABS_BY_VALUATION = [...LABS].sort(
  (a, b) => b.valuation.usdM - a.valuation.usdM,
);

export const LAB_BY_SLUG = new Map(LABS.map((l) => [l.slug, l]));

export const TOTAL_VALUATION_USDM = LABS.reduce(
  (sum, l) => sum + l.valuation.usdM,
  0,
);
