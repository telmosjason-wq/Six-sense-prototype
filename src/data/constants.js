export const INDUSTRIES = ["SaaS","FinTech","Healthcare","Manufacturing","Retail","Cybersecurity","EdTech","MarTech","DevOps","AI/ML","HRTech","LegalTech","InsurTech","LogTech","CleanTech"];
export const SIZES = ["1-50","51-200","201-500","501-1000","1001-5000","5000+"];
export const REVENUES = ["<$1M","$1-10M","$10-50M","$50-100M","$100-500M","$500M+"];
export const TECHS = ["Salesforce","HubSpot","Marketo","Outreach","Gong","Snowflake","Databricks","AWS","Azure","GCP","Jira","Asana","Slack","Zoom","Figma","Notion","Monday.com","Zendesk","Intercom","Stripe"];
export const STAGES = ["Awareness","Consideration","Decision","Customer"];
export const INTENTS = ["High","Medium","Low","None"];
export const ABM_TIERS = ["1:1","1:Few","1:Many"];
export const FIRST_NAMES = ["Kim","Alex","Jordan","Sam","Taylor","Morgan","Casey","Riley","Drew","Avery","Blake","Cameron","Devon","Elliot","Finley","Hayden","Jamie","Kendall","Logan","Parker","Quinn","Reese","Sage","Tatum","Val","Wren","Zion","Noel","Rowan","Shay","Jesse","Remy","Harley","Emery","Dakota"];
export const LAST_NAMES = ["Chen","Patel","Johnson","Williams","Kumar","Garcia","Anderson","Thomas","Brown","Wilson","Lee","Taylor","Moore","White","Harris","Martin","Jackson","Clark","Lewis","Walker","Hall","Young","King","Wright","Lopez","Scott","Green","Adams","Baker","Nelson"];
export const TITLES = ["VP of Marketing","Director of Marketing Ops","CMO","Head of Demand Gen","Sr. Marketing Manager","VP of Sales","Director of RevOps","CRO","Head of Growth","Sr. Account Executive","VP of Product","Director of Product","CPO","Head of Engineering","CTO","VP of IT","Director of Procurement","CFO","VP of Operations","Director of Strategy"];
export const ARCHETYPES = ["Champion","Influencer","Detractor","Economic Buyer","User"];
export const DOMAINS = ["techcorp","innovate","dataflow","cloudpeak","nexgen","synthetica","luminary","vertexai","stratosphere","pulsenet","forgedata","cybervault","quantumleap","clearpath","brightwave","corestack","apexlogic","deepnode","prismtech","stellarops"];
export const SUFFIXES = [".com",".io",".ai",".co",".tech"];
export const KEYWORDS = ["AI engineering","machine learning ops","predictive analytics","intent data","ABM platform","revenue intelligence","sales engagement","data enrichment","buyer intent","demand generation","marketing attribution","customer data platform","pipeline forecasting","account scoring","signal intelligence"];
export const LOCATIONS = ["San Francisco, CA","New York, NY","Austin, TX","Seattle, WA","Boston, MA","Chicago, IL","Denver, CO","Atlanta, GA","London, UK","Toronto, CA","Berlin, DE","Singapore, SG"];

