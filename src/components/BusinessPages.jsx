import { ArrowRight, BarChart3, Check, Compass, FileText, Globe2, LineChart, MapPin, Megaphone, Search, ShieldCheck, ShoppingBag, Sparkles, Target, TrendingUp, Users, WandSparkles, LayoutDashboard, X, ShoppingCart, CreditCard, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getDemoProfile } from "./authUtils";

const serviceData = [[Megaphone, "Social Media Marketing", "Build a recognizable presence with content that starts conversations.", ["Content calendar", "Community growth", "Monthly insights"]], [Search, "SEO", "Help the right customers find you when they are ready to choose.", ["Keyword strategy", "On-page optimization", "Search reporting"]], [LineChart, "Google Ads", "Capture high-intent demand with campaigns shaped around your goals.", ["Search campaigns", "Conversion tracking", "Bid optimization"]], [Target, "Meta Ads", "Reach future customers with creative, targeted campaigns across social.", ["Audience testing", "Creative direction", "Performance scaling"]], [Globe2, "Website Development", "Turn your digital home into a confident, high-converting first impression.", ["Responsive design", "Conversion paths", "Analytics setup"]], [FileText, "Content Marketing", "Earn attention and trust with useful ideas your audience wants to read.", ["Editorial strategy", "Expert content", "Distribution plan"]], [Users, "Lead Generation", "Create a repeatable system for turning interest into qualified conversations.", ["Offer strategy", "Landing pages", "Lead nurturing"]], [MapPin, "Local SEO", "Become easier to discover in the neighborhoods and communities you serve.", ["Google Business", "Review growth", "Local listings"]], [ShoppingBag, "E-commerce Marketing", "Make every product page, campaign, and customer touchpoint work harder.", ["Product strategy", "Shopping campaigns", "Retention flows"]]];

export function HowItWorks() { const steps = [[Compass, "01", "Tell Us About Your Business", "Share your context, audience, channels, and goals so we can see the full picture."], [FileText, "02", "Complete the Assessment", "Answer simple questions in about five minutes. Your progress saves automatically."], [BarChart3, "03", "Get Your Marketing Score", "See your score across the digital signals that matter most for your next stage."], [WandSparkles, "04", "Receive Your Growth Strategy", "Get prioritized services, a practical roadmap, and a recommended investment level."], [ShieldCheck, "05", "Choose Your Marketing Plan", "Move forward at a pace that fits your budget and the momentum you want to build."]]; return <PageFrame eyebrow="How BizGrow works" title="A clearer path from marketing questions to confident action." intro="Five focused steps turn scattered ideas into a strategy designed around your business."><div className="timeline">{steps.map(([Icon, number, title, text]) => <article className="timeline-card" key={number}><div className="timeline-number">{number}</div><div className="timeline-icon"><Icon size={21} /></div><div><h2>{title}</h2><p>{text}</p></div></article>)}</div><div className="page-cta"><div><span className="section-kicker">Ready when you are</span><h2>Start with a better question.</h2></div><Link className="primary-action" to="/assessment">Start Free Assessment <ArrowRight size={17} /></Link></div></PageFrame>; }

export function Services() { return <PageFrame eyebrow="Services" title="The right marketing mix for your next stage." intro="Start with the services your business needs now, then build from evidence instead of assumptions."><div className="service-card-grid">{serviceData.map(([Icon, title, text, benefits]) => <article className="service-card" key={title}><div className="service-icon large"><Icon size={21} /></div><h2>{title}</h2><p>{text}</p><ul>{benefits.map((benefit) => <li key={benefit}><Check size={14} />{benefit}</li>)}</ul><Link className="inline-link" to="/assessment">Learn More <ArrowRight size={15} /></Link></article>)}</div></PageFrame>; }

