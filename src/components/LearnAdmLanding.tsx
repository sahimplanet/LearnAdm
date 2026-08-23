import React, { useState } from "react";

interface LearnAdmLandingProps {
  onGetStarted: () => void;
}

export const LearnAdmLanding: React.FC<LearnAdmLandingProps> = ({ onGetStarted }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const explanations = [
    "This is the problem we're starting with — an equation with one unknown, x.",
    "Whatever you do to one side of the equation, you must do to the other. Taking 5 away keeps it balanced.",
    "Dividing both sides by 2 isolates x — now it's alone on one side.",
    "Always check your answer by putting it back into the original problem."
  ];

  const handleNodeClick = (index: number) => {
    setActiveStep(index);
  };

  const scrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("demo");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="learn-adm-root min-h-screen">
      <style>{`
        .learn-adm-root {
          --bg: #EEF3F8;
          --grid-line: rgba(29,43,79,0.07);
          --ink: #1D2B4F;
          --ink-soft: #4B5875;
          --ink-faint: #8291A8;
          --green: #2F9E44;
          --green-soft: #E4F5E8;
          --yellow: #FFD43B;
          --coral: #FF6B6B;
          --card: #FFFFFF;
          --card-border: #D8E1EC;
          --radius: 14px;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          line-height: 1.5;
          background-image:
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .learn-adm-root h1, .learn-adm-root h2, .learn-adm-root h3, .learn-adm-root .display-font {
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: -0.01em;
        }
        .learn-adm-root .mono-font {
          font-family: 'JetBrains Mono', monospace;
        }
        .learn-adm-root .wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
        }
        /* Nav */
        .learn-adm-root nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          max-width: 1120px;
          margin: 0 auto;
        }
        .learn-adm-root .logo {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 20px;
          cursor: pointer;
        }
        .learn-adm-root .logo-mark {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--yellow);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 14px;
        }
        .learn-adm-root .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .learn-adm-root .nav-links a {
          font-size: 14.5px;
          font-weight: 500;
          color: var(--ink-soft);
          text-decoration: none;
          transition: color .15s ease;
        }
        .learn-adm-root .nav-links a:hover {
          color: var(--ink);
        }
        .learn-adm-root .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 9px;
          font-weight: 600;
          font-size: 14.5px;
          cursor: pointer;
          border: none;
          transition: transform .15s ease, box-shadow .15s ease;
          text-decoration: none;
        }
        .learn-adm-root .btn:active {
          transform: translateY(1px);
        }
        .learn-adm-root .btn-primary {
          background: var(--ink);
          color: #fff;
        }
        .learn-adm-root .btn-primary:hover {
          box-shadow: 0 6px 18px rgba(29,43,79,0.28);
        }
        .learn-adm-root .btn-ghost {
          background: transparent;
          color: var(--ink);
          border: 1.5px solid var(--card-border);
        }
        .learn-adm-root .btn-ghost:hover {
          border-color: var(--ink-faint);
        }
        .learn-adm-root .btn-sm {
          padding: 8px 14px;
          font-size: 13.5px;
        }

        /* Hero */
        .learn-adm-root header.hero {
          padding: 64px 24px 20px;
          text-align: center;
        }
        .learn-adm-root .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--green);
          background: var(--green-soft);
          border: 1px solid #c6e9cd;
          padding: 6px 13px;
          border-radius: 99px;
          margin-bottom: 22px;
        }
        .learn-adm-root .hero h1 {
          font-size: 52px;
          font-weight: 700;
          max-width: 780px;
          margin: 0 auto 18px;
          line-height: 1.08;
        }
        .learn-adm-root .hero h1 .hl {
          position: relative;
          white-space: nowrap;
        }
        .learn-adm-root .hero h1 .hl::after {
          content: "";
          position: absolute;
          left: -2px;
          right: -2px;
          bottom: 5px;
          height: 14px;
          background: var(--yellow);
          z-index: -1;
          opacity: .75;
          border-radius: 3px;
        }
        .learn-adm-root .hero p.sub {
          font-size: 18px;
          color: var(--ink-soft);
          max-width: 560px;
          margin: 0 auto 34px;
        }
        .learn-adm-root .hero-ctas {
          display: flex;
          gap: 14px;
          justify-content: center;
          margin-bottom: 14px;
        }
        .learn-adm-root .hero-note {
          font-size: 13px;
          color: var(--ink-faint);
        }

        /* Flow Diagram */
        .learn-adm-root .flow-stage {
          max-width: 980px;
          margin: 56px auto 0;
          padding: 36px 20px 44px;
          position: relative;
        }
        .learn-adm-root .flow-track {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          flex-wrap: wrap;
          position: relative;
        }
        .learn-adm-root .flow-node {
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: 12px;
          padding: 16px 18px;
          width: 190px;
          text-align: left;
          box-shadow: 0 2px 10px rgba(29,43,79,0.05);
          position: relative;
          cursor: pointer;
          transition: border-color .2s, box-shadow .2s, transform .2s;
          flex-shrink: 0;
        }
        .learn-adm-root .flow-node:hover {
          border-color: var(--ink);
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(29,43,79,0.12);
        }
        .learn-adm-root .flow-node.active {
          border-color: var(--green);
          box-shadow: 0 10px 22px rgba(47,158,68,0.18);
        }
        .learn-adm-root .flow-node .step-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--ink-faint);
          letter-spacing: .06em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }
        .learn-adm-root .flow-node.active .step-label {
          color: var(--green);
        }
        .learn-adm-root .flow-node .step-expr {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 4px;
        }
        .learn-adm-root .flow-node .step-desc {
          font-size: 12.5px;
          color: var(--ink-soft);
        }
        .learn-adm-root .flow-node.answer {
          background: var(--ink);
          border-color: var(--ink);
        }
        .learn-adm-root .flow-node.answer .step-label {
          color: var(--yellow);
        }
        .learn-adm-root .flow-node.answer .step-expr,
        .learn-adm-root .flow-node.answer .step-desc {
          color: #fff;
        }

        .learn-adm-root .flow-connector {
          width: 52px;
          height: 2px;
          background: var(--card-border);
          position: relative;
          flex-shrink: 0;
        }
        .learn-adm-root .flow-connector::before {
          content: "";
          position: absolute;
          top: -3px;
          left: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--green);
          animation: travel 2.6s linear infinite;
        }
        .learn-adm-root .flow-connector:nth-child(4)::before {
          animation-delay: 0.6s;
        }
        .learn-adm-root .flow-connector:nth-child(6)::before {
          animation-delay: 1.2s;
        }
        .learn-adm-root .flow-connector:nth-child(8)::before {
          animation-delay: 1.8s;
        }
        @keyframes travel {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 44px; opacity: 0; }
        }
        .learn-adm-root .flow-explain {
          max-width: 600px;
          margin: 26px auto 0;
          text-align: center;
          font-size: 14px;
          color: var(--ink-soft);
          min-height: 20px;
        }
        .learn-adm-root .flow-explain b {
          color: var(--ink);
        }

        /* Trust Row */
        .learn-adm-root .subjects-row {
          padding: 38px 24px;
        }
        .learn-adm-root .subjects-row p {
          text-align: center;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--ink-faint);
          margin-bottom: 22px;
        }
        .learn-adm-root .subjects-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }
        .learn-adm-root .subject-chip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: 99px;
          padding: 8px 16px;
          color: var(--ink-soft);
          cursor: pointer;
          transition: border-color .15s, transform .15s;
        }
        .learn-adm-root .subject-chip:hover {
          border-color: var(--ink);
          transform: translateY(-1px);
        }

        /* Features */
        .learn-adm-root section.features {
          padding: 70px 24px 30px;
        }
        .learn-adm-root .section-head {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 46px;
        }
        .learn-adm-root .section-head .eyebrow-sm {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-faint);
          letter-spacing: .06em;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: block;
        }
        .learn-adm-root .section-head h2 {
          font-size: 32px;
          margin-bottom: 12px;
        }
        .learn-adm-root .section-head p {
          color: var(--ink-soft);
          font-size: 15.5px;
        }
        .learn-adm-root .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .learn-adm-root .feature-card {
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: var(--radius);
          padding: 26px 24px;
        }
        .learn-adm-root .feature-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          font-size: 18px;
        }
        .learn-adm-root .feature-card:nth-child(1) .feature-icon {
          background: var(--green-soft);
          color: var(--green);
        }
        .learn-adm-root .feature-card:nth-child(2) .feature-icon {
          background: #FFF6DC;
          color: #B8860B;
        }
        .learn-adm-root .feature-card:nth-child(3) .feature-icon {
          background: #FFE8E8;
          color: #D9534F;
        }
        .learn-adm-root .feature-card h3 {
          font-size: 17px;
          margin-bottom: 8px;
        }
        .learn-adm-root .feature-card p {
          font-size: 14px;
          color: var(--ink-soft);
        }

        /* How it works */
        .learn-adm-root section.how {
          padding: 70px 24px;
        }
        .learn-adm-root .how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          position: relative;
        }
        .learn-adm-root .how-step {
          text-align: center;
          padding: 0 20px;
          position: relative;
        }
        .learn-adm-root .how-step .num {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--ink);
          color: var(--yellow);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
        }
        .learn-adm-root .how-step h3 {
          font-size: 16.5px;
          margin-bottom: 8px;
        }
        .learn-adm-root .how-step p {
          font-size: 14px;
          color: var(--ink-soft);
        }
        .learn-adm-root .how-step:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 22px;
          left: calc(50% + 90px);
          width: calc(100% - 180px);
          height: 2px;
          background-image: linear-gradient(to right, var(--card-border) 50%, transparent 50%);
          background-size: 10px 2px;
        }

        /* Templates */
        .learn-adm-root section.templates {
          padding: 60px 24px 80px;
        }
        .learn-adm-root .template-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .learn-adm-root .template-card {
          background: var(--card);
          border: 1.5px solid var(--card-border);
          border-radius: var(--radius);
          padding: 20px;
          transition: border-color .2s, transform .2s;
          cursor: pointer;
        }
        .learn-adm-root .template-card:hover {
          border-color: var(--ink);
          transform: translateY(-3px);
        }
        .learn-adm-root .template-card .tpl-tag {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 6px;
          margin-bottom: 12px;
          letter-spacing: .03em;
        }
        .learn-adm-root .template-card:nth-child(1) .tpl-tag {
          background: var(--green-soft);
          color: var(--green);
        }
        .learn-adm-root .template-card:nth-child(2) .tpl-tag {
          background: #E9E4FF;
          color: #6C4FD9;
        }
        .learn-adm-root .template-card:nth-child(3) .tpl-tag {
          background: #FFF6DC;
          color: #B8860B;
        }
        .learn-adm-root .template-card:nth-child(4) .tpl-tag {
          background: #FFE8E8;
          color: #D9534F;
        }
        .learn-adm-root .template-card h3 {
          font-size: 15px;
          margin-bottom: 6px;
        }
        .learn-adm-root .template-card p {
          font-size: 13px;
          color: var(--ink-soft);
          margin-bottom: 14px;
        }
        .learn-adm-root .template-card .tpl-steps {
          font-size: 12px;
          color: var(--ink-faint);
          font-family: 'JetBrains Mono', monospace;
        }

        /* CTA */
        .learn-adm-root section.cta {
          padding: 30px 24px 90px;
          text-align: center;
        }
        .learn-adm-root .cta-box {
          max-width: 720px;
          margin: 0 auto;
          background: var(--ink);
          border-radius: 20px;
          padding: 56px 40px;
          position: relative;
          overflow: hidden;
        }
        .learn-adm-root .cta-box::before {
          content: "";
          position: absolute;
          top: -40px;
          right: -40px;
          width: 160px;
          height: 160px;
          background: var(--yellow);
          opacity: .15;
          border-radius: 50%;
        }
        .learn-adm-root .cta-box h2 {
          color: #fff;
          font-size: 30px;
          margin-bottom: 12px;
        }
        .learn-adm-root .cta-box p {
          color: #B9C4D6;
          font-size: 15px;
          margin-bottom: 28px;
        }
        .learn-adm-root .cta-box .btn-primary {
          background: var(--yellow);
          color: var(--ink);
          font-weight: 700;
        }
        .learn-adm-root .cta-box .btn-primary:hover {
          box-shadow: 0 6px 18px rgba(255,212,59,0.35);
        }

        /* Footer */
        .learn-adm-root footer {
          padding: 30px 24px 40px;
          border-top: 1px solid var(--card-border);
        }
        .learn-adm-root .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .learn-adm-root .footer-links {
          display: flex;
          gap: 26px;
        }
        .learn-adm-root .footer-links a {
          font-size: 13.5px;
          color: var(--ink-soft);
          text-decoration: none;
        }
        .learn-adm-root .footer-links a:hover {
          color: var(--ink);
        }
        .learn-adm-root .footer-note {
          font-size: 12.5px;
          color: var(--ink-faint);
        }

        @media (max-width: 860px) {
          .learn-adm-root .feature-grid,
          .learn-adm-root .how-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .learn-adm-root .template-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .learn-adm-root .how-step::after {
            display: none;
          }
          .learn-adm-root .hero h1 {
            font-size: 36px;
          }
          .learn-adm-root .flow-track {
            flex-direction: column;
            gap: 6px;
          }
          .learn-adm-root .flow-connector {
            width: 2px;
            height: 30px;
          }
          .learn-adm-root .flow-connector::before {
            top: 0;
            left: -3px;
            animation: travelV 2.6s linear infinite;
          }
          @keyframes travelV {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 22px; opacity: 0; }
          }
        }
        @media (max-width: 600px) {
          .learn-adm-root .template-grid {
            grid-template-columns: 1fr;
          }
          .learn-adm-root nav .nav-links {
            display: none;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav id="landing-navbar">
        <div 
          className="logo" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          id="landing-logo-btn"
          role="button"
          tabIndex={0}
        >
          <span className="logo-mark">L</span>
          <span>Learn Adm</span>
        </div>
        <div className="nav-links">
          <a href="#how" onClick={(e) => scrollToSection(e, "how")}>How it works</a>
          <a href="#subjects" onClick={(e) => scrollToSection(e, "subjects")}>Subjects</a>
          <a href="#templates" onClick={(e) => scrollToSection(e, "templates")}>Examples</a>
        </div>
        <button
          onClick={onGetStarted}
          className="btn btn-primary btn-sm"
          id="landing-try-free-btn"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Header */}
      <header className="hero">
        <span className="eyebrow">● Built for grade 7–12 learners</span>
        <h1>
          Turn hard problems into <span className="hl">easy steps</span>
        </h1>
        <p className="sub">
          Connect one step to the next until you land on the answer — for maths, science, or any subject that needs a clear path from question to answer.
        </p>
        <div className="hero-ctas">
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            id="landing-get-started-btn"
          >
            Start solving
          </button>
          <a
            href="#demo"
            onClick={scrollToDemo}
            className="btn btn-ghost"
            id="landing-see-example-btn"
          >
            See an example ↓
          </a>
        </div>
        <p className="hero-note">No sign-up needed to try an example path</p>

        {/* Interactive Flow Diagram */}
        <div className="flow-stage" id="demo">
          <div className="flow-track" id="flowTrack">
            {/* Step 0 */}
            <div
              className={`flow-node ${activeStep === 0 ? "active" : ""}`}
              data-i="0"
              onClick={() => handleNodeClick(0)}
              id="flow-node-0"
            >
              <span className="step-label">The problem</span>
              <div className="step-expr">2x + 5 = 15</div>
              <div className="step-desc">Click each box to see how we get closer to x</div>
            </div>

            <div className="flow-connector"></div>

            {/* Step 1 */}
            <div
              className={`flow-node ${activeStep === 1 ? "active" : ""}`}
              data-i="1"
              onClick={() => handleNodeClick(1)}
              id="flow-node-1"
            >
              <span className="step-label">Step 1</span>
              <div className="step-expr">2x = 10</div>
              <div className="step-desc">Take 5 away from both sides</div>
            </div>

            <div className="flow-connector"></div>

            {/* Step 2 */}
            <div
              className={`flow-node ${activeStep === 2 ? "active" : ""}`}
              data-i="2"
              onClick={() => handleNodeClick(2)}
              id="flow-node-2"
            >
              <span className="step-label">Step 2</span>
              <div className="step-expr">x = 5</div>
              <div className="step-desc">Split both sides into 2 equal groups</div>
            </div>

            <div className="flow-connector"></div>

            {/* Step 3 - Answer */}
            <div
              className={`flow-node answer ${activeStep === 3 ? "active" : ""}`}
              data-i="3"
              onClick={() => handleNodeClick(3)}
              id="flow-node-3"
            >
              <span className="step-label">✓ Answer</span>
              <div className="step-expr">x = 5</div>
              <div className="step-desc">Check it: 2(5) + 5 = 15 ✓</div>
            </div>
          </div>

          <p className="flow-explain" id="flowExplain">
            {activeStep !== null ? (
              <span>
                <b>Step {activeStep + 1}:</b> {explanations[activeStep]}
              </span>
            ) : (
              "Tap a box above to see how that step works."
            )}
          </p>
        </div>
      </header>

      {/* Subjects Row */}
      <section className="subjects-row" id="subjects">
        <p>Works across every subject with a clear path to an answer</p>
        <div className="subjects-grid">
          <span className="subject-chip" onClick={scrollToDemo}>Algebra</span>
          <span className="subject-chip" onClick={scrollToDemo}>Geometry</span>
          <span className="subject-chip" onClick={scrollToDemo}>Fractions</span>
          <span className="subject-chip" onClick={scrollToDemo}>Word problems</span>
          <span className="subject-chip" onClick={scrollToDemo}>Chemistry equations</span>
          <span className="subject-chip" onClick={scrollToDemo}>Grammar rules</span>
          <span className="subject-chip" onClick={scrollToDemo}>Essay outlines</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow-sm">Why it helps</span>
            <h2>Made to make sense, not to sound smart</h2>
            <p>No confusing terms, no shortcuts you don't understand — just a clear path you can follow and check.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">✎</div>
              <h3>Plain-language steps</h3>
              <p>Every step is explained the way a good teacher would say it out loud — no textbook wording.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">▤</div>
              <h3>Hundreds of ready paths</h3>
              <p>Pick a path for fractions, equations, geometry proofs, and more — or put your own steps together.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Check your own work</h3>
              <p>See exactly which step you got right, and which one to fix, instead of just a red X.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how" id="how">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow-sm">How it works</span>
            <h2>Three steps to your answer</h2>
            <p>The same simple path, every time — however tricky the question looks at first.</p>
          </div>
          <div className="how-grid">
            <div className="how-step">
              <div className="num">1</div>
              <h3>Pick a problem</h3>
              <p>Choose a question from a subject, or type in your own.</p>
            </div>
            <div className="how-step">
              <div className="num">2</div>
              <h3>Put the steps in order</h3>
              <p>Line up the boxes that take you from the question to the answer.</p>
            </div>
            <div className="how-step">
              <div className="num">3</div>
              <h3>Check your answer</h3>
              <p>See exactly where you got it right, and where to go back and fix it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready-Made Paths (Templates) */}
      <section className="templates" id="templates">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow-sm">Ready-made paths</span>
            <h2>Pick a path and start practicing</h2>
            <p>A few examples of the paths other learners are using this week.</p>
          </div>
          <div className="template-grid">
            <div className="template-card" onClick={onGetStarted}>
              <span className="tpl-tag">ALGEBRA</span>
              <h3>Solving linear equations</h3>
              <p>Move terms, keep both sides equal, and land on x.</p>
              <div className="tpl-steps">5 steps</div>
            </div>
            <div className="template-card" onClick={onGetStarted}>
              <span className="tpl-tag">FRACTIONS</span>
              <h3>Simplifying fractions</h3>
              <p>Find common factors and reduce to the simplest form.</p>
              <div className="tpl-steps">4 steps</div>
            </div>
            <div className="template-card" onClick={onGetStarted}>
              <span className="tpl-tag">GEOMETRY</span>
              <h3>Proving triangles equal</h3>
              <p>Match up sides and angles to prove two shapes are the same.</p>
              <div className="tpl-steps">6 steps</div>
            </div>
            <div className="template-card" onClick={onGetStarted}>
              <span className="tpl-tag">SCIENCE</span>
              <h3>Balancing equations</h3>
              <p>Count atoms on each side until both sides match.</p>
              <div className="tpl-steps">5 steps</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="cta" id="cta">
        <div className="cta-box">
          <h2>Ready to solve your first problem?</h2>
          <p>Pick a subject, follow the path, and see how each step connects to the next.</p>
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            id="landing-cta-start-btn"
          >
            Start for free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap footer-inner">
          <div className="footer-note">© 2026 Learn Adm · A learning tool for students, by students</div>
          <div className="footer-links">
            <a href="#how" onClick={(e) => scrollToSection(e, "how")}>About</a>
            <a href="#how" onClick={(e) => scrollToSection(e, "how")}>Help</a>
            <a href="#how" onClick={(e) => scrollToSection(e, "how")}>Privacy</a>
            <a href="#cta" onClick={(e) => scrollToSection(e, "cta")}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
