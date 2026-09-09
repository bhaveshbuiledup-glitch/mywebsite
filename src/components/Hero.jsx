import { ArrowRight, BarChart3, Check, ChevronRight, CircleHelp, Globe2, LineChart, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";

const metrics = [["Digital Presence", "78%", "blue"], ["Social Media", "65%", "purple"], ["Advertising", "48%", "orange"], ["SEO", "55%", "blue"], ["Business Readiness", "82%", "purple"]];

function AnalyticsPreview() {
  return <div className="analytics-wrap"><div className="analytics-glow" /><div className="analytics-card">
    <div className="analytics-head"><div><span className="live-dot" />Your marketing snapshot</div><button aria-label="More options">•••</button></div>
    <div className="score-row"><div><span className="muted-label">Marketing Score</span><strong>72<span>/100</span></strong><small><span className="up">↗ 12%</span> since last assessment</small></div><div className="score-ring"><span>72</span><small>Good</small></div></div>
    <div className="metric-list">{metrics.map(([label, value, color]) => <div className="metric" key={label}><div><span>{label}</span><strong>{value}</strong></div><div className="metric-track"><i className={color} style={{ width: value }} /></div></div>)}</div>
    <div className="recommendation"><div className="spark-icon"><Sparkles size={15} /></div><div><span>Recommended plan</span><strong>6-Month Growth</strong></div><ChevronRight size={17} /></div>
  </div></div>;
}

function Hero() {
  return <><main>
    <section className="hero" id="home"><div className="hero-copy">
      <div className="eyebrow"><span>✦</span> The clarity your growth needs</div>
      <h1>Discover the right <em>digital marketing</em> strategy for your business.</h1>
      <p className="hero-text">Answer a few simple questions and get a personalized marketing score, practical insights, and a growth strategy built for where you are today.</p>
      <div className="hero-actions"><Link className="primary-action" to="/assessment">Start Free Assessment <ArrowRight size={17} /></Link><a className="text-action" href="#how-it-works">See how it works <span>↓</span></a></div>
      <div className="hero-note"><span className="check-circle"><Check size={12} /></span> Free to start <span className="note-sep">•</span> Takes less than 5 minutes</div>
    </div><AnalyticsPreview /></section>
    <section className="trust-strip"><span>Built for ambitious small businesses</span><div><span>LOCAL RETAIL</span><span>CREATIVE STUDIOS</span><span>PROFESSIONAL SERVICES</span><span>ONLINE COMMERCE</span></div></section>
    <section className="section how-section" id="how-it-works"><div className="section-heading"><div><span className="section-kicker">Simple by design</span><h2>From uncertainty to a clear next step.</h2></div><p>BizGrow turns marketing complexity into a plan you can actually act on.</p></div><div className="steps-grid"><Step icon={<CircleHelp />} number="01" title="Tell us about your business" text="Share a few details about your audience, channels, and goals." /><Step icon={<BarChart3 />} number="02" title="See your marketing score" text="Understand what is working and where your biggest opportunities are." /><Step icon={<Target />} number="03" title="Get your growth roadmap" text="Walk away with prioritized actions and a plan made for your budget." /></div></section>
    <section className="section services-section" id="services"><div className="services-copy"><span className="section-kicker">Everything in one view</span><h2>Know what to do next, and why.</h2><p>Good marketing starts with context. Your BizGrow report brings every important signal together so you can invest in the moves that matter.</p><Link className="inline-link" to="/assessment">Build my strategy <ArrowRight size={16} /></Link></div><div className="service-list"><Service icon={<Globe2 />} title="Digital presence" text="Website, local visibility, and first impressions." /><Service icon={<Users />} title="Audience clarity" text="The people you want to reach and convert." /><Service icon={<LineChart />} title="Growth channels" text="The right mix of SEO, social, and paid media." /><Service icon={<ShieldCheck />} title="Business readiness" text="A realistic plan aligned to your capacity." /></div></section>
    <section className="section home-pricing" id="pricing"><div className="section-heading"><div><span className="section-kicker">Flexible support</span><h2>Choose the pace that fits your business.</h2></div><p>Start with clarity today and increase your support as your marketing becomes more ambitious.</p></div><div className="home-plan-grid"><HomePlan name="Starter" price="$49" text="For focused first steps" /><HomePlan name="Growth" price="$129" text="For building momentum" featured /><HomePlan name="Scale" price="$239" text="For an integrated strategy" /></div></section>
    <section className="about-section" id="about"><div><span className="section-kicker">Why BizGrow exists</span><h2>Marketing advice should feel useful, not overwhelming.</h2></div><p>We help small business owners replace guesswork with a clear view of what to improve, what to prioritize, and what to measure next. BizGrow makes strategy practical for the stage you are in.</p></section>
    <section className="contact-section" id="contact"><div><span className="section-kicker">Let’s talk growth</span><h2>Have a question before you start?</h2><p>Our team can help you understand your assessment or choose the right level of support.</p></div><div className="contact-details"><a href="mailto:hello@bizgrow.co">hello@bizgrow.co</a><span>Monday–Friday, 9am–5pm</span><Link className="light-action" to="/assessment">Start free assessment <ArrowRight size={17} /></Link></div></section>
    <section className="cta-band"><div><span className="section-kicker">Your next chapter starts here</span><h2>Make your marketing spend count.</h2></div><Link className="light-action" to="/assessment">Take the free assessment <ArrowRight size={17} /></Link></section>
  </main><footer><Link className="logo" to="/"><span className="logo-mark">B</span>BizGrow</Link><span>Clarity for your next stage of growth.</span><span>© 2025 BizGrow</span></footer></>;
}

function Step({ icon, number, title, text }) { return <article className="step-card"><div className="step-top"><div className="step-icon">{icon}</div><span>{number}</span></div><h3>{title}</h3><p>{text}</p></article>; }
function Service({ icon, title, text }) { return <div className="service-item"><div className="service-icon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div><ChevronRight size={17} /></div>; }
function HomePlan({ name, price, text, featured }) { return <article className={`home-plan ${featured ? "featured" : ""}`}><span>{featured ? "Most popular" : "BizGrow"}</span><h3>{name}</h3><strong>{price}<small>/mo</small></strong><p>{text}</p><Link to="/assessment">Explore plan <ArrowRight size={14} /></Link></article>; }

export default Hero;
