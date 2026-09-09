import { ArrowLeft, ArrowRight, Check, CircleHelp, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STORAGE_KEY = "bizgrow-assessment";
const initialAnswers = { businessType: "", businessAge: "", businessDescription: "", website: "", socialMedia: "", advertising: "", seo: "", targetCustomers: "", marketingGoals: "", marketingChallenges: "", budget: "", expectedResults: "", name: "", email: "", phone: "" };
const steps = [
  { title: "About your business", fields: [{ key: "businessType", label: "What type of business do you run?", type: "options", options: ["Local service", "E-commerce", "Professional service", "Retail", "Creative business"] }, { key: "businessAge", label: "How long have you been in business?", type: "options", options: ["Less than 1 year", "1–3 years", "4–7 years", "8+ years"] }, { key: "businessDescription", label: "Tell us briefly about your business", type: "textarea", placeholder: "What do you sell or help people with?" }] },
  { title: "Your digital presence", fields: [{ key: "website", label: "How would you describe your website?", type: "options", options: ["I don't have one", "It needs work", "It works well", "It drives leads"] }, { key: "socialMedia", label: "How active are you on social media?", type: "options", options: ["Not active yet", "Occasionally", "Consistently", "Very active"] }] },
  { title: "Growth channels", fields: [{ key: "advertising", label: "Have you invested in paid advertising?", type: "options", options: ["Never", "Tried it once", "Run it occasionally", "Run it consistently"] }, { key: "seo", label: "How confident are you in your SEO?", type: "options", options: ["Not sure where to start", "Some basics in place", "Working on it", "A strong focus"] }] },
  { title: "Audience & goals", fields: [{ key: "targetCustomers", label: "How clearly defined are your target customers?", type: "options", options: ["I need help defining them", "I have a general idea", "Well defined", "Very specific and researched"] }, { key: "marketingGoals", label: "What is your primary marketing goal?", type: "options", options: ["Get more awareness", "Generate more leads", "Increase online sales", "Retain more customers"] }] },
  { title: "Your challenges", fields: [{ key: "marketingChallenges", label: "What is your biggest marketing challenge?", type: "options", options: ["Knowing what to do", "Finding the time", "Getting consistent leads", "Measuring results"] }, { key: "budget", label: "What is your monthly marketing budget?", type: "options", options: ["Under $500", "$500–$1,500", "$1,500–$3,000", "$3,000+"] }] },
  { title: "Define success", fields: [{ key: "expectedResults", label: "What result would make marketing a success?", type: "options", options: ["More visibility", "A steady flow of leads", "More revenue", "A predictable growth engine"] }] },
  { title: "Where to send your report", fields: [{ key: "name", label: "Your name", type: "input", placeholder: "Alex Morgan" }, { key: "email", label: "Email address", type: "input", placeholder: "alex@business.com" }, { key: "phone", label: "Phone number", type: "input", placeholder: "+1 555 000 0000" }] },
];

function Assessment() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(() => { try { return { ...initialAnswers, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; } catch { return initialAnswers; } });
  const [error, setError] = useState("");
  const step = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); }, [answers]);
  const updateAnswer = (key, value) => { setAnswers((current) => ({ ...current, [key]: value })); setError(""); };
  const isValid = () => step.fields.every((field) => { const value = answers[field.key]?.trim(); return field.key !== "email" ? Boolean(value) : Boolean(value && /^\S+@\S+\.\S+$/.test(value)); });
  const next = () => { if (!isValid()) { setError("Please complete each field to continue."); return; } if (stepIndex === steps.length - 1) { navigate("/report"); } else { setStepIndex((current) => current + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } };

  return <main className="assessment-page"><div className="assessment-shell">
    <div className="assessment-top"><Link className="back-home" to="/"><ArrowLeft size={16} /> Back to home</Link><span><LockKeyhole size={13} /> Your answers are private</span></div>
    <div className="progress-meta"><span>Step {stepIndex + 1} of {steps.length}</span><strong>{progress}% complete</strong></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
    <div className="question-area"><span className="question-kicker">BizGrow assessment</span><h1>{step.title}</h1><p className="question-intro">A few thoughtful answers will help us make your strategy more relevant.</p>
      <div className="question-fields">{step.fields.map((field) => <Field key={field.key} field={field} value={answers[field.key]} onChange={updateAnswer} />)}</div>
      {error && <p className="form-error" role="alert"><CircleHelp size={15} />{error}</p>}
      <div className="assessment-actions">{stepIndex > 0 ? <button className="back-button" onClick={() => setStepIndex((current) => current - 1)}><ArrowLeft size={16} /> Back</button> : <span />}
        <button className="continue-button" onClick={next}>{stepIndex === steps.length - 1 ? "Generate my report" : "Continue"}<ArrowRight size={17} /></button></div>
    </div>
  </div></main>;
}

function Field({ field, value, onChange }) { return <div className={`field ${field.type === "options" ? "option-field" : ""}`}><label>{field.label}</label>{field.type === "options" ? <div className="option-grid">{field.options.map((option) => <button className={value === option ? "selected" : ""} key={option} onClick={() => onChange(field.key, option)}>{option}{value === option && <Check size={16} />}</button>)}</div> : field.type === "textarea" ? <textarea value={value} onChange={(event) => onChange(field.key, event.target.value)} placeholder={field.placeholder} rows="4" /> : <input value={value} onChange={(event) => onChange(field.key, event.target.value)} placeholder={field.placeholder} type={field.key === "email" ? "email" : "text"} />}</div>; }

export default Assessment;
