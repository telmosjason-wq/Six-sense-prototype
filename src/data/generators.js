import {
  INDUSTRIES, SIZES, REVENUES, TECHS, STAGES, INTENTS, ABM_TIERS,
  FIRST_NAMES, LAST_NAMES, TITLES, ARCHETYPES, DOMAINS, SUFFIXES,
  KEYWORDS, LOCATIONS, CONTENT_ITEMS
} from './constants';

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
export function randN(a, n) { return [...a].sort(() => Math.random() - 0.5).slice(0, n); }
export function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
export function randDate(d = 365) { const x = new Date(); x.setDate(x.getDate() - randInt(0, d)); return x.toISOString().split("T")[0]; }
export function randBool(p = 0.5) { return Math.random() < p; }
function randTime() { return `${String(randInt(6, 22)).padStart(2, "0")}:${rand(["00","15","30","45"])}`; }

// ─── Global collections filled during generation ─────────────────────────────
let _signalEvents = [];
let _allActivities = [];

export function getSignalEvents() { return _signalEvents; }
export function getAllActivities() { return _allActivities; }

// ─── Account Generation ──────────────────────────────────────────────────────
export function generateAccounts(n = 100) {
  const accounts = [];
  for (let i = 0; i < n; i++) {
    const domain = rand(DOMAINS) + (i > 19 ? i : "") + rand(SUFFIXES);
    const name = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
    const abmTier = rand(ABM_TIERS);
    const techStack = randN(TECHS, randInt(3, 8));
    const keywordActivity = randN(KEYWORDS, randInt(1, 5)).map(k => ({
      keyword: k, trend: rand(["Rising","Stable","Declining"]),
      firstSeen: randDate(180), volume: randInt(1, 100)
    }));

    accounts.push({
      id: `ACC-${String(i + 1).padStart(4, "0")}`,
      name, domain,
      industry: rand(INDUSTRIES),
      size: rand(SIZES),
      revenue: rand(REVENUES),
      location: rand(LOCATIONS),
      stage: rand(STAGES),
      intentScore: randInt(0, 100),
      intentLevel: rand(INTENTS),
      abmTier,
      abmStrategy: abmTier === "1:1" ? "Dedicated AE + custom content + exec sponsorship"
        : abmTier === "1:Few" ? "Cluster campaigns + personalized outreach"
        : "Programmatic ads + scaled nurture",
      abmBudget: abmTier === "1:1" ? "$" + randInt(15, 50) + "K/qtr"
        : abmTier === "1:Few" ? "$" + randInt(3, 12) + "K/qtr"
        : "$" + randInt(200, 900) + "/qtr",
      techStack,
      keywordActivity,
      signals: [],
      audiences: [],
      engagement: [],
      signalFields: {},
      sixsenseScore: randInt(10, 99),
      lastActivity: randDate(30),
      contactCount: 8,
      buyingGroupCoverage: randInt(20, 100)
    });
  }
  return accounts;
}

