/* Premium Bonga AI (uncluttered)
   Fixes:
   - Remove Copy button on AI messages
   - Step 4 skills: keep Continue visible (sticky footer + scroll body)
   - Add "End walkthrough" professional closing
*/

const elMessages = document.getElementById("aiMessages");
const elActions = document.getElementById("aiActions");
const elInput = document.getElementById("aiInput");
const btnSend = document.getElementById("aiSend");
const btnMenu = document.getElementById("aiMenu");
const btnClear = document.getElementById("aiClear");
const btnSummary = document.getElementById("aiSummary");

// IMPORTANT: new key so old saved history doesn't cause weird UI
const STORAGE_KEY = "bonga_ai_history_premium_v2";

/* ------------------------
   Profile knowledge (from your spec)
------------------------ */

const PROFILE = {
  name: "Bonginkosi William Hadebe",
  summary:
`Bonginkosi William Hadebe is a Software Quality Assurance Engineer with nearly four years of experience delivering software quality across fintech, payment systems, enterprise software, web applications, mobile applications and game testing.

He currently works at African Resonance where he performs communications testing, regression testing, firmware validation, POS terminal testing, API testing and production build verification for banking payment solutions.

His technical background includes C#, Python, ASP.NET Core, SQL, JavaScript and Microsoft Azure.`,
  currentRole: "Software Tester — African Resonance (October 2025 - Present)",
  years: "Nearly four years of professional Software Quality Assurance experience.",
  languages: ["English", "IsiZulu", "Mandarin Chinese"],
  goals:
"To become a highly skilled Software Quality Assurance Engineer specializing in fintech, banking technologies, automation testing, payment systems and cloud technologies while continuously learning and contributing to innovative software solutions.",
  strengths: [
    "Strong analytical thinking",
    "Excellent problem solving",
    "Attention to detail",
    "Team collaboration",
    "Fast learner",
    "Passionate about quality software"
  ],
  experience: {
    africanResonance: {
      company: "African Resonance",
      position: "Software Tester",
      duration: "October 2025 - Present",
      responsibilities: [
        "Communications Testing",
        "Regression Testing",
        "Firmware Testing",
        "POS Terminal Testing",
        "Integration Testing",
        "API Testing",
        "Production Build Validation",
        "Core Pack Testing",
        "Target Testing",
        "Retro Testing",
        "Defect Reporting",
        "Test Execution",
        "Payment Transaction Validation",
        "Production Support"
      ],
      tools: ["Jira", "TestRail", "Wireshark", "TOMS OpenAPI", "Android Studio", "Vysor", "Microsoft Excel"],
      banks: ["FNB", "Absa", "Nedbank", "Standard Bank", "PayCorp"]
    },
    testerWork: {
      company: "Tester Work Company",
      position: "Software Applications Tester (Beta Tester)",
      duration: "August 2022 - January 2024",
      responsibilities: [
        "Web Testing",
        "Mobile Testing",
        "Desktop Testing",
        "Game Testing",
        "Regression Testing",
        "Functional Testing",
        "Exploratory Testing",
        "Bug Reporting"
      ]
    }
  },
  education: [
    "Advanced Diploma in ICT (Applications Development) — Durban University of Technology (2024-2025)",
    "Diploma in ICT (Applications Development) — Durban University of Technology (2021-2023)",
    "National Senior Certificate — Bonokuhle High School (2014-2019)"
  ],
  certifications: [
    "Power Learn Project",
    "National School of Government"
  ],
  links: {
    cv: "images/Bonginkosi_Hadebe_CV_Canva_Style.pdf",
    github: "https://github.com/Bonga324",
    linkedin: "https://za.linkedin.com/in/bonginkosi-william-habebe-8a545423a",
    email: "bonginkosiwilliam686@gmail.com"
  }
};

const CANDIDATE_SKILLS = new Set([
  "Manual Testing",
  "Functional Testing",
  "Regression Testing",
  "Integration Testing",
  "API Testing",
  "Communications Testing",
  "Firmware Testing",
  "POS Terminals",
  "Payment Systems",
  "Banking Systems",
  "SQL",
  "Python",
  "C#",
  "ASP.NET Core",
  "Azure",
  "HTML",
  "CSS",
  "JavaScript",
  "Jira",
  "TestRail",
  "Wireshark",
  "Android Testing",
  "Mobile Testing",
  "Web Testing",
  "Production Support",
  "Defect Management"
]);

