// Demo Script — each step has actions[] that execute sequentially before narration shows

export const HERO = {
  accountId: "ACC-0001",
  accountName: "Vertexai",
  contactName: "Kim Chen",
  formerCompany: "LiveRamp",
  signalName: "Job Change (VP Marketing Ops)",
  audienceName: "Job Change Alerts",
};

// Actions:
//   navigate:section     — switch to a nav section
//   close-all            — close all modals/drawers
//   open-account         — open hero account detail
//   open-account-tab:X   — switch to tab X in account detail
//   open-contact         — open hero contact detail
//   open-contact-tab:X   — switch to tab X in contact detail
//   close-modals         — close all modals but stay on section
//   open-signal-detail   — open the job change signal detail view
//   open-audience        — open hero audience member view
//   open-drawer          — open data marketplace drawer
//   close-drawer         — close data marketplace drawer

export const DEMO_STEPS = [
  // ═══ ACT 1: Account Intelligence View ═══
  {
    act: 1, actTitle: "The Single Pane of Glass",
    title: "Welcome to Account Intelligence",
    narration: "This is the Account Intelligence View — where all your data comes together. 6sense's native intelligence sits alongside data from Salesforce, Gong, and Gainsight. One view, every signal, no tab-switching.",
    actions: ["close-all", "navigate:accounts"],
  },
  {
    act: 1, actTitle: "The Single Pane of Glass",
    title: "Native 6sense Columns",
    narration: "The first four columns — Technographics, Intent Keywords, Buying Stage, Competitive Risk — are powered by 6sense's intelligence layer. Always present, no setup required. Notice the teal header border indicating 6sense as the source.",
    actions: [],
  },
  {
    act: 1, actTitle: "The Single Pane of Glass",
    title: "Integration Data Alongside",
    narration: "CRM Owner from Salesforce (blue), Competitor Mentioned from Gong (green), Health Score from Gainsight (purple). Each column header shows the source with a colored indicator so you always know where data comes from.",
    actions: [],
  },
  {
    act: 1, actTitle: "The Single Pane of Glass",
    title: "Key Takeaway",
    narration: "6sense brings all your data together in one place — and enriches your systems with intelligence and signals out of the box. No more cross-referencing 6 different tools.",
    actions: [],
    highlight: "takeaway",
  },

  // ═══ ACT 2: Adding Data ═══
  {
    act: 2, actTitle: "Bring Your Own Data",
    title: "The Data Marketplace",
    narration: "Click '+ Add Data Column' to bring in data from anywhere. The marketplace has five tabs: Favorites, Discover (third-party providers like Bombora and G2), Integrations (your connected tools), Signals (from Signal Builder), and RevvyAI (AI-generated columns).",
    actions: ["open-drawer"],
  },
  {
    act: 2, actTitle: "Bring Your Own Data",
    title: "Third-Party Data Providers",
    narration: "The Discover tab shows available third-party data sources — Bombora Intent, G2 Buyer Intent, UserGems Job Changes, CommonRoom Signals. Select one and click 'Add Column' to pull it into your table.",
    actions: [],
  },
  {
    act: 2, actTitle: "Bring Your Own Data",
    title: "AI-Powered Columns with RevvyAI",
    narration: "Switch to the RevvyAI tab. Write a natural language prompt, reference any existing column with {{Column Name}}, choose an output format, and generate a value for every account. The live preview shows results before you commit.",
    actions: [],
  },
  {
    act: 2, actTitle: "Bring Your Own Data",
    title: "Key Takeaway",
    narration: "You can bring in data from your CRM, data warehouse, third-party providers, or AI — making 6sense the complete picture of signals for every account that matters.",
    actions: ["close-drawer"],
    highlight: "takeaway",
  },

  // ═══ ACT 3: Account Deep Dive ═══
  {
    act: 3, actTitle: "Account Deep Dive",
    title: `Exploring ${HERO.accountName}`,
    narration: `Let's look at ${HERO.accountName}'s full record. This is where all intelligence converges — firmographics, ABM tier, scoring across products, keyword research, signal-derived fields, and AI recommendations.`,
    actions: ["open-account"],
  },
  {
    act: 3, actTitle: "Account Deep Dive",
    title: "Scoring & Signals",
    narration: `${HERO.accountName} is a 1:1 account in the Decision stage with High intent. Notice the signal fields panel — job_change, recent_hire — these were set automatically when signals fired. The Scoring section shows per-product Intent, ICP Fit, and Qualification scores.`,
    actions: [],
  },
  {
    act: 3, actTitle: "Account Deep Dive",
    title: "The Buying Group",
    narration: "The Contacts tab shows buying group members mapped to archetypes — Champion, Influencer, Detractor, Economic Buyer, User. Locked contacts are people 6sense has identified but haven't been unlocked yet. Completing the buying group dramatically improves win rates.",
    actions: ["open-account-tab:contacts"],
  },
  {
    act: 3, actTitle: "Account Deep Dive",
    title: `Meet ${HERO.contactName}`,
    narration: `${HERO.contactName} is the identified Champion. She recently joined as CPO — let's click into her profile to see the signal that surfaced her and understand the full story.`,
    actions: ["open-contact"],
  },

  // ═══ ACT 4: Contact Intelligence ═══
  {
    act: 4, actTitle: "Contact Intelligence",
    title: `${HERO.contactName}'s Profile`,
    narration: `${HERO.contactName} is CPO at ${HERO.accountName}. Her Role History shows she was previously CPO at ${HERO.formerCompany} — that's a clickable link to LiveRamp's account record. Content consumed, audience memberships, and signal fields are all visible here.`,
    actions: [],
  },
  {
    act: 4, actTitle: "Contact Intelligence",
    title: "Cross-Account Champion History",
    narration: `The Buying Group tab reveals ${HERO.contactName} was a champion at ${HERO.formerCompany} too — she's a serial champion. This multi-hop intelligence is what the graph surfaces. The job_change signal that detected her move is exactly the kind of signal we'll look at next.`,
    actions: ["open-contact-tab:buying group"],
  },
  {
    act: 4, actTitle: "Contact Intelligence",
    title: "Bridging to Signals",
    narration: "Every data point on this contact — the job change, the signal fields, the audience memberships — was created by a signal firing. Let's go see how signals work.",
    actions: ["close-modals", "navigate:signals"],
  },

  // ═══ ACT 5: Signals ═══
  {
    act: 5, actTitle: "Signals Engine",
    title: "Signal Configuration",
    narration: "Three configured signals: Job Change (Direct, Event), Funding Event (Derived, Event), and Hiring Trend (Derived, Trend). Each has a taxonomy — Direct vs Derived, Event vs Trend, Qualitative vs Quantitative. Signals detect behavior and cascade across records.",
    actions: [],
  },
  {
    act: 5, actTitle: "Signals Engine",
    title: "The Job Change Signal Chain",
    narration: `Click into Job Change. One event creates three signals: Direct on ${HERO.contactName} (person changed jobs), Derived 'Departure' on ${HERO.formerCompany} (lost their CPO), Derived 'Incoming' on ${HERO.accountName} (gained a new CPO). Each card is clickable.`,
    actions: ["open-signal-detail"],
  },
  {
    act: 5, actTitle: "Signals Engine",
    title: "Signal → Audience → Workflow",
    narration: "Scroll down to see the chain visualization. This signal feeds the 'Job Change Alerts' and 'Recent Executive Moves' audiences, which trigger the 'New Champion → Buying Group Enrichment' workflow. Detection → Segmentation → Action, all automated.",
    actions: [],
  },
  {
    act: 5, actTitle: "Signals Engine",
    title: "Key Takeaway",
    narration: "Signals are the connective tissue. They detect behavior, update records, populate audiences, and trigger workflows — creating a chain from raw data to automated action.",
    actions: [],
    highlight: "takeaway",
  },

  // ═══ ACT 6: Audiences ═══
  {
    act: 6, actTitle: "Audience Segmentation",
    title: "Audience Types",
    narration: "Three types: Iterative (signal fires → added, never removed — a permanent log), Dynamic (filter criteria, accounts move in/out in real-time), and Static (manually curated). Each card shows which signals feed it and which workflows consume it.",
    actions: ["close-all", "navigate:audiences"],
  },
  {
    act: 6, actTitle: "Audience Segmentation",
    title: `${HERO.audienceName}`,
    narration: `This Iterative audience was auto-populated when Job Change signals fired. Every account with a detected job change gets added with the timestamp and signal attribution. Look at the membership log — entries show 'Joined' (green) and 'Removed' (red for Dynamic audiences).`,
    actions: ["open-audience"],
  },
  {
    act: 6, actTitle: "Audience Segmentation",
    title: "The Full Chain",
    narration: `Notice the 'Fed by' and 'Used by' labels: this audience is fed by the Job Change signal and consumed by the Champion enrichment workflow. When ${HERO.contactName} changed jobs → Signal fired → Audience populated → Workflow triggered → Buying group enriched. The complete chain.`,
    actions: [],
    highlight: "takeaway",
  },
  {
    act: 6, actTitle: "Demo Complete",
    title: "The Complete Picture",
    narration: "Data from everywhere in one view. Signals that detect buying behavior and cascade across records. Audiences that segment automatically. Workflows that take action. This is 6sense as the contextual intelligence layer — not just a tool, but the platform that connects everything.",
    actions: [],
    highlight: "finale",
  },
];

export const ACT_NAMES = {
  1: "Single Pane",
  2: "BYOD",
  3: "Account",
  4: "Contact",
  5: "Signals",
  6: "Audiences",
};