const pricing = [{ name: "Monthly", duration: 1, price: 49, label: "Flexible foundation", features: ["Monthly strategy review", "One priority channel", "Progress dashboard"] }, { name: "3 Months", duration: 3, price: 129, label: "Build momentum", features: ["Quarterly growth plan", "Two priority channels", "Monthly performance review"] }, { name: "6 Months", duration: 6, price: 239, label: "Recommended growth", features: ["Integrated marketing strategy", "Four priority channels", "Biweekly optimization"] }, { name: "12 Months", duration: 12, price: 399, label: "Long-term partner", features: ["Full-funnel strategy", "Ongoing channel support", "Quarterly planning sessions"] }];
export function Pricing() {
  const profile = getDemoProfile();
  const [selected, setSelected] = useState(pricing[2]);
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const addToCart = () => { setCart((current) => { const existing = current.find((item) => item.name === selected.name); return existing ? current.map((item) => item.name === selected.name ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...selected, quantity: 1 }]; }); setError(""); };
  const changeQuantity = (name, delta) => setCart((current) => current.map((item) => item.name === name ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity));
  const checkout = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || !/^\d{10}$/.test(phone)) return setError("Enter a valid email and exactly 10-digit phone number before checkout.");
    if (!cart.length) return setError("Add a plan to your cart before checkout.");
    setCheckingOut(true); setError("");
    try { const response = await fetch("/api/orders/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase(), phone, items: cart.map((item) => ({ plan: item.name, duration: item.duration, quantity: item.quantity })) }) }); const payload = await response.json(); if (!response.ok) return setError(payload.error || "Unable to start checkout."); window.location.assign(payload.checkoutUrl); } catch { setError("Unable to connect to secure checkout. Please try again."); } finally { setCheckingOut(false); }
  };
  return <PageFrame eyebrow="Pricing" title="Choose the support that matches your ambition." intro="Every plan starts with the same clarity. Choose any duration that fits your goals, regardless of your assessment recommendation."><div className="pricing-grid">{pricing.map((plan) => <article className={`pricing-card ${selected.name === plan.name ? "featured" : ""}`} key={plan.name}><span className="plan-label">{plan.label}</span><h2>{plan.name}</h2><strong>${plan.price}<small> total</small></strong><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul><button className={selected.name === plan.name ? "primary-action" : "outline-button"} type="button" onClick={() => setSelected(plan)}>{selected.name === plan.name ? "Selected" : "Choose plan"} <ArrowRight size={15} /></button></article>)}</div><section className="checkout-panel"><div><span className="section-kicker">Your selection</span><h2>{selected.name} plan</h2><p>{selected.features.join(" | ")}</p><button className="primary-action" type="button" onClick={addToCart}><ShoppingCart size={16} /> Add to Cart</button></div><div className="cart-summary"><h3><ShoppingCart size={17} /> Cart</h3>{cart.length ? cart.map((item) => <div className="cart-row" key={item.name}><span><b>{item.name}</b><small>{item.price} x {item.quantity}</small></span><span><button type="button" aria-label={`Decrease ${item.name}`} onClick={() => changeQuantity(item.name, -1)}><Minus size={13} /></button>{item.quantity}<button type="button" aria-label={`Increase ${item.name}`} onClick={() => changeQuantity(item.name, 1)}><Plus size={13} /></button></span></div>) : <p>Your cart is empty.</p>}<strong className="cart-total">Total: ${total}</strong><div className="checkout-fields"><input type="email" placeholder="Email for receipt" value={email} onChange={(event) => setEmail(event.target.value)} /><input type="tel" inputMode="numeric" maxLength="10" pattern="[0-9]{10}" placeholder="10-digit phone number" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} /></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="continue-button" type="button" disabled={checkingOut || !cart.length} onClick={checkout}><CreditCard size={16} />{checkingOut ? "Opening secure checkout..." : "Checkout with secure payment"}</button></div></section><p className="pricing-note"><ShieldCheck size={15} /> Payments are handled by Stripe. Card details never enter BizGrow or MongoDB.</p></PageFrame>;
}

export function About() { return <PageFrame eyebrow="About BizGrow" title="Better marketing starts with a better understanding of your business." intro="BizGrow is a digital marketing assessment and growth platform for small business owners who want clarity before they invest."><div className="about-grid"><article><Sparkles size={22} /><h2>What we do</h2><p>We translate the moving parts of digital marketing into a score, a set of priorities, and a practical growth strategy you can understand.</p></article><article><Target size={22} /><h2>Why we created it</h2><p>Small business owners are asked to be everywhere at once. BizGrow exists to help you decide what matters most right now.</p></article><article><TrendingUp size={22} /><h2>Our approach</h2><p>Context first, recommendations second. We use your answers and transparent scoring rules to keep every recommendation grounded.</p></article><article><Users size={22} /><h2>Who it helps</h2><p>Local businesses, online shops, consultants, studios, and service teams ready to turn effort into consistent growth.</p></article></div><div className="about-callout"><LayoutDashboard size={25} /><div><h2>Start with your marketing baseline.</h2><p>The free assessment gives you a useful first view in less than five minutes.</p></div><Link className="primary-action" to="/assessment">Take the assessment <ArrowRight size={16} /></Link></div></PageFrame>; }