/* ------------------------
   State
------------------------ */
let state = {
  mode: "welcome", // welcome | browse | recruiter
  awaiting: null,  // "other-role"
  recruiter: {
    role: null,
    level: null,
    industry: null,
    skills: []
  }
};

/* ------------------------
   Helpers
------------------------ */
function timeNow(){
  return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}

function scrollBottom(){
  elMessages.scrollTop = elMessages.scrollHeight;
}

function clearActions(){
  elActions.innerHTML = "";
}

function saveHistory(){
  const items = [...elMessages.querySelectorAll(".ai-row")].map(row => {
    const role = row.classList.contains("user") ? "user" : "ai";
    const bubble = row.querySelector(".ai-bubble");
    const text = bubble?.dataset?.raw ?? bubble?.innerText ?? "";
    return { role, text };
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadHistory(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  }catch{
    return null;
  }
}

function addMessage(role, content, { html = false } = {}){
  const row = document.createElement("div");
  row.className = `ai-row ${role === "user" ? "user" : "ai"}`;

  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";

  if(html){
    bubble.innerHTML = content;
    bubble.dataset.raw = bubble.innerText;
  }else{
    bubble.textContent = content;
    bubble.dataset.raw = content;
  }

  const t = document.createElement("small");
  t.className = "ai-time";
  t.textContent = timeNow();
  bubble.appendChild(t);

  row.appendChild(bubble);
  elMessages.appendChild(row);
  scrollBottom();
  saveHistory();
}

function aiSay(text){ addMessage("ai", text); }
function aiHtml(html){ addMessage("ai", html, { html: true }); }

function actionGrid(title, buttons){
  clearActions();

  const h = document.createElement("div");
  h.className = "ai-actions-title";
  h.textContent = title;
  elActions.appendChild(h);

  const grid = document.createElement("div");
  grid.className = "ai-action-grid";

  buttons.forEach(b => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `btn btn-small ${b.primary ? "btn-primary" : ""}`.trim();
    btn.textContent = b.label;
    btn.addEventListener("click", b.onClick);
    grid.appendChild(btn);
  });

  elActions.appendChild(grid);
}

/* NEW: Step panel with scrollable body + sticky footer */
function stepPanel({ stepTitle, stepSub, bodyEl, footerButtons }){
  clearActions();

  const panel = document.createElement("div");
  panel.className = "step-panel";

  const t = document.createElement("div");
  t.className = "step-title";
  t.textContent = stepTitle;

  const s = document.createElement("div");
  s.className = "step-sub";
  s.textContent = stepSub;

  const bodyWrap = document.createElement("div");
  bodyWrap.className = "step-body";
  bodyWrap.appendChild(bodyEl);

  const footer = document.createElement("div");
  footer.className = "step-footer";
  footer.style.display = "flex";
  footer.style.gap = ".6rem";
  footer.style.flexWrap = "wrap";

  footerButtons.forEach(b => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `btn btn-small ${b.primary ? "btn-primary" : ""}`.trim();
    btn.textContent = b.label;
    btn.addEventListener("click", b.onClick);
    footer.appendChild(btn);
  });

  panel.appendChild(t);
  panel.appendChild(s);
  panel.appendChild(bodyWrap);
  panel.appendChild(footer);

  elActions.appendChild(panel);
}

/* ------------------------
   Menus
------------------------ */

function showWelcome(){
  state.mode = "welcome";
  state.awaiting = null;

  aiSay(
`Hello and welcome!

I'm Bonga AI, the virtual portfolio assistant for Bonginkosi William Hadebe.

Would you like a personalized recruiter walkthrough?`
  );

  actionGrid("Choose an option:", [
    { label: "Yes, guide me", primary: true, onClick: startRecruiterMode },
    { label: "I'll browse myself", onClick: () => setBrowseMode(true) }
  ]);
}

