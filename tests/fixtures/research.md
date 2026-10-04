# ALTER PEDRO – evidence pack for the creative lead

Prepared 2026-10-04 (IST). All page reads and measurements were made on this date.
Rules used: every claim carries a URL. "MEASURED/OBSERVED" = I saw it directly. "INFERENCE" = my reading, not a fact. "Not measured" = I could not get it.
Raw data (Lighthouse JSON, DOM dumps, screenshots, autocomplete output): `/workspace/research/` (`lh/`, `dom/`, `ac_out.txt`, `ac2.json`).

---------------------------------------------------------------------

## 0. Method and limits (read first)

- Hero text, CTAs, video and positions were read from the rendered DOM in headless Chrome 154 (desktop 1440x900, mobile 390x844) on 2026-10-04. Fold = 900 px desktop. Text below is quoted from the DOM or raw HTML, not from screenshots. (One screenshot-based read said Vu's badge was "98%"; the page HTML says "90%". I discarded all screenshot-derived numbers.)
- I did not type into, submit, or sign in to any tool. So I report what each intake asks for from page text only, not what it returns.
- Cookie banners overlay several pages on first load (Clay, Vu, Finsweet). Fold content below is what sits behind them.
- Lighthouse 13.5.0, mobile form factor, `--preset=perf`, 2 runs per page, run from the box (network is not a phone on 4G). Lab data only. No field data (CrUX) was pulled.
- PageSpeed Insights API: tried once, returned HTTP 429 quota exceeded (https://www.googleapis.com/pagespeedonline/v5/runPagespeed). So no PSI numbers.
- Search ranking: I could not read a live Google results page or "People Also Ask". Bing via curl returned junk. "Ranking page" below means the pages the web-search tool returned for that query . Treat as "answers the query", not "rank #1".
- Keyword phrases come from Google's public autocomplete endpoint (`suggestqueries.google.com/complete/search?client=firefox&hl=en`), queried once from the box IP on 2026-10-04. Location of the box IP is unknown. **Search volume: volume not measured** for every phrase (no keyword tool access).

---------------------------------------------------------------------

## 1. Benchmark set

Chosen: Clay, Finsweet (owner-named) plus five comparables:
- Wednesday Solutions – Pune, India HQ (https://in.linkedin.com/company/wednesday-solutions, via search result). India-based.
- Simform – AI-native product engineering. HQ country not verified by me.
- Vu Agency (UK) – "software your business is missing". Closest positioning to ALTER PEDRO. Has a separate AI quote intake at quote.vu.co.uk. AI-led intake.
- thoughtbot – well-known product/design agency, problem-first style.
- Factory Nexus (by TynHub) – AI-led intake, but a software product, not a services firm. Included only as an intake pattern reference.

### 1.1 Hero table (exact text)

| Site / URL | H1 (exact) | Sub line (exact) | Primary CTA | Secondary CTA | Video in hero | Proof above the fold (900 px) |
|---|---|---|---|---|---|---|
| Clay https://www.clay.com/ | "Build systems to grow revenue" | "Infrastructure to get any data, run agentic workflows, and launch GTM plays." (y≈607) | "Start free trial" (→ app.clay.com/signup) | "Get a demo" (→ clay.com/demo). Also "or install directly with / Paste in your coding agent" | YES. Autoplay, muted, loop MP4: https://assets.clayrun.dev/Hero%2006-02%20Lossy%200001-0240.mp4 | Only at the fold edge (y≈892): "Trusted by more than 500,000 leading GTM teams of all sizes. Inspired by our customers. Built with love." Metric/quote tiles ("+140% outbound pipeline", "80%+ enrichment coverage", "3x reply rate", "+50% SQLs") sit just below (positions not measured). Top bar: "The most creative minds in GTM. October 8, San Francisco Get tickets →" |
| Finsweet https://finsweet.com/ (www redirects here) | "We build the websites and web apps behind high-growth B2B" | "We design and build websites and web apps for B2B and enterprise companies, from rebrands and migrations to complex web projects and custom applications." (y≈366) | "Expert Services" (→ finsweet.com/agency) | "Company" (→ /company). Nav: "Contact Sales" (→ /agency/sales) | YES. Reel with "Watch our work" play button at y≈865 (blob video, starts at fold edge) | None in the first 900 px (no logos, no numbers). First proof: "Dropbox transformed their events experience" y≈1704; testimonials y≈3711 |
| Wednesday https://www.wednesday.is/ | "We build digital products for tomorrow to help businesses succeed today" | None found | "Let's Talk" (→ /contact-us#contact-section) | None in hero. Nav: "Case Studies". Banner: "Once a month, what we're seeing inside businesses using AI. Get Overheard →" | No visible hero video | None above the fold. "Trusted Globally by startups, unicorns, and enterprises" is an H2 further down. A search snippet of wednesday.is/your-partner reads "From the team behind 10% of India's unicorns." |
| Simform https://www.simform.com/ | "AI-Native Engineering For Digital Products & Enterprise Solutions" | "Agile in mind, spirit, and speed" | "Book A Consultation Call" (→ /contact) | Nav "Contact Us" (→ /contact/). Banner "Register Now" (webinar, Oct 15, 2026) | No | None. "Featured Stories" heading starts at y≈832 |
| Vu Agency https://vu.co.uk/ (www redirects) | "We build the software your business is missing." | "We build software, filling gaps between tools that your team already use, with the saving and running costs assessed before the build. We handle the build, security and ongoing maintenance." | "SEND YOUR REQUIREMENT" (→ #requirement) | "HOW IT WORKS" (→ #how). Also "SEE OUR WORK", "MESSAGE US ON WHATSAPP" | No | YES: "AWARD-WINNING AGENCY" (y≈581); "50+ businesses run work through software we've built" (y≈642); testimonial name "Zoe Hubert · Olton Bedrooms" (y≈834) |
| Vu Quote AI https://quote.vu.co.uk/ | "Get your project quoted in minutes and built in days." | "Describe your project and our AI agents will generate a complete specification, mockup, price and timeline within minutes." | Input modes "WRITE" / "SPEAK" (y≈809, just below the fold). Nav: "CONTACT US", "MY QUOTES" | – | No | Badges in page HTML: "90% of projects delivered within 4 days", "100% UK-based developers". On mobile the page says "Best experienced on desktop" |
| thoughtbot https://thoughtbot.com/ | "When the stakes are high, experience matters" | "Our senior team partners with you to deliver reliable software and strengthen your team, even under complex constraints." | "Let’s talk" (→ /hire-us) | None in hero. Nav "Let’s get started!" (same URL) | No (case-study videos exist lower, not visible) | None. "Over 1,000+ positive outcomes" is an H2 lower down |
| Factory Nexus https://factory-nexus.ai/ | "Describe a feature. Watch your AI team ship it." | "Multiple agents work in parallel on isolated branches. Code reviewed automatically for architecture, security, and style. Ready to merge in minutes, not days." | A text box: placeholder "Describe what you want built..." with note "No signup required — try it right now" | Example chips ("A React dashboard for tracking tasks", etc.); links "Or watch a live demo →", "Estimate an idea →" (/estimate), "Connect a Repo →". Nav "Get Started" (→ /register) | No | None |

Sources for each row are the URL in column 1. Raw: `/workspace/research/dom/*.json`.

Other observed facts:
- Clay's home page also has an interactive prompt box: heading "What do you want to build?" with a "Submit" button and example prompts such as "Find companies with 3+ open roles that mention international expansion in the job descriptions" (https://www.clay.com/). It sits at y≈2484 on desktop, about 2.8 screens down. I did not submit it. What it does after Submit: not tested.
- Finsweet hero: 2 CTAs are navigation to pages ("Expert Services", "Company"). The sales action ("Contact Sales") lives only in the nav (https://finsweet.com/).

### 1.2 Clicks to first value (observed from link targets; nothing submitted)

| Site | Path | Clicks to first value |
|---|---|---|
| Clay | "Start free trial" → https://app.clay.com/signup | 1 click to a sign-up page. Value needs an account. |
| Finsweet | "Contact Sales" → https://finsweet.com/agency/sales | 1 click to a sales page. No self-serve value. |
| Wednesday | "Let's Talk" → https://www.wednesday.is/contact-us#contact-section | 1 click to a contact section. |
| Simform | "Book A Consultation Call" → https://www.simform.com/contact | 1 click to a contact page. |
| Vu home | "SEND YOUR REQUIREMENT" → https://vu.co.uk/#requirement | 1 click to an on-page form. |
| Vu Quote AI | Type or speak a brief on https://quote.vu.co.uk/ | 0 clicks to start. Page text: "Enter your email to get your quote". Deposit of 50% before build (page text). |
| thoughtbot | "Let’s talk" → https://thoughtbot.com/hire-us | 1 click to a contact page. |
| Factory Nexus | Type into the hero box | 0 clicks to start. Page: "No signup required — try it right now". The /estimate page says anonymous visitors get "three replies per conversation" and "no email required" (https://factory-nexus.ai/estimate, from search-tool text; I did not open the tool). |

INFERENCE: only the two AI-intake sites (Vu Quote AI, Factory Nexus) let a visitor start before any contact form. All five services home pages (Finsweet, Wednesday, Simform, Vu, thoughtbot) send the first click to a contact/sales page; Clay sends it to sign-up.

### 1.3 Case study structure (one example per firm, structure read from headings)

- **Clay** – Index https://www.clay.com/customers: filter by Role, Industry, Use case; grid/list; cards headline a metric, e.g. "Anthropic 3x’d their enrichment rate with Clay’s data marketplace", "+50% More qualified meetings per rep". Detail page https://www.clay.com/customers/hex: H1 "How Hex increased inbound win-rate 50% using Clay" → "At a glance" block with pull quote, Company, Industry, HQ, Use case → problem/solution → three numbered use-case sections, each an outcome headline (e.g. "Qualified website visitor signal increase win rate 1.5x") → "Clay's impact" → "Explore more customers" → CTAs "Get a demo" / "Start free trial". Home page also pairs each customer with one number in one sentence, e.g. "Mistral AI cut the time to map their TAM and score accounts from 2 months to 10 days." (https://www.clay.com/)
- **Finsweet** – https://finsweet.com/portfolio/dropbox: H1 is the client name only → meta (Enterprise project, Year, Services, Location) → short narrative + screenshots → "Before Finsweet" / "After Finsweet" bullet lists → one testimonial → "More Finsweet work" → CTA "Get started". This page has no numbers. Home page gives card summaries ("Dropbox transformed their events experience") and a testimonial with a number: "Average time on site has doubled (up 102%)" (https://finsweet.com/).
- **Simform** – https://www.simform.com/case-studies/last-mile-delivery-platform-cuts-manual-status-calls-by-30-with-azure-migration/: outcome headline with number → three big stat blocks ("30%", "45%", "<4 hours") → Client Overview → Challenges (3 items) → Solution → Business Impact → Related case studies → "Let's talk". Strongest problem→outcome template of the set.
- **thoughtbot** – https://thoughtbot.com/case-studies/closeknit-health: H1 outcome sentence → Client → "The Result" → a question as H3 ("How do you create a product that can handle multiple integrations and bring it to market fast?") → "What We Did" → CTA "What does success look like for your project?". Short page (about 3.3k characters). No numeric stat blocks found.
- **Wednesday** – https://www.wednesday.is/engineering-case-studies/whatsapp-chatbot-to-place-and-track-orders-for-a-leading-lens-manufacturer-in-asia: H1 (what + for whom) → tags → "Challenges" → "Solution" → testimonials block → "Let's Talk". Short page (about 2.7k characters). No numeric stat blocks found.
- **Vu** – https://vu.co.uk/our-work: H1 "Problems we've solved for our clients" → each project is a title plus UI screenshots with figures inside the mockups. Home page labels one such figure block "Illustrative workflow", so I cannot tell which figures are real. Not usable as a proof reference.

INFERENCE: Clay and Simform lead with a measured number and a structure the reader can scan in seconds. Wednesday, thoughtbot and Finsweet (Dropbox) lead with narrative. Only Vu frames case studies as "Problems we've solved", the same framing ALTER PEDRO wants.

---------------------------------------------------------------------

## 2. Performance (Lighthouse 13.5.0, mobile, 2 runs each)

Measured 2026-10-04, between 20:46 and 20:58 IST (15:16–15:28 UTC) from the box. LCP = largest contentful paint. Page weight = Lighthouse "total-byte-weight" on first load, no scrolling. Raw: `/workspace/research/lh/*.json`.

| Page | LCP run 1 / run 2 (s) | Page weight (MiB) | Requests | CLS | Perf score | Notes |
|---|---|---|---|---|---|---|
| https://www.clay.com/ | 8.66 / 8.62 | 26.3 | 198 / 197 | 0 | not scored | Lighthouse warned "page loaded too slowly to finish within the time limit"; TBT and TTI failed. The 26 MiB total includes autoplay video. Weight cause not isolated. |
| https://finsweet.com/ (www redirects) | 2.97 / 2.98 | 10.2 | 247 | 0 | not scored | Same "too slow to finish" warning. TBT not measured. |
| https://www.wednesday.is/ | 2.21 / 2.15 | 5.4 | 115 | 0 | 74 / 75 | TBT 1045 / 986 ms |
| https://www.simform.com/ | 2.72 / 2.75 | 3.6 | 95 | 0.13 | 75 / 76 | TBT 396 / 344 ms |
| https://vu.co.uk/ (www redirects) | 3.82 / 3.86 | 1.0 | 30 | 0.55 | 53 / 52 | Very light but layout shifts a lot (CLS 0.55) |
| https://thoughtbot.com/ | 2.48 / 2.41 | 12.6 | 236 / 237 | 0 | 68 / 68 | TBT about 1.5 s |
| https://factory-nexus.ai/ | 2.11 / 2.11 | 0.8 | 10 | 0 | 92 / 91 | |
| https://quote.vu.co.uk/ | not measured | not measured | – | – | – | Not run |

PageSpeed Insights API: not measured (HTTP 429, see section 0). Field/CrUX data: not measured.
Observed facts only. INFERENCE: heavy autoplay video (Clay) and heavy asset sets (thoughtbot, Finsweet) cost weight, and Clay's LCP of about 8.6 s on this lab setup is the worst here even though Clay is the owner's quality reference. A lab number on a datacentre box is not a user's phone, so use these as relative, not absolute.

---------------------------------------------------------------------

## 3. Intent and keyword evidence

How to read: "Suggest" = exact phrases returned by Google autocomplete (https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=…), 2026-10-04. "Answering pages" = pages returned by the web-search tool for the problem query (not a verified Google rank). **Volume: volume not measured for all rows.** "People Also Ask": not measured (could not reach a Google results page).

### 3.1 Systems not talking to each other
- Suggest (exact): "systems not talking to each other"; "systems that don't talk to each other"; "disconnected systems"; "disconnected legacy systems"; "integrated crm and erp"; "how does erp and crm work together". The full sentence "our systems don't talk to each other" returned no suggestions.
- Answering pages:
  - https://madeintandem.com/solutions/system-integration/ – service/solution page ("The ERP doesn't know what the CRM knows. Finance builds weekly reports by pulling CSVs from four systems.")
  - https://www.emanprague.com/en/blog/your-systems-dont-talk-to-each-other-youre-missing-an-integration-layer/ – blog explainer
  - https://maytechweb.com.au/insights/why-your-business-systems-dont-talk-to-each-other-and-what-to-do-about-it/ – advice article
  - https://ztabs.co/blog/custom-integrations-guide – how-to guide
  - https://www.tactis.com/articles/blog/data-integration-api-development-and-legacy-system-modernization – blog
- Note: "systems not talking" alone also returns off-topic junk ("hive system not talking to boiler"), so short forms are ambiguous.

### 3.2 Website gets traffic but no enquiries
- Suggest (exact): "website traffic but no leads"; "website get traffic but no leads"; "getting website traffic but no sales"; "lots of website traffic but no sales"; "why is my website getting traffic but no sales"; "people visiting website but not buying"; "website not generating leads"; "why is my website not generating leads"; "why your website gets traffic but no leads". "website traffic but no enquiries" returned nothing.
- Answering pages (all agency blog posts, diagnostic lists):
  - https://www.sprintli.com/insights/12-reasons-why-your-website-gets-traffic-but-no-leads
  - https://communicapro.com/insights/traffic-no-leads
  - https://rmcm.io/insights/website-traffic-but-no-leads
  - https://pexnet.com/blog/website-traffic-but-no-leads/
  - https://socialfirm.com/blog/why-your-website-gets-traffic-but-no-leads-and-how-to-fix-it/
- INFERENCE: the user's wording is "leads" and "sales", not "enquiries". Use "leads" in copy for global audience.

### 3.3 Team wastes time on manual reports
- Suggest (exact): "automate reports in excel"; "automate excel reports"; "automate reports with power query"; "automate reports with python"; "automate reports in power bi"; "automate excel report generation"; "automate reports in salesforce"; "automate reports in sap". The problem-phrased queries ("spending too much time on manual reports", "how to stop manual reporting") returned nothing; "manual reporting" returns compliance-report noise ("reporting manual esef").
- Answering pages:
  - https://getelyxai.com/en/blog/how-to-automate-excel-reports – how-to blog
  - https://jaadgroupexcelconsulting.com/how-to-automate-excel-reports-a-step-by-step-guide/ – consultant guide
  - https://helion360.com/blog/how-to-build-automated-excel-reports-that-save-time – blog
  - Forum: https://www.reddit.com/r/automation/comments/1sbcei2/whats_the_one_process_in_your_business_that_you/ – title "whats the one process in your business that you know should be automated but you keep putting off?" Quote in thread: "I keep manually sending weekly reports know it should be automated, just haven’t gotten around to it yet."
  - Forum: https://www.reddit.com/r/automation/comments/1mx000m/has_anyone_seen_automation_actually_save_time/
- INFERENCE: people search the tool (Excel, Power BI, Python), not the pain. The pain phrase lives in forums.

### 3.4 Want AI but don't know where to start
- Suggest (exact): "where to start with ai"; "where to start with ai reddit"; "how to start using ai at work"; "how can ai help my business"; "how can ai help my small business"; "how to use ai in my business"; "ai consultant for small business"; "ai consultant for small business near me"; "ai readiness assessment"; "ai readiness checker"; "ai readiness score"; "ai readiness assessment tool"; "ai readiness checklist". The sentence "want to use ai but don't know where to start" returned nothing.
- Answering pages:
  - https://aayushjain.com/blog/ai-readiness-assessment-for-smbs – blog, assessment guide
  - https://www.1mpact-tc.com/post/ai-readiness-checklist – checklist article
  - https://www.stephenthorn.com/blog/where-to-start-with-ai-small-business/ – blog
  - https://www.bridgeviewit.com/blog/ai-readiness-assessment-smb-guide/ – MSP blog
  - https://edisonai.au/insights/ai-readiness-audit-what-it-is – service explainer
  - Forum: https://www.reddit.com/r/GrowthHacking/comments/1na17w7/how_do_i_start_using_ai_for_my_business/ – "How do I start using AI for my business?"
  - Forum: https://www.reddit.com/r/smallbusiness/comments/1vbz9b3/how_are_you_using_ai_in_your_business/
- INFERENCE: "ai readiness checker / score / assessment tool" are tool-shaped queries. A free scan fits that intent.

### 3.5 Old software everyone hates
- Suggest (exact): "outdated software how to fix"; "outdated software risks"; "your software is outdated"; "how to update outdated software"; "legacy system modernization" (+ "services", "strategies", "case study", "companies", "with ai"). **Warning:** plain "old software" is dominated by consumer intent ("old software download", "old software archive", "old software for sale"). Do not build on "old software".
- Answering pages:
  - https://spin.atomicobject.com/replace-business-software/ – "Time to Replace Your Business Software? Here Are the Signs" (blog)
  - https://www.basadstudios.com/en/blog/modernization-vs-replacement-how-to-decide – decision article
  - https://cubes.rs/software-development/modernize-or-replace-a-legacy-system-a-practical-decision-framework/ – framework article
  - https://gvmtechnologies.com/signs-business-needs-software-modernization/ – checklist
  - Forum (exact user wording): https://www.reddit.com/r/ERP/comments/1cip52z/it_seems_like_everyone_hates_their_erp_what_is/ – "It seems like everyone hates their ERP. What is the biggest pain?"
  - Forum: https://www.reddit.com/r/softwarearchitecture/comments/1q8ziok/finally_convinced_leadership_to_let_us_rewrite/ – "Finally convinced leadership to let us rewrite the legacy app. Now everyone is terrified to start"

### 3.6 Idea but no tech team
- Suggest (exact): "i have an idea for an app"; "i have an idea for an app how do i develop it"; "…where do i start"; "…how do i protect it"; "…but no money"; "…what do i do"; "…now what"; "…now what reddit"; "find a technical cofounder"; "looking for a technical cofounder"; "where can i find a technical cofounder"; "build mvp without code".
- Answering pages / forums:
  - https://www.reddit.com/r/Entrepreneur/comments/1r8rvd8/i_want_to_build_an_app_where_do_i_start/ – "I want to build an App, where do I start?"
  - https://www.reddit.com/r/AppIdeas/comments/1j0zd9c/i_have_an_idea_for_an_app_but_zero_development/ – "I have an idea for an app, but zero development skills. Any suggestions on how to proceed?"
  - https://beforeyoubuild.my/frameworks/customer-interview-scripts/ – framework article
  - https://www.pickfu.com/idea-validation – tool/vendor guide
- INFERENCE: this audience is founders and individuals, often with "no money". It is a different buyer from the mid-market ops buyer in 3.1/3.7/3.8. Decide if the scan serves both.

### 3.7 Inventory doesn't match
- Suggest (exact): "inventory discrepancy" (+ "meaning", "report template", "investigation", "formula"); "stock mismatch" (+ "in marg", "meaning in hindi", "mail format"); "physical stock mismatch in marg"; "physical stock mismatch"; "inventory management problems and solutions". "inventory doesn't match" and "inventory not matching" returned only "stock not matching". "Marg" is Indian accounting software, "meaning in hindi" is Indian usage – both are India signals (INFERENCE).
- Answering pages / forums:
  - https://www.reddit.com/r/InventoryManagement/comments/1u1fjpo/our_inventory_is_accurate_on_paper_and_wrong_on/ – "Our inventory is accurate on paper and wrong on the shelf. Does this ever actually get fixed?"
  - https://www.reddit.com/r/InventoryManagement/comments/1ti7tnj/why_does_inventory_still_break_in_2026/ – "Why does inventory still break in 2026?"
  - https://www.reddit.com/r/smallbusinessUS/comments/1w0lc0j/our_retail_inventory_management_software_and_our/ – "Our retail inventory management software and our actual shelf counts never agree. How do you close that gap without a full recount every week?"
  - https://www.ascm.org/ascm-insights/inventory-discrepancy-inquiries/ – professional-body article
  - https://supplychainintel.com/blog/inventory-management/inventory-accuracy-in-warehouse-operations – guide

### 3.8 Failed ERP
- Suggest (exact): "failed erp implementation"; "failed erp implementation examples"; "failed erp implementation case studies"; "failed erp implementation hershey"; "nike failed erp implementation"; "revlon failed erp implementation"; "failed sap implementation"; "unsuccessful erp implementation"; "erp implementation failure rate"; "erp implementation failure statistics"; "erp implementation failure reasons"; "why erp fails"; "causes of erp failure". "erp project failed what to do" returned nothing.
- Answering pages / forums:
  - https://econixinfotech.com/erp-rescue-guide – "ERP Rescue & Recovery: The Complete Guide" (service guide)
  - https://swedishtechnology.com/knowledge/business-it/failed-erp-implementation-rescue/ – service page
  - https://www.panorama-consulting.com/how-to-recover-from-a-big-bang-erp-failure/ – consultancy article
  - https://www.reddit.com/r/ERP/comments/1r7dnim/erp_went_live_a_year_ago_now_what/ – "ERP went live a year ago. Now what?"
  - https://www.reddit.com/r/Accounting/comments/14sewdt/erp_implementation_two_year_post_mortem_audit/ – "ERP Implementation: Two Year Post Mortem Audit"
- INFERENCE: most suggested queries are research/case-study style (Hershey, Nike, Revlon, rate, statistics), not "rescue" style. Rescue-intent pages exist but the phrase "what to do" has no suggestion.

### 3.9 Cross-scenario read (INFERENCE)
- Full-sentence pain phrases ("our systems don't talk to each other", "want to use ai but don't know where to start", "inventory doesn't match") returned no autocomplete. Short phrases do: "traffic but no leads", "where to start with ai", "stock mismatch", "failed erp implementation".
- Six of eight scenarios (3.3 to 3.8) have a forum thread in the user's own words; I found none for 3.1 and 3.2. Use those titles as scan example prompts.
- Tool-shaped queries exist for AI ("ai readiness checker/score/assessment tool") and nowhere else I could see.

---------------------------------------------------------------------

## 4. Conversion evidence

Tier guide: T1 peer-reviewed / controlled; T2 large published dataset; T3 named A/B test published by an optimisation firm or company; T4 vendor case study / benchmark. None of the lead-gen sources below is T1. Most are single-site tests with no sample size or significance given.

### 4a. Interactive / quiz / multi-step vs static form

1. **Conversion Sciences – form vs quiz A/B test (T3).** https://conversionsciences.com/ab-test-form-versus-quiz/ (dated 2023-07-20)
   - Measured: single "pancake" form vs multi-step quiz-style form on a lead-gen page.
   - Result as stated: "increased completion rates by 61%"; "61% more quote requests".
   - Sample, duration, site, significance: not stated. Written by the firm that ran the test. They say "we don’t expect this type of approach to work for all websites" and "we have found little correlation between the number of steps and completion rates". They add that questions about the visitor’s problem help, questions that collect data for the company less so (their view, not shown by data).

2. **Conversion Rate Experts – Seamwork quiz as hero (T3).** https://conversion-rate-experts.com/seamwork-quiz-win-report/
   - Measured: homepage hero replaced by a 5-question quiz (control led with membership benefits).
   - Result as stated: "an increase of 34% in memberships (and a 56% increase in overall revenue per visitor via memberships and pattern sales)".
   - Sample, duration, significance: not stated. One client (a sewing-pattern membership site). The quiz gave "tailored sewing advice in return for a name and email address". Date not stated. Closest to ALTER PEDRO's "interactive thing as the hero" design, but B2C and different offer.

3. **Conversion Fanatics – multi-step vs single-step (T3).** https://conversionfanatics.com/multi-step-or-single-step-forms/ (2015-07-27)
   - Measured: control vs new multi-step vs new single-step longer form.
   - Result as stated: multi-step +52.9% over control; single-step +40.3% over control; "just over 1100 visits per variation"; +151 leads vs +91 leads; client lead scoring showed quality not affected.
   - Both new versions beat control. No significance test shown. They note "past tests" where multi-step "can reduce conversions". Evidence that multi-step is not a guaranteed win.

4. **MarketingSherpa / MECLABS live test (T3, with disclosed validity threats).** https://marketingsherpa.com/article/case-study/how-one-additional-form-field (2013-10-23)
   - Measured: control (single offer, short form) 58% vs choice of offer + short form 57% vs choice of offer + longer form (one extra field, job title) 51%.
   - Result as stated: the longer-form version showed "-11.9% relative difference from the control with a 99% level of confidence". ~300,000 email recipients across lists. The authors list two validity threats (priming, history effect).
   - Shows: one extra field cost about 12% relative, even in a short form.

5. **Typeform customer stories (T4, vendor-published, client-reported).**
   - Clay: https://www.typeform.com/blog/clay-boosts-form-completion-rates-by-70-with-typeform (2026-08-25). Replaced a "5-6 field" form with one question (LinkedIn URL). "Improved form completion rates by 60–70%". No sample, no duration.
   - Double Denim Marketing: https://www.typeform.com/blog/how-double-denim-marketing-increased-leads-typeform. Client conversion "7.75% … to 19.35%" and "11.2% to 21.6%", "50% increase in leads with Typeform vs. regular static forms". "I ran some split tests" – data not shown.
   - SmartBug Media: https://webflow-prod.typeform.com/blog/smartbug-increased-sales-leads-40-percent-typeform. "40% increase in form completions"; the source itself says "40% quarter-on-quarter or year-on-year lift", so it is not a controlled A/B test.

Weak or not relied on:
- Formstack 2015 report via Demand Gen Report, https://www.demandgenreport.com/industry-news/study-online-forms-with-incentives-increase-conversion-rates/23115/: data from "roughly 650,000 Formstack users"; multi-page forms "approximately 14% conversion rates compared to single page forms (5%)". Observational, not a test; form type and audience are confounded. Old (2015).
- Outgrow benchmark, https://outgrow.co/blog/interactive-forms-lead-generation-2025/: "47.3%" interactive vs "2.8%" traditional, "16.9x". Vendor selling the tool; comparison is before/after on the same accounts, not concurrent; case-study company names "have been modified"; includes a quoted "CMO" I could not verify. Not relied on.

**Net read (INFERENCE):** all usable sources point the same way (quiz/multi-step ≥ static), but all are single-site, mostly self-reported, none gives sample size and significance. Conflict: Conversion Fanatics notes multi-step sometimes loses; MarketingSherpa shows extra fields cost conversions; Clay's own result is that fewer fields won. None tests a free-text AI conversation with a written result. So there is no direct evidence for ALTER PEDRO's specific design.

### 4b. Gating content behind email vs not

1. **Blue Triangle via Content Marketing Institute (T3-, single company, self-reported).** https://contentmarketinginstitute.com/content-marketing-strategy/cmo-ungated-everything (2026-03-04)
   - Gated e-book: "$15,000" spend, "3,400 visits", "106" form fills, "$142" per lead, "Half of those emails were bad" so "$284" net.
   - Ungated test of same e-book: "$2,000" over 2.5 weeks; "175 people engaged" ("61% more" than gated); "$11.44" per engagement.
   - After a year of ungating everything: "265% increase in demo requests, 242% pipeline growth, and a 41-time increase in marketing-sourced revenue"; pages per visit "from 1.2 to eight".
   - Caveats: not a randomized test; the first comparison counts "engagement" vs "form fills" (different things); a year of other changes (ABM, tooling) is included. An optional "Want this emailed to you?" CTA produced "122 leads in a couple of months".

2. **Dynamic Yield 144-day A/B test (T3; I could not open the page).** https://www.dynamicyield.com/article/gated-content-debate-deflated/
   - The page returned "Access Denied" to my fetchers (also in a headless browser). The figures below come from a search-tool summary of that page and are **not verified by me**: 50/50 split; ungating case studies +62% downloads; guides +15% downloads; visitors who submitted the form for gated case studies later generated 13% more demo requests; DY ungated case studies, kept guides gated.
   - If accurate, this is the only controlled gated-vs-ungated result I found, and it shows a trade-off (more consumption vs better-qualified form-fillers).

3. **HubSpot test of partial gating (T3, 2017, blog republished).** http://www.marketinghub.today/what-happens-when-you-make-gated-content-free/ (reprints blog.hubspot.com, author Lindsay Kolowich)
   - Measured: offers moved from gated PDFs to HTML pages with a scroll-triggered form for the rest of the content.
   - Result as stated: organic traffic and ranking rose only for pages that already had search authority; "We failed to optimize these pages for conversion to the point where they even came close to matching – much less surpassing – the net conversions of the original landing pages."
   - Conflicts with source 1: here, gating at some level won on conversion volume.

4. **MarketingSherpa live test (see 4a.4)** – form friction effect, same URL.

Searched, not used: a Journal of Marketing 2024 paper on email opt-in cues (https://journals.sagepub.com/doi/10.1177/00222429241288456). It is about permission-email requests, not content gating; I could not load the page.
A claim in one search summary that HubSpot ungated "33 guides" and got +36% traffic could not be traced to any source I opened. I did not use it.

**Net read (INFERENCE):** evidence is mixed. Ungating raises consumption (Blue Triangle, Dynamic Yield). Gating (or partial gating) can give fewer but better-qualified or higher-volume leads (Dynamic Yield 13% more demo requests from form-fillers; HubSpot partial gate lost on conversions). Almost all are about PDFs/e-books and case studies, not an AI-generated personalised result. No source covers that case.

---------------------------------------------------------------------

## 5. What this changes in our plan

1. **Put the problem box in the hero, above the fold, as a text input with example chips and a "no signup" line.** Factory Nexus does this (textarea, five example chips, "No signup required — try it right now", section 1.1). Clay's equivalent ("What do you want to build?") is buried at y≈2484 and Vu Quote AI's input starts at y≈809 (section 1.1). Our hero can be the only one of the set where the visitor starts typing in the first screen. (INFERENCE)
2. **Seed the example chips with the exact phrases people use.** "website traffic but no leads", "failed erp implementation", "stock mismatch", "where to start with ai", "systems that don't talk to each other" (section 3). Use full-sentence forum titles as the longer examples ("Our inventory is accurate on paper and wrong on the shelf", section 3.7). Do not rely on "old software" (consumer-download intent, section 3.5).
3. **Ask about the problem first and ask for contact last; log drop-off per step.** Conversion Sciences credits the lift to problem-first questions; MarketingSherpa measured about -12% relative from one extra field (section 4a.1, 4a.4). Seven problem questions are supported by the quiz tests; a long contact block is not.
4. **Keep the contact ask to one or two fields.** Clay cut a 5–6 field form to one question and reports +60–70% completion (section 4a.5, vendor-reported). Clay's trick (enrich from a LinkedIn URL) may not fit our buyers; ask for email or WhatsApp instead (Vu offers "MESSAGE US ON WHATSAPP", section 1.1). (INFERENCE)
5. **Show the 5-part summary before asking for an email, and offer "email me this" as optional.** Blue Triangle's optional "Want this emailed to you?" gave 122 valid leads (section 4b.1). But Dynamic Yield (if accurate) and HubSpot's partial-gate test show gating can produce more qualified or more leads (section 4b.2–3). Plan an in-house A/B (open vs email-gated summary) from launch; do not assume the answer. Primary metric: calls booked and Sprints sold, not email count.
6. **Hold a performance budget and keep the hero free of autoplay video.** Clay's home measured LCP 8.6 s and 26.3 MiB; thoughtbot 12.6 MiB; Vu CLS 0.55; Factory Nexus 0.8 MiB and LCP 2.1 s (section 2). The best-performing page in the set is also the one with the intake in the hero. Reserve the box's space so layout does not shift (Vu's CLS). Re-test on a real phone profile; these are lab numbers from a datacentre box.
7. **Build mobile first for the scan.** Vu Quote AI tells mobile users "Best experienced on desktop" (section 1.1). A scan that works on a phone is a gap against the one close competitor with an AI intake. (INFERENCE)
8. **Case studies: copy Simform's skeleton, filter like Clay, say it as a problem.** Outcome headline with a real number, three stat tiles, Challenge → Solution → Impact (Simform), an "At a glance" block (Clay), Before/After (Finsweet), and index filters by problem type, using the eight scenarios as filters (section 1.3). Only publish numbers we can source; Vu mixes illustrative mockup figures with real work, which is the thing to avoid.

---------------------------------------------------------------------

## 6. Gaps (not done or not possible)

- No search-volume data, no Google "People Also Ask", no live Google rankings (section 0).
- No PSI/CrUX field data (section 2). quote.vu.co.uk not Lighthouse-tested.
- Did not submit or use any intake tool (Clay prompt, Vu Quote AI, Factory Nexus), so no data on what the result looks like.
- Dynamic Yield page blocked; its figures are second-hand (section 4b.2).
- No source found that tests an AI-led conversation followed by a written result against a form.
- Simform's HQ country not verified. Wednesday's Pune HQ comes from a LinkedIn snippet returned by search, not from its own site.
