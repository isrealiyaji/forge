import Image from "next/image";
import { Check } from "lucide-react";
import SealBadge from "@/components/ui/SealBadge";
import ThemeToggle from "@/components/ui/ThemeToggle";

const programs = [
  {
    tag: "MAIN EVENT",
    name: "Strength & Conditioning",
    desc: "Coach-led small group programming, four days a week — the backbone of every membership.",
  },
  {
    tag: "CO-MAIN",
    name: "Evening HIIT",
    desc: "45 minutes, six nights a week. Capacity 16, booked through the app, waitlist when it's full.",
  },
  {
    tag: "UNDERCARD",
    name: "Mobility Flow",
    desc: "Early mornings, low impact, built to keep you training the other six days.",
  },
  {
    tag: "UNDERCARD",
    name: "Nutrition Coaching",
    desc: "Your coach proposes a plan, our head coach signs off, you get a plan that's actually reviewed.",
  },
];

const facility = [
  {
    src: "/images/equipment-weights.jpg",
    tag: "Free Weights",
    desc: "Dumbbells 5–100lb, Olympic barbells, bumper plates.",
  },
  {
    src: "/images/equipment-floor.jpg",
    tag: "The Floor",
    desc: "Open warehouse space, turf lane, no waiting on a rack.",
  },
  {
    src: "/images/equipment-strength.jpg",
    tag: "Strength Rigs",
    desc: "Pull-up stations, squat racks, built for real load.",
  },
];

const coaches = [
  { name: "Delali Mensah", specialty: "Strength & Conditioning", years: "9 yrs coaching" },
  { name: "Tunde Bakare", specialty: "HIIT & Mobility", years: "6 yrs coaching" },
  { name: "Chiamaka Eze", specialty: "Nutrition & Recovery", years: "7 yrs coaching" },
];

const tiers = [
  {
    name: "Standard",
    cadence: "Monthly",
    features: ["Full class schedule access", "Assigned coach", "Attendance streak tracking"],
    featured: false,
  },
  {
    name: "Performance",
    cadence: "Monthly",
    features: ["Everything in Standard", "Nutrition plan coaching", "Priority class booking"],
    featured: true,
  },
  {
    name: "Performance",
    cadence: "Annual",
    features: ["Everything in Performance Monthly", "Two months on us", "Locked-in rate"],
    featured: false,
  },
];