function setBrowseMode(announce = false){
  state.mode = "browse";
  state.awaiting = null;
  if(announce) aiSay("No problem — choose a section below or ask a question.");
  showMenu();
}

function showMenu(){
  actionGrid("Explore Bonginkosi’s profile:", [
    { label: "About", primary: true, onClick: aboutMenu },
    { label: "Experience", onClick: experienceMenu },
    { label: "Testing", onClick: testingMenu },
    { label: "Payment Systems", onClick: paymentMenu },
    { label: "API Testing", onClick: apiInfo },
    { label: "Projects", onClick: projectsMenu },
    { label: "Education", onClick: educationInfo },
    { label: "Certifications", onClick: certsInfo },
    { label: "Why Hire", onClick: whyHire },
    { label: "Download CV", onClick: downloadCv },
    { label: "Contact", onClick: contactInfo },
    { label: "Recruiter Mode", onClick: startRecruiterMode }
  ]);
}

/* ------------------------
   About
------------------------ */

function aboutMenu(){
  aiSay("What would you like to know?");
  actionGrid("About options:", [
    { label: "Professional Summary", primary: true, onClick: () => aiSay(PROFILE.summary) },
    { label: "Current Role", onClick: () => aiSay(PROFILE.currentRole) },
    { label: "Years of Experience", onClick: () => aiSay(PROFILE.years) },
    { label: "Languages", onClick: () => aiSay(`Languages: ${PROFILE.languages.join(", ")}`) },
    { label: "Career Goals", onClick: () => aiSay(PROFILE.goals) },
    { label: "Strengths", onClick: () => aiSay(`Key strengths:\n- ${PROFILE.strengths.join("\n- ")}`) },
    { label: "Back to Menu", onClick: showMenu }
  ]);
}

/* ------------------------
   Experience
------------------------ */

function experienceMenu(){
  aiSay("Which role would you like to review?");
  actionGrid("Experience:", [
    { label: "African Resonance", primary: true, onClick: africanResonanceInfo },
    { label: "Tester Work", onClick: testerWorkInfo },
    { label: "Back to Menu", onClick: showMenu }
  ]);
}

function africanResonanceInfo(){
  const e = PROFILE.experience.africanResonance;
  aiSay(
`${e.company}
Position: ${e.position}
Duration: ${e.duration}

Responsibilities:
- ${e.responsibilities.join("\n- ")}

Tools:
- ${e.tools.join("\n- ")}

Banks supported:
- ${e.banks.join("\n- ")}`
  );
  showMenu();
}

function testerWorkInfo(){
  const e = PROFILE.experience.testerWork;
  aiSay(
`${e.company}
Position: ${e.position}
Duration: ${e.duration}

Responsibilities:
- ${e.responsibilities.join("\n- ")}`
  );
  showMenu();
}

/* ------------------------
   Testing
------------------------ */

function testingMenu(){
  aiSay("Select a testing area:");
  actionGrid("Testing areas:", [
    { label: "API Testing", primary: true, onClick: () => explainTesting("API Testing") },
    { label: "Regression Testing", onClick: () => explainTesting("Regression Testing") },
    { label: "POS Terminal Testing", onClick: () => explainTesting("POS Terminal Testing") },
    { label: "Firmware Testing", onClick: () => explainTesting("Firmware Testing") },
    { label: "Communications Testing", onClick: () => explainTesting("Communications Testing") },
    { label: "Production Build Validation", onClick: () => explainTesting("Production Build Validation") },
    { label: "Back to Menu", onClick: showMenu }
  ]);
}

