function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <p className="eyebrow">A clearer way to move forward</p>
        <h1>Build momentum for your next big idea.</h1>
        <p className="hero-text">
          MyWebsite brings your plans, people, and progress together in one
          focused workspace designed for meaningful work.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="#contact">
            Start a project <span aria-hidden="true">&#8594;</span>
          </a>
          <a className="secondary-action" href="#about">
            See how it works <span aria-hidden="true">&#8595;</span>
          </a>
        </div>
        <div className="hero-proof">
          <div className="avatar-stack" aria-hidden="true">
            <span>AR</span><span>MK</span><span>JD</span>
          </div>
          <p><strong>2,000+</strong> teams are making progress together</p>
        </div>
      </div>

      <div className="hero-visual" aria-label="Project progress overview">
        <div className="visual-topline">
          <span>Project overview</span>
          <span className="status-dot">On track</span>
        </div>
        <div className="progress-heading">
          <div><span>Launch campaign</span><strong>78%</strong></div>
          <div className="progress-bar"><span /></div>
        </div>
        <div className="visual-grid">
          <div className="mini-stat"><span>Tasks done</span><strong>24 / 31</strong><em>+18.4%</em></div>
          <div className="mini-stat"><span>Team focus</span><strong>92%</strong><em>Excellent</em></div>
        </div>
        <div className="activity-list">
          <div><span className="activity-icon coral">&#10003;</span><p><strong>Design review</strong><small>Completed just now</small></p><b>Done</b></div>
          <div><span className="activity-icon blue">&#9679;</span><p><strong>Content sprint</strong><small>Due tomorrow</small></p><b>In progress</b></div>
          <div><span className="activity-icon yellow">&#9733;</span><p><strong>Launch checklist</strong><small>5 items remaining</small></p><b>Upcoming</b></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
