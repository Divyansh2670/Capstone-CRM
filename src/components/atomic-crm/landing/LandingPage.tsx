import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Gauge,
  Handshake,
  Layers2,
  Mail,
  Moon,
  NotebookText,
  ShieldCheck,
  Sparkles,
  Sun,
  Tags,
  Users,
  Workflow,
} from "lucide-react";
import {
  useEffect,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import screenshot625 from "@/assets/Screenshot (625).png";
import screenshot626 from "@/assets/Screenshot (626).png";
import screenshot627 from "@/assets/Screenshot (627).png";
import screenshot628 from "@/assets/Screenshot (628).png";
import screenshot638 from "@/assets/Screenshot (638).png";
import screenshot639 from "@/assets/Screenshot (639).png";
import screenshot640 from "@/assets/Screenshot (640).png";
import screenshot641 from "@/assets/Screenshot (641).png";
import screenshot642 from "@/assets/Screenshot (642).png";
import screenshot643 from "@/assets/Screenshot (643).png";

type FeatureCard = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const featureCards: FeatureCard[] = [
  {
    title: "Contact and Company Management",
    description:
      "Centralized profiles, structured fields, imports, exports, and relationships between people and organizations.",
    icon: Users,
  },
  {
    title: "Deal Pipeline and Kanban",
    description:
      "Visual pipeline stages, drag-and-drop flow, stage tracking, and momentum-focused opportunity management.",
    icon: Workflow,
  },
  {
    title: "Task and Calendar Workflow",
    description:
      "Assign follow-ups, organize priorities, track ownership, and keep the entire team aligned on due dates.",
    icon: CalendarCheck2,
  },
  {
    title: "Notes and Activity Logging",
    description:
      "Capture customer context and interactions so every teammate can move conversations forward with confidence.",
    icon: NotebookText,
  },
  {
    title: "Tagging and Smart Filtering",
    description:
      "Segment records quickly with tags and operator-based filters to create precise, reusable views.",
    icon: Tags,
  },
  {
    title: "Analytics and Dashboard Insights",
    description:
      "Track sales velocity, deal progression, and workload trends with practical dashboard widgets.",
    icon: BarChart3,
  },
];

const productModules = [
  { label: "Deals", icon: Handshake },
  { label: "Contacts", icon: Users },
  { label: "Companies", icon: Building2 },
  { label: "Tasks", icon: CalendarCheck2 },
  { label: "Notes", icon: NotebookText },
  { label: "Tags", icon: Tags },
  { label: "Sales Team", icon: Layers2 },
  { label: "Settings", icon: ShieldCheck },
];

const highlights = [
  "Supabase-backed real API with auth, storage, and edge functions",
  "FakeRest demo mode for quick previews and onboarding",
  "Type-safe React + TypeScript architecture ready for customization",
  "Responsive, component-driven UI built with shadcn patterns",
];

const galleryShots = [
  {
    src: screenshot625,
    alt: "CRM dashboard view",
    caption: "Performance-focused dashboard with actionable pipeline metrics.",
  },
  {
    src: screenshot626,
    alt: "CRM deals kanban board",
    caption:
      "Drag-and-drop deals pipeline for fast stage progression and visibility.",
  },
  {
    src: screenshot627,
    alt: "CRM contacts management",
    caption:
      "Contact and company records with searchable context and relationship history.",
  },
  {
    src: screenshot628,
    alt: "CRM tasks and notes workspace",
    caption:
      "Task ownership, note tracking, and team collaboration in one workflow.",
  },
];

const detailedFeatures = [
  {
    title: "Customer Data Command Center",
    description:
      "Manage contacts and companies with structured profiles, custom fields, tag segmentation, and CSV-based onboarding so teams can consolidate fragmented customer data into one trusted source.",
  },
  {
    title: "Deal Lifecycle and Pipeline Control",
    description:
      "Move opportunities through configurable stages, monitor conversion momentum, and prioritize high-value deals with a visual Kanban workflow that keeps every stakeholder aligned.",
  },
  {
    title: "Execution Layer for Sales Teams",
    description:
      "Coordinate tasks, ownership, and due dates across reps, while preserving complete activity history and notes so every follow-up is informed, timely, and consistent.",
  },
  {
    title: "Operational Intelligence and Reporting",
    description:
      "Use dashboard widgets and aggregated summaries to track pipeline health, individual performance, and workload trends, enabling data-informed decisions without leaving the CRM.",
  },
  {
    title: "Secure Architecture and Extensibility",
    description:
      "Built on Supabase with authentication, storage, edge functions, and migration support, plus a FakeRest demo mode for previews and rapid iteration during implementation.",
  },
  {
    title: "Customization-Ready UI System",
    description:
      "React + TypeScript foundation with reusable components, configuration-driven modules, and responsive shadcn-based design that allows teams to tailor the CRM to domain-specific processes.",
  },
];

const imsGalleryShots = [
  {
    src: screenshot638,
    alt: "IMS analytics dashboard",
    caption: "Inventory performance dashboard with live KPI visibility.",
  },
  {
    src: screenshot639,
    alt: "IMS product tracking",
    caption:
      "Centralized product tracking for stock movement and item-level control.",
  },
  {
    src: screenshot640,
    alt: "IMS alerts and notifications",
    caption: "Smart low-stock and expiry alerts for proactive operations.",
  },
  {
    src: screenshot641,
    alt: "IMS upload and data entry",
    caption: "Drag-and-drop imports for faster onboarding of inventory data.",
  },
  {
    src: screenshot642,
    alt: "IMS predictions",
    caption:
      "AI-driven predictions that improve with historical usage patterns.",
  },
  {
    src: screenshot643,
    alt: "IMS charts and reports",
    caption: "Rich charts and visual reports for confident planning decisions.",
  },
];

const imsFunFeatures = [
  "AI predictions that learn continuously from your data and demand behavior.",
  "Interactive dashboard with real-time updates across stock and movement trends.",
  "Smart alerts for low stock levels and expiring inventory before issues escalate.",
  "Beautiful visualizations with practical charts and graphs for operations review.",
  "Drag-and-drop file uploads for quick catalog and transaction onboarding.",
  "Professional toast notifications that keep teams informed instantly.",
];

export const LandingPage = () => {
  const [isDark, setIsDark] = useState(false);

  const revealDelay = (index: number): React.CSSProperties => ({
    ["--reveal-delay" as any]: `${Math.min(index * 70, 420)}ms`,
  });

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("landing-theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      return;
    }
    if (savedTheme === "light") {
      setIsDark(false);
      return;
    }
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("landing-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!revealElements.length) {
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  return (
    <main className={`landing-shell${isDark ? " landing-shell-dark" : ""}`}>
      <div className="landing-bg-orb landing-bg-orb-one" />
      <div className="landing-bg-orb landing-bg-orb-two" />

      <header className="landing-nav" data-reveal>
        <div className="landing-brand">
          <Sparkles className="landing-brand-icon" />
          <span>ClientCraft CRM</span>
        </div>
        <div className="landing-nav-actions">
          <button
            type="button"
            className="landing-theme-toggle"
            aria-label="Toggle dark mode"
            aria-pressed={isDark}
            onClick={() => setIsDark((value) => !value)}
          >
            {isDark ? (
              <Sun className="landing-inline-icon" />
            ) : (
              <Moon className="landing-inline-icon" />
            )}
            {isDark ? "Light" : "Dark"}
          </button>

          <a className="landing-nav-cta" href="/login">
            Open CRM
            <ArrowRight className="landing-inline-icon" />
          </a>
        </div>
      </header>

      <section className="landing-hero" data-reveal>
        <p className="landing-kicker">Sales Platform</p>
        <h1>Run your entire customer lifecycle from one modern CRM hub.</h1>
        <p className="landing-subtitle">
          ClientCraft combines contact intelligence, deal orchestration, team
          coordination, and operational automation into a single focused
          workspace.
        </p>

        <div className="landing-actions">
          <a className="landing-button landing-button-primary" href="/login">
            Launch Application
            <ArrowRight className="landing-inline-icon" />
          </a>
          <a
            className="landing-button landing-button-secondary"
            href="#features"
          >
            Explore Features
          </a>
        </div>

        <div className="landing-trust-row">
          <span>
            <Gauge className="landing-inline-icon" />
            Real-time pipeline visibility
          </span>
          <span>
            <Mail className="landing-inline-icon" />
            Email capture workflow ready
          </span>
          <span>
            <CheckCircle2 className="landing-inline-icon" />
            Production and demo environments
          </span>
        </div>
      </section>

      <section id="features" className="landing-section" data-reveal>
        <div className="landing-section-head">
          <h2>Everything your CRM needs, already integrated</h2>
          <p>
            Designed for daily execution with scalable architecture under the
            hood.
          </p>
        </div>

        <div className="landing-feature-grid">
          {featureCards.map(({ title, description, icon: Icon }, index) => (
            <article
              key={title}
              className="landing-card"
              data-reveal
              style={revealDelay(index)}
            >
              <div className="landing-card-icon-wrap">
                <Icon className="landing-card-icon" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" data-reveal>
        <div className="landing-section-head">
          <h2>See the CRM in action</h2>
          <p>
            Real screens from your project assets showing dashboard, pipeline,
            contacts, and execution workflows.
          </p>
        </div>
        <div className="landing-gallery-grid">
          {galleryShots.map((shot, index) => (
            <figure
              key={shot.alt}
              className="landing-gallery-card"
              data-reveal
              style={revealDelay(index)}
            >
              <img src={shot.src} alt={shot.alt} loading="lazy" />
              <figcaption>{shot.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section-detail" data-reveal>
        <div className="landing-section-head">
          <h2>Detailed CRM capabilities</h2>
          <p>
            A closer look at how each major function supports your sales and
            account operations.
          </p>
        </div>

        <div className="landing-detail-grid">
          {detailedFeatures.map((feature, index) => (
            <article
              key={feature.title}
              className="landing-detail-card"
              data-reveal
              style={revealDelay(index)}
            >
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-ims-section" data-reveal>
        <div className="landing-section-head">
          <h2>Smart Inventory Management System (IMS) for growth</h2>
          <p>
            Alongside CRM operations, this companion IMS experience extends your
            platform with inventory intelligence that helps teams scale without
            losing control of stock, replenishment, and demand planning.
          </p>
        </div>

        <div className="landing-ims-grid">
          <article className="landing-ims-card" data-reveal>
            <h3>IMS fun features</h3>
            <ul className="landing-ims-list">
              {imsFunFeatures.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 className="landing-inline-icon" />
                  {feature}
                </li>
              ))}
            </ul>
          </article>

          <article
            className="landing-ims-card"
            data-reveal
            style={revealDelay(1)}
          >
            <h3>Business impact</h3>
            <p>
              The IMS helps reduce stockouts, prevent inventory waste, and
              improve planning accuracy. When combined with CRM pipeline and
              customer context, teams can forecast demand earlier, align supply
              with opportunity volume, and support consistent business growth.
            </p>
          </article>
        </div>

        <div className="landing-ims-gallery-grid">
          {imsGalleryShots.map((shot, index) => (
            <figure
              key={shot.alt}
              className="landing-gallery-card"
              data-reveal
              style={revealDelay(index)}
            >
              <img src={shot.src} alt={shot.alt} loading="lazy" />
              <figcaption>{shot.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section-alt" data-reveal>
        <div className="landing-section-head">
          <h2>Core modules included</h2>
          <p>
            Move from lead creation to deal closure with complete team context.
          </p>
        </div>
        <div className="landing-module-grid">
          {productModules.map(({ label, icon: Icon }, index) => (
            <div
              key={label}
              className="landing-module-pill"
              data-reveal
              style={revealDelay(index)}
            >
              <Icon className="landing-inline-icon" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" data-reveal>
        <div className="landing-checklist-wrap" data-reveal>
          <h2>Built for customization and real workflows</h2>
          <ul className="landing-checklist">
            {highlights.map((item, index) => (
              <li key={item} data-reveal style={revealDelay(index)}>
                <CheckCircle2 className="landing-inline-icon" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="landing-cta-panel" data-reveal>
        <h2>Start using ClientCraft today</h2>
        <p>
          Open the app and configure your sales process, fields, stages, and
          branding.
        </p>
        <a className="landing-button landing-button-primary" href="/login">
          Enter CRM Workspace
          <ArrowRight className="landing-inline-icon" />
        </a>
      </section>

      <footer className="landing-footer" data-reveal>
        <div className="landing-footer-top">
          <div>
            <div className="landing-brand">
              <Sparkles className="landing-brand-icon" />
              <span>ClientCraft CRM</span>
            </div>
            <p className="landing-footer-copy">
              Modern CRM built for contact intelligence, deal execution, and
              collaborative sales operations.
            </p>
          </div>

          <div className="landing-footer-columns">
            <div className="landing-footer-column">
              <h3>Product</h3>
              <a href="#features">Features</a>
              <a href="/login">Login</a>
            </div>

            <div className="landing-footer-column">
              <h3>Modules</h3>
              <a href="/contacts">Contacts</a>
              <a href="/deals">Deals</a>
              <a href="/companies">Companies</a>
            </div>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>Copyright 2026 ClientCraft CRM</span>
          <a href="/login">Go to App</a>
        </div>
      </footer>
    </main>
  );
};