function explainTesting(type){
  const map = {
    "API Testing":
`What it is: Testing API requests/responses, status codes, and business rules.
Why it matters: APIs drive core payment and backend workflows.
How Bonginkosi performs it: Uses TOMS OpenAPI to validate responses, error handling, and negative cases.`,
    "Regression Testing":
`What it is: Re-testing existing features after changes to confirm nothing broke.
Why it matters: Prevents old defects from returning.
How Bonginkosi performs it: Repeatable runs + targeted high-risk areas (transactions, comms, device behavior).`,
    "POS Terminal Testing":
`What it is: Testing payment applications running on POS terminals (device + software).
Why it matters: POS issues directly impact customers and revenue.
How Bonginkosi performs it: Transaction validation, regression, device checks and defect reporting.`,
    "Firmware Testing":
`What it is: Verifying firmware behavior on devices and compatibility with the payment app.
Why it matters: Firmware updates can change stability and transaction behavior.
How Bonginkosi performs it: Firmware validation + targeted device scenarios.`,
    "Communications Testing":
`What it is: Validating communication between terminals and host systems.
Why it matters: Payments rely on stable and correct communication.
How Bonginkosi performs it: Uses tools like Wireshark to investigate comms behavior and failures.`,
    "Production Build Validation":
`What it is: Confirming release builds are correct and ready for production use.
Why it matters: Prevents incidents after deployment.
How Bonginkosi performs it: Verification checks + targeted regression + payment transaction validation.`
  };

  aiSay(map[type] || "I don’t have details for that area right now.");
  showMenu();
}

/* ------------------------
   Payments / API
------------------------ */

function paymentMenu(){
  aiSay("Select a payment environment:");
  actionGrid("Payment environments:", ["FNB","Absa","Nedbank","Standard Bank","PayCorp"].map((x, i) => ({
    label: x,
    primary: i === 0,
    onClick: () => paymentEnv(x)
  })).concat([{ label: "Back to Menu", onClick: showMenu }]));
}

function paymentEnv(name){
  aiSay(
`${name} environment overview (Bonginkosi’s testing focus):

- Payment terminal testing
- Transaction validation
- Communications testing
- Integration testing
- Regression testing
- Firmware testing
- Production validation
- Defect management

He validates payment transactions and software running on POS terminals.`
  );
  showMenu();
}

function apiInfo(){
  aiSay(
`API Testing Experience:
- Uses TOMS OpenAPI
- Tests API requests and responses
- Validates status codes and business rules
- Performs negative testing and error handling checks
- Verifies integrations end-to-end where applicable`
  );
  showMenu();
}

/* ------------------------
   Projects / Education / Certs / Why Hire / CV / Contact
------------------------ */

function projectsMenu(){
  aiSay("Which project would you like to hear about?");
  actionGrid("Projects:", [
    { label: "eConFix", primary: true, onClick: () => aiSay("eConFix: ASP.NET MVC platform to book skilled professionals, manage service requests, and support secure online payments.") },
    { label: "Travel Wishlist", onClick: () => aiSay("Travel Wishlist: interactive wishlist with budgeting + voting poll to show UI/UX and JavaScript interactivity.") },
    { label: "ISO8583 Decoder", onClick: () => aiSay("ISO8583 Message Decoder: reads ISO8583 messages, decodes bitmap, parses EMV Field 55 + proprietary fields, and displays transaction info for payment debugging.") },
    { label: "POS Utilities", onClick: () => aiSay("POS Testing Utilities: practical helpers aimed at speeding up validation and troubleshooting during POS/payment testing.") },
    { label: "Automation Tools", onClick: () => aiSay("Automation Tools: small scripts/helpers focused on reducing manual repetition and improving repeatability in testing.") },
    { label: "Back to Menu", onClick: showMenu }
  ]);
}

function educationInfo(){
  aiSay(`Education:\n- ${PROFILE.education.join("\n- ")}`);
  showMenu();
}

function certsInfo(){
  aiSay(`Certifications:\n- ${PROFILE.certifications.join("\n- ")}`);
  showMenu();
}

function whyHire(){
  aiSay(
`Why hire Bonginkosi:
- Nearly four years of QA experience
- Banking/FinTech and payment systems context
- POS terminal testing + payment transaction validation
- API testing using TOMS OpenAPI
- Regression, firmware, communications testing + production validation
- SQL knowledge + programming background (Python, C#, ASP.NET Core, JavaScript)
- Strong collaboration, problem solving, and attention to detail`
  );
  showMenu();
}

function downloadCv(){
  aiSay(`Download CV: ${PROFILE.links.cv}`);
  showMenu();
}

function contactInfo(){
  aiSay(
`Contact:
- Email: ${PROFILE.links.email}
- LinkedIn: ${PROFILE.links.linkedin}
- GitHub: ${PROFILE.links.github}`
  );
  showMenu();
}