// ─── Contact + Signal + Activity Generation ──────────────────────────────────
export function generateContacts(accounts) {
  const contacts = [];
  const accountMap = {};
  accounts.forEach(a => { accountMap[a.id] = a; });
  _signalEvents = [];
  _allActivities = [];
  let eventId = 1;
  let actId = 1;

  // Push activity to global feed
  function pushAct(type, date, detail, entityType, entityId, entityName, extra = {}) {
    const act = {
      id: `ACT-${String(actId++).padStart(5, "0")}`,
      type, date, time: randTime(), detail,
      entityType, entityId, entityName, ...extra
    };
    _allActivities.push(act);
    return act;
  }

  accounts.forEach(acc => {
    // ── Account-level activities ──
    if (randBool(0.4)) {
      const d = randDate(30);
      acc.engagement.push({ type: "Ad Impression", date: d, detail: "Display ad served", campaign: "Enterprise ABM Q1" });
      pushAct("Ad Impression", d, "Display ad — Enterprise ABM Q1", "account", acc.id, acc.name, { campaign: "Enterprise ABM Q1" });
    }
    if (randBool(0.25)) {
      const d = randDate(30);
      acc.engagement.push({ type: "Ad Click", date: d, detail: "Clicked through to landing page", campaign: "Enterprise ABM Q1" });
      pushAct("Ad Click", d, "Clicked through to landing page — Enterprise ABM Q1", "account", acc.id, acc.name);
    }
    if (randBool(0.3)) {
      const d = randDate(14);
      acc.engagement.push({ type: "AI Email Open", date: d, detail: "Opened personalized email", campaign: "Outbound Sequence A" });
      pushAct("AI Email Open", d, "Opened personalized email — Outbound Seq A", "account", acc.id, acc.name);
    }
    if (randBool(0.15)) {
      const d = randDate(14);
      acc.engagement.push({ type: "AI Email Reply", date: d, detail: "Replied with interest", campaign: "Outbound Sequence A" });
      pushAct("AI Email Reply", d, "Replied with interest — Outbound Seq A", "account", acc.id, acc.name);
    }
    if (randBool(0.2)) {
      const d = randDate(7);
      acc.engagement.push({ type: "Web Visit", date: d, detail: "Visited pricing page (3 pages, 4m 22s)" });
      pushAct("Web Visit", d, "Visited pricing page (3 pages, 4m 22s)", "account", acc.id, acc.name);
    }
    if (randBool(0.15)) pushAct("Sync to MAP", randDate(20), 'Synced to Marketo list: "High Intent Enterprise"', "account", acc.id, acc.name, { system: "Marketo" });
    if (randBool(0.1)) pushAct("Sync to CRM", randDate(10), 'Synced to Salesforce campaign: "Q1 ABM"', "account", acc.id, acc.name, { system: "Salesforce" });
    if (randBool(0.12)) pushAct("Workflow Triggered", randDate(5), 'Entered workflow: "High-Intent → AI Email → Sales Alert"', "account", acc.id, acc.name);

    // ── Audiences ──
    if (randBool(0.3)) acc.audiences.push({ name: "High-Intent Enterprise", type: "Dynamic", joinedDate: randDate(60), status: "Active" });
    if (randBool(0.2)) acc.audiences.push({ name: "Q1 ABM Target List", type: "Static", joinedDate: randDate(120), status: "Active" });
    if (randBool(0.15)) acc.audiences.push({ name: "AI Adopters", type: "Iterative", joinedDate: randDate(45), status: "Active" });

    // ── Generate 8 contacts per account ──
    const usedArchetypes = [...ARCHETYPES];
    for (let j = 0; j < 8; j++) {
      const isBuyingGroup = j < 5;
      const archetype = isBuyingGroup ? usedArchetypes[j] : null;
      const isHidden = randBool(0.35);
      const firstName = rand(FIRST_NAMES);
      const lastName = rand(LAST_NAMES);
      const fullName = `${firstName} ${lastName}`;
      const title = rand(TITLES);

      const formerCompanies = randBool(0.4)
        ? randN(accounts.filter(a => a.id !== acc.id), randInt(1, 2)).map(a => ({
            name: a.name, id: a.id, title: rand(TITLES),
            from: randDate(730), to: randDate(365)
          }))
        : [];

      const signals = [];
      const signalFields = {};

      // ── Job Change linked signal chain (~5% of contacts with former companies) ──
      if (formerCompanies.length > 0 && randBool(0.05)) {
        const fc = formerCompanies[0];
        const detectedDate = randDate(90);
        const evtId = `EVT-${String(eventId++).padStart(4, "0")}`;
        const confidence = randInt(75, 99);

        // 1. Direct signal on PERSON
        signals.push({
          id: evtId, signalConfig: "Job Change", type: "Job Change",
          subtype: "Direct", nature: "Event", measure: "Qualitative",
          detail: `${fullName} changed jobs: ${fc.title} at ${fc.name} → ${title} at ${acc.name}`,
          detectedDate, status: "Active", confidence, linkedEventId: evtId
        });
        signalFields.job_change = true;
        signalFields.job_change_date = detectedDate;
        signalFields.job_change_from = fc.name;

        // 2. Derived signal on TO account (new hire)
        acc.signals.push({
          id: evtId + "-to", signalConfig: "Job Change", type: "Job Change",
          subtype: "Derived", nature: "Event", measure: "Qualitative",
          detail: `New ${title} hired — ${fullName} joined from ${fc.name}`,
          detectedDate, status: "Active", confidence, linkedEventId: evtId,
          derivedFrom: "person", personName: fullName, direction: "Incoming"
        });
        acc.signalFields.recent_hire = true;
        acc.signalFields.recent_hire_title = title;

        // 3. Derived signal on FROM account (departure)
        const fromAccount = accountMap[fc.id];
        if (fromAccount) {
          fromAccount.signals.push({
            id: evtId + "-from", signalConfig: "Job Change", type: "Job Change",
            subtype: "Derived", nature: "Event", measure: "Qualitative",
            detail: `${fc.title} departed — ${fullName} left to join ${acc.name}`,
            detectedDate, status: "Active", confidence, linkedEventId: evtId,
            derivedFrom: "person", personName: fullName, direction: "Departure"
          });
          fromAccount.signalFields.recent_departure = true;
          fromAccount.signalFields.recent_departure_title = fc.title;
        }

        // Global event ledger
        _signalEvents.push({
          id: evtId, signalConfig: "Job Change", type: "Job Change", date: detectedDate,
          personId: null, personName: fullName, personTitle: title, directOn: "person",
          toAccountId: acc.id, toAccountName: acc.name,
          fromAccountId: fc.id, fromAccountName: fc.name, fromTitle: fc.title,
          confidence, status: "Active"
        });
        pushAct("Signal Fired", detectedDate, `Job Change: ${fullName} moved from ${fc.name} to ${acc.name}`, "contact", null, fullName, { signalType: "Job Change" });
      }

      // ── Contact engagement + content consumption ──
      const engagement = [];
      const contentConsumed = [];

      if (randBool(0.35)) {
        const d = randDate(14); const ct = rand(CONTENT_ITEMS);
        engagement.push({ type: "Email Open", date: d, detail: `Opened: ${ct.title}` });
        pushAct("AI Email Open", d, `Opened: ${ct.title}`, "contact", null, fullName);
      }
      if (randBool(0.25)) {
        const d = randDate(30); const ct = rand(CONTENT_ITEMS);
        engagement.push({ type: "Content Download", date: d, detail: `Downloaded: ${ct.title}`, contentType: ct.type, contentId: ct.id });
        contentConsumed.push({ contentId: ct.id, type: "download", date: d });
        pushAct("Content Download", d, `Downloaded: ${ct.title}`, "contact", null, fullName, { contentId: ct.id });
      }
      if (randBool(0.15)) {
        const d = randDate(60); const ct = CONTENT_ITEMS[4]; // webinar
        engagement.push({ type: "Webinar Attended", date: d, detail: `Attended: ${ct.title}` });
        contentConsumed.push({ contentId: ct.id, type: "attended", date: d });
        pushAct("Webinar Attended", d, `Attended: ${ct.title}`, "contact", null, fullName, { contentId: ct.id });
      }
      if (randBool(0.1)) {
        const d = randDate(14);
        engagement.push({ type: "Demo Requested", date: d, detail: "Requested product demo" });
        pushAct("Demo Requested", d, "Requested product demo", "contact", null, fullName);
      }
      if (randBool(0.25)) {
        const d = randDate(7);
        engagement.push({ type: "Web Visit", date: d, detail: "Visited: Pricing page, Product tour" });
        pushAct("Web Visit", d, "Visited pricing page + product tour", "contact", null, fullName);
      }
      if (randBool(0.12)) {
        pushAct("SEP Enrollment", randDate(5), "Enrolled in Outreach sequence: Enterprise Inbound", "contact", null, fullName, { system: "Outreach" });
      }
      if (randBool(0.08)) {
        pushAct("Agent Interaction", randDate(3), "RevvyAI qualified as high-intent, recommended multi-thread", "contact", null, fullName, { agent: "RevvyAI" });
      }

      const buyingGroupActivity = isBuyingGroup && archetype === "Champion" && formerCompanies.length > 0
        ? [{ note: `Was a champion for similar product at ${formerCompanies[0].name}`, date: formerCompanies[0].to }]
        : [];

      const contactId = `CON-${String(contacts.length + 1).padStart(5, "0")}`;
      contacts.push({
        id: contactId, accountId: acc.id, accountName: acc.name,
        firstName, lastName, name: fullName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${acc.domain}`,
        title,
        phone: `+1 (${randInt(200, 999)}) ${randInt(100, 999)}-${randInt(1000, 9999)}`,
        linkedin: `linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}${randInt(1, 99)}`,
        isBuyingGroup, archetype, isHidden,
        formerCompanies, signals, signalFields,
        engagement, contentConsumed, buyingGroupActivity,
        audiences: acc.audiences.filter(() => randBool(0.5)),
        lastActive: randDate(30),
        score: randInt(0, 100)
      });

      // Backfill personId on event
      if (signals.length > 0 && _signalEvents.length > 0) {
        const lastEvt = _signalEvents[_signalEvents.length - 1];
        if (lastEvt.personName === fullName) lastEvt.personId = contactId;
      }
      // Backfill entityId on activities
      _allActivities.forEach(a => {
        if (a.entityId === null && a.entityName === fullName) a.entityId = contactId;
      });
    }
  });

  // ── Funding Event signals (account-level, Direct, 3%) ──
  accounts.forEach(acc => {
    if (randBool(0.03)) {
      const evtId = `EVT-${String(eventId++).padStart(4, "0")}`;
      const detectedDate = randDate(60);
      const detail = "Recently acquired by " + rand(DOMAINS).toUpperCase() + " for $" + randInt(50, 500) + "M";
      acc.signals.push({
        id: evtId, signalConfig: "Funding Event", type: "Funding Event",
        subtype: "Direct", nature: "Event", measure: "Quantitative",
        detail, detectedDate, status: "Active", confidence: randInt(80, 99), linkedEventId: evtId
      });
      acc.signalFields.funding_event = true;
      acc.signalFields.funding_event_date = detectedDate;
      _signalEvents.push({
        id: evtId, signalConfig: "Funding Event", type: "Funding Event", date: detectedDate,
        directOn: "account", toAccountId: acc.id, toAccountName: acc.name, detail, status: "Active"
      });
      pushAct("Signal Fired", detectedDate, `Funding Event: ${detail}`, "account", acc.id, acc.name, { signalType: "Funding Event" });
    }
  });

  // ── Hiring Trend signals (account-level, Derived, 8%) ──
  accounts.forEach(acc => {
    if (randBool(0.08)) {
      const evtId = `EVT-${String(eventId++).padStart(4, "0")}`;
      const detectedDate = randDate(30);
      const openRoles = randInt(3, 15);
      const status = randBool(0.8) ? "Active" : "Resolved";
      acc.signals.push({
        id: evtId, signalConfig: "Hiring Trend", type: "Hiring Trend",
        subtype: "Derived", nature: "Trend", measure: "Quantitative",
        detail: `Actively hiring for AI Engineers (${openRoles} open roles)`,
        detectedDate, status, confidence: randInt(60, 95), linkedEventId: evtId,
        trendData: Array.from({ length: 6 }, (_, j) => ({ month: `M-${5 - j}`, value: randInt(1, 20) }))
      });
      acc.signalFields.hiring_ai = true;
      acc.signalFields.hiring_ai_count = openRoles;
      _signalEvents.push({
        id: evtId, signalConfig: "Hiring Trend", type: "Hiring Trend", date: detectedDate,
        directOn: "account", toAccountId: acc.id, toAccountName: acc.name,
        detail: `${openRoles} open AI Engineer roles`, status
      });
      pushAct("Signal Fired", detectedDate, `Hiring Trend: ${openRoles} AI Engineer roles`, "account", acc.id, acc.name, { signalType: "Hiring Trend" });
    }
  });

  // ── Build content engagement metrics ──
  CONTENT_ITEMS.forEach(ct => {
    ct.views = randInt(50, 500);
    ct.engagements = contacts.filter(c => c.contentConsumed.some(cc => cc.contentId === ct.id));
    ct.accountsEngaged = [...new Set(ct.engagements.map(c => c.accountId))];
    ct.firstTouch = randInt(5, 30);
    ct.lastTouch = randInt(3, 20);
    ct.multiTouch = parseFloat((randInt(15, 45) / 10).toFixed(1));
  });

  // Sort activities by date desc
  _allActivities.sort((a, b) => b.date.localeCompare(a.date));

  return contacts;
}