export const CONTENT_ITEMS = [
  { id: "CNT-001", title: "The Ultimate Guide to AI-Powered GTM", type: "PDF Guide", tags: ["Persona: CMO","Product: Core","Stage: Awareness","Theme: AI"], source: "Website /resources", url: "/resources/ai-gtm-guide" },
  { id: "CNT-002", title: "5 Signals Every RevOps Team Needs", type: "Blog Post", tags: ["Persona: RevOps","Product: Signals","Stage: Consideration","Theme: Signals"], source: "Blog", url: "/blog/5-signals" },
  { id: "CNT-003", title: "Building Your First Intent-Based Audience", type: "Video", tags: ["Persona: Demand Gen","Product: Audiences","Stage: Consideration","Theme: Intent"], source: "YouTube", url: "youtube.com/watch?v=abc" },
  { id: "CNT-004", title: "How to Score Accounts with Contextual Intelligence", type: "Whitepaper", tags: ["Persona: VP Marketing","Product: Intelligence","Stage: Decision","Theme: Scoring"], source: "Website /resources", url: "/resources/scoring-guide" },
  { id: "CNT-005", title: "Buyer Intent vs. Engagement: What Actually Matters", type: "Webinar", tags: ["Persona: CMO","Product: Core","Stage: Awareness","Theme: Intent"], source: "On24", url: "on24.com/webinar/intent" },
  { id: "CNT-006", title: "The Death of Traditional MQLs", type: "Blog Post", tags: ["Persona: Demand Gen","Product: Core","Stage: Awareness","Theme: GTM"], source: "Blog", url: "/blog/death-of-mqls" },
  { id: "CNT-007", title: "Revenue AI: From Signals to Pipeline", type: "Case Study", tags: ["Persona: CRO","Product: RevvyAI","Stage: Decision","Theme: AI"], source: "Website /customers", url: "/customers/revenue-ai" },
  { id: "CNT-008", title: "Account-Based Everything: A Practical Guide", type: "PDF Guide", tags: ["Persona: VP Marketing","Product: Core","Stage: Consideration","Theme: ABM"], source: "Website /resources", url: "/resources/abe-guide" },
  { id: "CNT-009", title: "Dynamic Segmentation Playbook", type: "Interactive Demo", tags: ["Persona: Marketing Ops","Product: Audiences","Stage: Decision","Theme: Segmentation"], source: "Navattic", url: "navattic.com/demo/segmentation" },
  { id: "CNT-010", title: "The GTM Intelligence Stack", type: "Podcast Episode", tags: ["Persona: CRO","Product: Core","Stage: Awareness","Theme: GTM"], source: "Spotify", url: "spotify.com/episode/gtm" },
];

export const EXT_SYSTEMS = [
  { name: "Salesforce", icon: "SF", fields: ["SF Account Owner","SF Opportunity Stage","SF Last Activity","SF Lead Source","SF ARR"] },
  { name: "HubSpot", icon: "HS", fields: ["HS Lifecycle Stage","HS Lead Score","HS Last Email","HS Form Submissions","HS Deal Amount"] },
  { name: "Snowflake", icon: "❄️", fields: ["Product Usage Score","DAU/MAU Ratio","Feature Adoption %","Last Login Date","Storage Used (GB)"] },
  { name: "Marketo", icon: "MK", fields: ["MK Program Membership","MK Engagement Score","MK Last Interesting Moment","MK Nurture Stream","MK Lead Partition"] },
];

export const SIGNAL_CONFIGS_DEFAULT = [
  { id: "SIG-001", name: "Job Change (VP Marketing Ops)", type: "Direct", nature: "Event", measure: "Qualitative", status: "Active",
    description: "Detects when a VP of Marketing Operations changes companies",
    criteria: "Title contains 'VP' AND 'Marketing Operations', employment change detected",
    targetAudiences: ["Job Change Alerts", "Recent Executive Moves"],
    targetWorkflows: ["WF-002"],
    fieldMappings: [{ field: "job_change", value: "true" }, { field: "job_change_date", value: "{{detected_date}}" }]
  },
  { id: "SIG-002", name: "Funding Event (Acquisition)", type: "Derived", nature: "Event", measure: "Quantitative", status: "Active",
    description: "Detects when an account is acquired or receives significant funding",
    criteria: "News source mentions acquisition OR funding round > $10M",
    targetAudiences: ["Recently Funded Accounts"],
    targetWorkflows: [],
    fieldMappings: [{ field: "funding_event", value: "true" }, { field: "funding_event_date", value: "{{detected_date}}" }]
  },
  { id: "SIG-003", name: "Hiring Trend (AI Engineers)", type: "Derived", nature: "Trend", measure: "Quantitative", status: "Active",
    description: "Tracks when accounts are actively hiring AI/ML engineers",
    criteria: "Job postings for AI/ML roles > 3 in trailing 30 days",
    targetAudiences: ["AI Adopters"],
    targetWorkflows: ["WF-003"],
    fieldMappings: [{ field: "hiring_ai", value: "true" }, { field: "hiring_ai_count", value: "{{open_roles}}" }]
  },
];