/* ------------------------
   Recruiter Mode (Stepper)
------------------------ */

function startRecruiterMode(){
  state.mode = "recruiter";
  state.awaiting = null;
  state.recruiter = { role: null, level: null, industry: null, skills: [] };

  aiSay("Recruiter Mode started. I’ll ask a few quick questions to tailor the walkthrough.");
  recruiterStep1();
}

function recruiterStep1(){
  const body = document.createElement("div");
  body.style.display = "flex";
  body.style.flexWrap = "wrap";
  body.style.gap = ".6rem";

  const roles = [
    "Software QA Engineer","QA Automation Engineer","Test Analyst","Software Developer",
    "Full Stack Developer","Backend Developer","FinTech Engineer","Graduate Developer","Internship","Other"
  ];

  roles.forEach((r, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `btn btn-small ${idx === 0 ? "btn-primary" : ""}`.trim();
    b.textContent = r;
    b.addEventListener("click", () => {
      if(r === "Other"){
        state.awaiting = "other-role";
        aiSay("Type the position title you’re hiring for.");
        clearActions();
        return;
      }
      state.recruiter.role = r;
      recruiterStep2();
    });
    body.appendChild(b);
  });

  stepPanel({
    stepTitle: "Step 1 — Role",
    stepSub: "What role are you hiring for?",
    bodyEl: body,
    footerButtons: [{ label: "Back to Menu", onClick: showMenu }]
  });
}

function recruiterStep2(){
  const body = document.createElement("div");
  body.style.display = "flex";
  body.style.flexWrap = "wrap";
  body.style.gap = ".6rem";

  const levels = ["Graduate","Junior","Intermediate","Senior","No Preference"];
  levels.forEach((lvl, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `btn btn-small ${idx === 2 ? "btn-primary" : ""}`.trim();
    b.textContent = lvl;
    b.addEventListener("click", () => {
      state.recruiter.level = lvl;
      recruiterStep3();
    });
    body.appendChild(b);
  });

  stepPanel({
    stepTitle: "Step 2 — Experience Level",
    stepSub: "How experienced should your ideal candidate be?",
    bodyEl: body,
    footerButtons: [{ label: "Back", onClick: recruiterStep1 }]
  });
}

function recruiterStep3(){
  const body = document.createElement("div");
  body.style.display = "flex";
  body.style.flexWrap = "wrap";
  body.style.gap = ".6rem";

  const industries = ["Banking","FinTech","Insurance","Telecommunications","Healthcare","Retail","Government","Gaming","Education","Other"];
  industries.forEach((ind, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `btn btn-small ${idx === 0 ? "btn-primary" : ""}`.trim();
    b.textContent = ind;
    b.addEventListener("click", () => {
      state.recruiter.industry = ind;
      recruiterStep4();
    });
    body.appendChild(b);
  });

  stepPanel({
    stepTitle: "Step 3 — Industry",
    stepSub: "Which industry is this role for?",
    bodyEl: body,
    footerButtons: [{ label: "Back", onClick: recruiterStep2 }]
  });
}

function recruiterStep4(){
  const wrapper = document.createElement("div");

  const note = document.createElement("div");
  note.style.color = "rgba(234,242,255,.72)";
  note.style.fontSize = ".92rem";
  note.style.marginBottom = ".75rem";
  note.textContent = "Select skills (multi-select), then Continue.";

  const skills = [
    "Manual Testing","Automation Testing","API Testing","Regression Testing","Functional Testing",
    "Integration Testing","Performance Testing","SQL","Python","C#","ASP.NET Core","Azure",
    "HTML","CSS","JavaScript","POS Terminals","Payment Systems","Banking Systems",
    "Jira","TestRail","Selenium","Wireshark","Android Testing","Mobile Testing",
    "Web Testing","Production Support","Defect Management"
  ];

  const grid = document.createElement("div");
  grid.className = "skill-select";

  const selected = new Set(state.recruiter.skills);

  skills.forEach(skill => {
    const label = document.createElement("label");
    label.className = "skill-check";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = selected.has(skill);
    cb.addEventListener("change", () => {
      if(cb.checked) selected.add(skill);
      else selected.delete(skill);
    });

    const span = document.createElement("span");
    span.textContent = skill;

    label.appendChild(cb);
    label.appendChild(span);
    grid.appendChild(label);
  });

  wrapper.appendChild(note);
  wrapper.appendChild(grid);

  stepPanel({
    stepTitle: "Step 4 — Skills",
    stepSub: "What requirements matter most for this hire?",
    bodyEl: wrapper,
    footerButtons: [
      { label: "Back", onClick: recruiterStep3 },
      {
        label: "Continue",
        primary: true,
        onClick: () => {
          state.recruiter.skills = [...selected];
          recruiterStep5();
        }
      }
    ]
  });
}