const LandingPage = () => {
  return (
    <main className="bg-ground">
      {/* Masthead */}
      <header className="flex items-center justify-between border-b border-line-dark px-6 py-5 md:px-12">
        <p className="font-display text-xl tracking-poster text-ink-inverse">FORGE</p>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-inverse md:flex">
          <a href="#card" className="hover:text-ink-inverse">
            The Card
          </a>
          <a href="#gym" className="hover:text-ink-inverse">
            The Gym
          </a>
          <a href="#corner" className="hover:text-ink-inverse">
            Coaches
          </a>
          <a href="#membership" className="hover:text-ink-inverse">
            Membership
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href="/member"
            className="rounded-sm border border-ink-inverse/30 px-4 py-2 text-sm font-semibold text-ink-inverse transition-colors hover:border-ink-inverse"
          >
            Member Login
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden px-6 py-16 md:px-12">
        <Image
          src="/images/hero-gym.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(5,4,3,0.92) 0%, rgba(5,4,3,0.82) 32%, rgba(5,4,3,0.45) 62%, rgba(5,4,3,0.55) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="bg-noise absolute inset-0 opacity-30" aria-hidden="true" />

        <div
          className="absolute -right-16 top-10 hidden rotate-[18deg] bg-accent px-16 py-2 text-center text-xs font-bold uppercase tracking-wide text-accent-ink shadow-[0_12px_24px_-8px_rgba(0,0,0,0.6)] md:block"
          aria-hidden="true"
        >
          Now Enrolling
        </div>

        <div className="relative max-w-3xl animate-[fade-in_0.6s_ease-out]">
          <h1 className="font-display text-[15vw] leading-[0.92] tracking-tightest text-[#f3ecdd] md:text-8xl">
            Train where
            <br />
            results are <span className="text-accent">earned.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[#d9cfbd]">
            Forge Athletic Club is a single, coach-led gym — one roster, one standard, real people
            tracking your progress every session.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#membership"
              className="rounded-sm bg-accent px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-accent-ink transition-transform hover:-translate-y-0.5"
            >
              Apply for Membership
            </a>
            <a
              href="/member"
              className="rounded-sm border border-[#f3ecdd]/30 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#f3ecdd] transition-colors hover:border-[#f3ecdd]"
            >
              Member Login
            </a>
          </div>
        </div>
      </section>

      {/* The Card */}
      <section id="card" className="border-t border-line-dark px-6 py-20 md:px-12">
        <h2 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">The Card</h2>
        <div className="mt-10 divide-y divide-line-dark border-y border-line-dark">
          {programs.map((program) => (
            <div key={program.name} className="flex flex-col gap-2 py-6 md:flex-row md:items-baseline md:gap-8">
              <span className="w-32 shrink-0 text-xs font-bold uppercase tracking-wide text-gold">
                {program.tag}
              </span>
              <h3 className="font-display text-2xl tracking-poster text-ink-inverse md:w-80 md:shrink-0">
                {program.name}
              </h3>
              <p className="text-muted-inverse">{program.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inside The Gym */}
      <section id="gym" className="border-t border-line-dark px-6 py-20 md:px-12">
        <h2 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Inside The Gym</h2>
        <p className="mt-3 max-w-xl text-muted-inverse">
          No frills, no fluff — just the floor, the racks, and the room to work.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {facility.map((shot) => (
            <figure key={shot.tag} className="group">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={shot.src}
                  alt={shot.desc}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gold">{shot.tag}</p>
                <p className="mt-1 text-sm text-muted-inverse">{shot.desc}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Your Corner */}
      <section id="corner" className="border-t border-line-dark px-6 py-20 md:px-12">
        <h2 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Your Corner</h2>
        <p className="mt-3 max-w-xl text-muted-inverse">
          Every member is assigned a coach — not a rotating cast. Here&apos;s who&apos;s in the room.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {coaches.map((coach) => (
            <div key={coach.name} className="flex items-start gap-4 border-t-2 border-gold pt-5">
              <SealBadge label={coach.name.split(" ")[0][0] + coach.name.split(" ")[1][0]} sublabel="Coach" />
              <div>
                <p className="font-display text-xl tracking-poster text-ink-inverse">{coach.name}</p>
                <p className="mt-1 text-sm font-semibold text-accent">{coach.specialty}</p>
                <p className="mt-1 text-sm text-muted-inverse">{coach.years}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Membership */}
      <section id="membership" className="border-t border-line-dark px-6 py-20 md:px-12">
        <h2 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Membership</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={`${tier.name}-${tier.cadence}`}
              className={`bg-panel p-7 text-ink ${tier.featured ? "ring-2 ring-gold" : ""}`}
            >
              {tier.featured ? (
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gold">Most Popular</p>
              ) : (
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-muted">&nbsp;</p>
              )}
              <p className="font-display text-3xl tracking-poster">{tier.name}</p>
              <p className="mt-1 text-sm font-semibold text-muted">{tier.cadence}</p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="mt-7 block rounded-sm bg-ink py-3 text-center text-sm font-bold uppercase tracking-wide text-panel transition-opacity hover:opacity-80"
              >
                Apply Now
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line-dark px-6 py-10 md:px-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-display text-lg tracking-poster text-ink-inverse">FORGE ATHLETIC CLUB</p>
            <p className="mt-1 text-sm text-muted-inverse">
              1 Cardio Lane · Open Mon–Sat, 6:00 AM – 9:00 PM
            </p>
          </div>
          <a href="/member" className="text-sm font-semibold text-muted-inverse hover:text-ink-inverse">
            Member Login →
          </a>
        </div>
        <p className="mt-8 text-xs text-muted-inverse/60">© 2026 Forge Athletic Club. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default LandingPage;
