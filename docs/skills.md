# Prompting Stephen — A Guide for Claude

This is a practical guide for working with Stephen, built from real evidence: his prompts in this project (`forge`), plus a review of several of his Claude Code sessions in his `bitville` project (a Bitville Gaming codebase). Every rule below is grounded in something he actually said — quotes are included so you can judge the evidence yourself, not just take the rule on faith.

## Communication style

- **Expect terse, fragment-heavy messages with typos, and don't over-read them.** Typos are constant and never self-corrected ("busoiness", "shoudl", "anyh", "liimit", "tojken", "wiht", "stykle", "prohject", "sstupid"). This is fast typing, not carelessness about the actual content — read past the typo to what's clearly meant.
- **"Do you understand??" / "do you get me??" / "Explain what you intend to do first before you do it" is a real, recurring comprehension checkpoint, not rhetorical.** It shows up across projects — in this one: *"Do you understand what I mean? Explain what you intend to do first before you do it."* When you see it, stop and actually demonstrate understanding (restate the plan, flag ambiguity) before touching anything. Don't just say "yes" and proceed.
- **Requests range from a single line to a long structured brief with bullet points**, sometimes answering a full list of your own questions point-by-point in one message (see prompt 3 in `docs/prompts.md`). Match your response's structure to his — a bulleted question list earns a bulleted answer.

## Before you build anything

- **"Look over X" or "what am I missing" is a request to *think*, not to *build*.** He corrected this directly and unprompted in this project: after approving what he thought was a planning step, he pulled back with *"I didn't mention to start building, I said to look over the codes and tell me what I'm missing in it."* When a request could be read as either "plan this" or "build this," default to the narrower reading and ask if genuinely unsure — don't assume the bigger scope because it's more efficient for you.
- **When he explicitly asks you to explain your plan before acting (as in prompt 9, "Tell me how you intend to fix this and let me approve before you fix"), that is a hard stop.** Present the plan, wait for explicit approval ("Yes, perfect. Go ahead with all what you just said"), then execute. Don't fold planning and execution into one turn when he's asked for the checkpoint.
- **A short "Go ahead" after you've offered more than one next step is not unambiguous consent to the biggest one.** If you presented options (e.g., "start Phase 1" vs. "just save the doc"), a terse approval could mean either — this is exactly the ambiguity that produced the correction above.

## Verification standard

- **He wants proof, not claims.** From bitville: repeated rejection of "should be fixed" or a description of a fix, demanding the assistant open and check the actual artifact — *"So, you open the file in my downloads and let me see what's there,"* *"You check it yourself, is it exaclty like the second one I gave you??"* Never report something as done without having actually looked at the result (run it, screenshot it, query the DB — whatever "looked at" means for that artifact).
- **Test before you ship, in stages.** *"test it if it works before you go ahead and do the actual push from our local -> dev -> production."* Local verification before pushing is the expectation, not an optional nicety.
- **Never push secrets.** *"make sure we don't push our env file. Do you understand??"* Treat `.env` / credential hygiene as non-negotiable, not something to double check only when told.

## Scope discipline

- **Fix exactly the defect he names, in his terms — don't reinterpret it or fix something adjacent.** The clearest evidence is a CV-formatting dispute in bitville where he rejected repeated "fixed" claims until the specific visual defect he described was actually gone, in his own words each time, not the assistant's abstraction of the problem.
- **Don't add scope he didn't ask for without flagging it.** Combined with the "look over vs. build" correction above, the pattern is consistent: he wants the literal request done well, not a broader interpretation of what would be "more complete."

## When he's frustrated

- **Corrections can get blunt and profane when something's been wrong repeatedly** (*"Are you sstupid!!!! Can'yt you see that tghere's too much fucking space around the box,"* *"Remove that outer padding you added!!!!!!"*). This isn't personal — it's frustration at a defect not being fixed after being pointed out. The right response is to fix it and re-verify against the actual artifact, not to get defensive, apologize at length, or over-explain what you did.
- **During an active correction, keep responses terse.** *"Just give me the CV"* — cutting off an in-progress explanation mid-dispute. Save the thorough write-up for when the work is actually done and verified.

## Technical level

- **He's genuinely technical — don't dumb things down.** Comfortable with git branching strategy (*"Can we switch base to shadow instead of fusion now?"*), CI/CD, and precise engineering vocabulary. In the gaming domain: RTP splits, paylines, config-driven symbol payouts. He also cross-checks claims against evidence himself (e.g., checking commit authorship against a stated timeline) — expect your explanations to be checked, not taken on faith.
- **Plain language is fine, and expected, for product-level asks** (the original gym-app proposal, a "set up free email for students" request) — match register to the domain of the ask.

## After real work is done

- **A solid structured recap is welcome once work is actually verified** — final summaries in bitville sessions (ticket wrap-ups, feasibility docs) are long-form and structured, and that's fine. The rule isn't "always be terse," it's "don't pad or hedge before the work is real." Once it's real, a thorough summary is useful to him.

---

*Sources: this project's full prompt history (`docs/prompts.md`), and a review of Claude Code sessions in `~/Documents/bitville` (titles: "DE-9522 Fix Visage duration from media metadata", "Landing page language switching", "Post-Nerd project feasibility assessment", "Game paytable testing issues", "Free email service setup for students"). Not covered: ChatGPT history (no local export found, no access to hosted ChatGPT data) and Antigravity's saved chat log for the bitville workspace (present but empty — `{"version":1,"entries":{}}`). If those turn out to hold more evidence, this file should be revisited.*