export const AUDIENCES_DEFAULT = [
  { id: "AUD-001", name: "High-Intent Enterprise", type: "Dynamic", criteria: "Intent Level = High", lastUpdated: "2026-03-16 09:15 AM",
    sourceSignals: [], sourceDescription: "Dynamic filter on intentLevel = High",
    usedByWorkflows: ["WF-001"] },
  { id: "AUD-002", name: "Q1 ABM Target List", type: "Static", criteria: "Manually curated", lastUpdated: "2026-01-15 02:30 PM",
    sourceSignals: [], sourceDescription: "Manually uploaded / curated list",
    usedByWorkflows: [] },
  { id: "AUD-003", name: "AI Adopters", type: "Iterative", criteria: "Hiring Trend (AI Engineers) signal triggered", lastUpdated: "2026-03-15 11:45 AM",
    sourceSignals: ["SIG-003"], sourceDescription: "Accounts added when Hiring Trend signal fires (never removed)",
    usedByWorkflows: ["WF-003"] },
  { id: "AUD-004", name: "Job Change Alerts", type: "Iterative", criteria: "Job Change signal triggered", lastUpdated: "2026-03-16 08:00 AM",
    sourceSignals: ["SIG-001"], sourceDescription: "Contacts/accounts added when Job Change signal fires",
    usedByWorkflows: ["WF-002"] },
  { id: "AUD-005", name: "Recent Executive Moves", type: "Iterative", criteria: "Job Change signal — executive titles only", lastUpdated: "2026-03-16 08:00 AM",
    sourceSignals: ["SIG-001"], sourceDescription: "Filtered to VP+ title changes",
    usedByWorkflows: [] },
  { id: "AUD-006", name: "Recently Funded Accounts", type: "Iterative", criteria: "Funding Event signal triggered", lastUpdated: "2026-03-14 12:00 PM",
    sourceSignals: ["SIG-002"], sourceDescription: "Accounts added when funding/acquisition detected",
    usedByWorkflows: [] },
];

export const WORKFLOWS_DEFAULT = [
  { id: "WF-001", name: "High-Intent → AI Email → Sales Alert", status: "Active",
    triggerType: "audience", triggerAudience: "AUD-001", triggerSignal: null,
    actions: 4, lastRun: "2026-03-16", runs: 234,
    description: "When an account enters High-Intent Enterprise, send personalized AI email and alert AE via Slack" },
  { id: "WF-002", name: "New Champion → Buying Group Enrichment", status: "Active",
    triggerType: "signal", triggerAudience: null, triggerSignal: "SIG-001",
    actions: 3, lastRun: "2026-03-15", runs: 47,
    description: "When Job Change signal fires for a champion, enrich buying group and notify account team" },
  { id: "WF-003", name: "AI Hiring → ABM Campaign", status: "Paused",
    triggerType: "signal", triggerAudience: "AUD-003", triggerSignal: "SIG-003",
    actions: 5, lastRun: "2026-03-10", runs: 89,
    description: "When Hiring Trend fires, add to AI Adopters audience, launch display campaign, sync to Marketo" },
];

export const PRODUCTS = [
  { id: "PROD-001", name: "Core Platform", color: "#22d3ee" },
  { id: "PROD-002", name: "RevvyAI", color: "#a78bfa" },
  { id: "PROD-003", name: "Conversational Email", color: "#f59e0b" },
];

export const BUYING_STAGES_DEFAULT = [
  { stage: 1, name: "No Activity", range: [0, 20], color: "#4a5568" },
  { stage: 2, name: "Awareness", range: [21, 40], color: "#60a5fa" },
  { stage: 3, name: "Consideration", range: [41, 60], color: "#a78bfa" },
  { stage: 4, name: "Decision", range: [61, 80], color: "#f59e0b" },
  { stage: 5, name: "Purchase", range: [81, 100], color: "#34d399" },
];

export const COMPETITORS = ["ProductBoard","Demandbase","Bombora","ZoomInfo","Clearbit","TechTarget","Terminus","RollWorks"];