function recruiterStep5(){
  const { role, industry, skills } = state.recruiter;
  const match = computeMatch({ role, industry, skills });

  aiHtml(renderMatchCard(match));
  animateProgress(match.score);

  actionGrid("Recommended next steps:", [
    { label: "Experience", primary: true, onClick: experienceMenu },
    { label: "Payment Systems", onClick: paymentMenu },
    { label: "API Testing", onClick: apiInfo },
    { label: "Projects", onClick: projectsMenu },
    { label: "Download CV", onClick: downloadCv },
    { label: "Contact", onClick: contactInfo },
    { label: "End walkthrough", onClick: endWalkthrough }
  ]);
}

function endWalkthrough(){
  aiSay(
`Thank you for reviewing Bonginkosi’s profile.

If you’d like to proceed, you can:
- Download his CV for your records
- Reach out via LinkedIn or email
- Ask me interview-style questions (e.g., “Describe your API testing experience”)

I’m ready whenever you are.`
  );
  showMenu();
}

function computeMatch({ role, industry, skills }){
  let base = 72;

  const r = (role || "").toLowerCase();
  if (r.includes("qa") || r.includes("test")) base += 12;
  if (r.includes("fintech")) base += 8;
  if (r.includes("developer") || r.includes("backend") || r.includes("full stack")) base -= 5;

  const ind = (industry || "").toLowerCase();
  if (ind.includes("bank") || ind.includes("fintech")) base += 10;

  let present = 0;
  if (Array.isArray(skills) && skills.length > 0) {
    skills.forEach(s => { if (CANDIDATE_SKILLS.has(s)) present++; });
    const skillScore = Math.round((present / skills.length) * 100);
    base = Math.round((base * 0.55) + (skillScore * 0.45));
  }

  const score = Math.max(0, Math.min(100, base));

  const label =
    score >= 90 ? "Excellent Match" :
    score >= 75 ? "Strong Match" :
    score >= 60 ? "Moderate Match" :
    "Partial Match";

  const why = [];
  if (skills?.length) skills.forEach(s => { if (CANDIDATE_SKILLS.has(s)) why.push(s); });

  if (why.length === 0) {
    why.push(
      "Nearly four years of QA experience",
      "Banking/FinTech exposure + payment transaction validation",
      "API testing using TOMS OpenAPI",
      "POS terminal testing + regression testing"
    );
  } else {
    if (!why.some(x => x.toLowerCase().includes("api"))) why.push("API Testing (TOMS OpenAPI)");
    if (!why.some(x => x.toLowerCase().includes("pos"))) why.push("POS terminal testing");
  }

  return { score, label, why: [...new Set(why)].slice(0, 10) };
}

function renderMatchCard(match){
  const list = match.why.map(x => `<li>✔ ${escapeHtml(x)}</li>`).join("");
  return `
    <div class="match-card">
      <div class="match-top">
        <div>
          <div class="match-score">${match.score}%</div>
          <div class="match-label">${escapeHtml(match.label)}</div>
        </div>
        <div style="color: rgba(234,242,255,.72); font-weight:800;">
          Candidate Match
        </div>
      </div>

      <div class="progress" aria-label="Match score progress">
        <div id="matchBar"></div>
      </div>

      <div style="margin-top:.85rem; color: rgba(234,242,255,.9); font-weight:900;">Why this match</div>
      <ul style="margin-top:.5rem; padding-left:1.1rem; color: rgba(234,242,255,.75);">
        ${list}
      </ul>
    </div>
  `;
}