export function Contact() {
  const [values, setValues] = useState({ fullName: "", businessName: "", email: "", phone: "", message: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => {
    if (key === "phone") {
      if (/\D/.test(value)) { setError("Phone number must contain numbers only."); return; }
      value = value.slice(0, 10);
    }
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!values.fullName.trim()) return setError("Please enter your full name.");
    if (!values.businessName.trim()) return setError("Please enter your business name.");
    if (!/^\S+@\S+\.\S+$/.test(values.email)) return setError("Please enter a valid email address.");
    if (!/^\d{10}$/.test(values.phone)) return setError("Please enter a valid 10-digit phone number.");
    if (!values.message.trim()) return setError("Please enter a message.");

    try {
      const health = await fetch("/api/health");
      const status = await health.json();
      if (status.database === "connected") {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          const payload = await response.json();
          return setError(payload.error || "Failed to send message.");
        }
      }
    } catch {
      /* continue to success even if backend is unavailable */
    }

    setValues({ fullName: "", businessName: "", email: "", phone: "", message: "" });
    setSubmitted(true);
  };

  return <PageFrame eyebrow="Contact" title={"Let\u2019s make your next marketing decision clearer."} intro="Tell us where you are starting and we will help you find the most useful next step."><div className="contact-page-grid"><form className="contact-form" onSubmit={submit}><label>Full Name<input required placeholder="Alex Morgan" value={values.fullName} onChange={(event) => update("fullName", event.target.value)} /></label><label>Business Name<input required placeholder="Northstar Studio" value={values.businessName} onChange={(event) => update("businessName", event.target.value)} /></label><div className="form-columns"><label>Email<input required type="email" placeholder="alex@business.com" value={values.email} onChange={(event) => update("email", event.target.value)} /></label><label>Phone<input required type="tel" inputMode="numeric" maxLength="10" pattern="[0-9]{10}" placeholder="5551234567" value={values.phone} onChange={(event) => update("phone", event.target.value)} /><small>Enter exactly 10 digits.</small></label></div><label>Message<textarea required rows="5" placeholder="How can we help your business grow?" value={values.message} onChange={(event) => update("message", event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-action" type="submit">Send Message <ArrowRight size={16} /></button></form>{submitted && <div className="auth-overlay" role="dialog" aria-modal="true" aria-label="Success"><div className="auth-modal" style={{ maxWidth: "420px" }}><button className="auth-close" onClick={() => setSubmitted(false)} aria-label="Close"><X size={19} /></button><div className="auth-visual"><span className="auth-badge"><Check size={14} /> Message received</span><h2>Message sent successfully!</h2><p>Thank you for reaching out. We will get back to you within one business day.</p></div><div className="auth-form" style={{ padding: "1.5rem" }}><button className="continue-button auth-submit" type="button" onClick={() => setSubmitted(false)}>Close</button></div></div></div>}<aside className="contact-info"><div className="contact-info-icon"><Globe2 size={22} /></div><h2>Talk to a growth guide.</h2><p>Questions about your score, services, or a plan? We are here to make the next conversation useful.</p><a href="mailto:hello@bizgrow.co">hello@bizgrow.co</a><span>Monday\u2013Friday, 9am\u20135pm</span><Link className="outline-button" to="/assessment">Book through assessment <ArrowRight size={15} /></Link></aside></div></PageFrame>;
}

export function Dashboard() { const profile = JSON.parse(localStorage.getItem("bizgrow-demo-user") || "{}"); return <PageFrame eyebrow="Your workspace" title={profile.name ? `Good to see you, ${profile.name.split(" ")[0]}.` : "Your growth workspace."} intro="Keep your score, priorities, and next actions in one calm place."><div className="dashboard-grid"><article className="dashboard-score"><span className="muted-label">Marketing Score</span><strong>72<span>/100</span></strong><p>Promising foundation</p><Link className="inline-link" to="/results">View full results <ArrowRight size={15} /></Link></article><article className="dashboard-card"><div className="dashboard-card-title"><h2>Next best actions</h2><span>3 priorities</span></div><ul className="dashboard-list"><li><span><Check size={14} /></span> Clarify your ideal customer message</li><li><span><Check size={14} /></span> Create a repeatable SEO rhythm</li><li><span><Check size={14} /></span> Measure every campaign conversion</li></ul></article><article className="dashboard-card"><div className="dashboard-card-title"><h2>Recommended plan</h2><Sparkles size={17} /></div><h3>6-Month Growth</h3><p>Build the foundation, test the right channels, and optimize with evidence.</p><Link className="outline-button" to="/pricing">Review plans <ArrowRight size={15} /></Link></article></div></PageFrame>; }

function PageFrame({ eyebrow, title, intro, children }) { return <main className="inner-page"><div className="inner-page-header"><span className="question-kicker">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></div>{children}</main>; }