function animateProgress(score){
  const bar = document.getElementById("matchBar");
  if(!bar) return;
  requestAnimationFrame(() => { bar.style.width = score + "%"; });
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[s]));
}

/* ------------------------
   Natural language Q&A
------------------------ */

function answerNaturalLanguage(q){
  const s = q.toLowerCase();

  if (s.includes("tell me about yourself") || s.includes("summary")) return PROFILE.summary;
  if (s.includes("bank") || s.includes("fintech") || s.includes("payment"))
    return "Yes — Bonginkosi has banking/FinTech exposure through payment solution testing, including POS terminal testing, transaction validation, communications testing, and production build validation across FNB, Absa, Nedbank, Standard Bank, and PayCorp environments.";
  if (s.includes("pos"))
    return "Yes — he tests software running on POS terminals and validates payment transactions, including regression, firmware checks, and communications testing.";
  if (s.includes("api"))
    return "Yes — he performs API testing using TOMS OpenAPI, validating requests/responses, status codes, business rules, and negative/error-handling scenarios.";
  if (s.includes("sql"))
    return "SQL is part of his technical background and supports data validation and backend understanding during testing and troubleshooting.";
  if (s.includes("azure"))
    return "Microsoft Azure is part of his technical background. If you share the role requirements, I can highlight the closest matching experience honestly.";
  if (s.includes("education")) return `Education:\n- ${PROFILE.education.join("\n- ")}`;
  if (s.includes("cert")) return `Certifications:\n- ${PROFILE.certifications.join("\n- ")}`;
  if (s.includes("project")) return "Projects include: eConFix, Travel Wishlist, ISO8583 Message Decoder, POS Testing Utilities, and Automation Tools. See projects.html for a full list.";
  if (s.includes("download") || s.includes("cv") || s.includes("resume")) return `Download CV: ${PROFILE.links.cv}`;
  if (s.includes("contact") || s.includes("email") || s.includes("linkedin")) return `Email: ${PROFILE.links.email}\nLinkedIn: ${PROFILE.links.linkedin}\nGitHub: ${PROFILE.links.github}`;

  return "I don’t have that information available in Bonginkosi’s portfolio/CV data right now. If you tell me the role and key requirements, I can highlight the closest matching experience honestly.";
}

/* ------------------------
   Events
------------------------ */

function onSend(){
  const text = elInput.value.trim();
  if(!text) return;

  addMessage("user", text);
  elInput.value = "";
  elInput.style.height = "auto";

  if(state.awaiting === "other-role"){
    state.recruiter.role = text;
    state.awaiting = null;
    recruiterStep2();
    return;
  }

  aiSay(answerNaturalLanguage(text));
  showMenu();
}

btnSend.addEventListener("click", onSend);

elInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    onSend();
  }
});

elInput.addEventListener("input", () => {
  elInput.style.height = "auto";
  elInput.style.height = Math.min(elInput.scrollHeight, 140) + "px";
});

btnMenu.addEventListener("click", () => showMenu());

btnClear.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  elMessages.innerHTML = "";
  clearActions();
  state = {
    mode: "welcome",
    awaiting: null,
    recruiter: { role: null, level: null, industry: null, skills: [] }
  };
  showWelcome();
});

btnSummary.addEventListener("click", () => {
  aiSay(
`Candidate Summary (copy-ready)

${PROFILE.name} is a Software Quality Assurance Engineer with nearly four years of experience in software testing across fintech, banking, enterprise applications, web, mobile and payment systems.

Strengths include:
- Banking systems + payment systems
- POS terminal testing
- API testing (TOMS OpenAPI)
- Regression testing
- Firmware testing
- Communications testing
- SQL
- Python, C#, ASP.NET Core, Azure
- Production build validation
- Team collaboration, problem solving, attention to detail`
  );
  showMenu();
});

/* ------------------------
   Init
------------------------ */

(function init(){
  const history = loadHistory();
  if(history){
    history.forEach(item => addMessage(item.role, item.text));
    showMenu();
  }else{
    showWelcome();
  }
})();