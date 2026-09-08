export default function About() {
    const features = [
        {
            icon: 'fa-solid fa-cloud',
            title: 'Cloud Synced',
            desc: 'Your notes are securely stored and accessible from any device, anytime.'
        },
        {
            icon: 'fa-solid fa-shield-halved',
            title: 'Private & Secure',
            desc: 'JWT-based authentication ensures only you can access your notes.'
        },
        {
            icon: 'fa-solid fa-bolt',
            title: 'Lightning Fast',
            desc: 'Built with React and Node.js for a snappy, real-time experience.'
        },
        {
            icon: 'fa-solid fa-tags',
            title: 'Tag & Organise',
            desc: 'Add custom tags to your notes to keep everything categorised.'
        },
        {
            icon: 'fa-solid fa-pen-to-square',
            title: 'Edit Anywhere',
            desc: 'Update or delete notes instantly with an intuitive modal editor.'
        },
        {
            icon: 'fa-solid fa-circle-half-stroke',
            title: 'Light & Dark Mode',
            desc: 'Switch between dark and light themes instantly — your preference is saved automatically.'
        }
    ];

    const stack = [
        { name: 'React', icon: 'fa-brands fa-react', color: '#61dafb' },
        { name: 'Node.js', icon: 'fa-brands fa-node-js', color: '#68a063' },
        { name: 'Express', icon: 'fa-solid fa-server', color: '#ffffff' },
        { name: 'MongoDB', icon: 'fa-solid fa-database', color: '#4db33d' },
        { name: 'Bootstrap', icon: 'fa-brands fa-bootstrap', color: '#7952b3' },
        { name: 'JWT Auth', icon: 'fa-solid fa-key', color: '#f7b731' },
    ];

    return (
        <div className="about-page">

            {/* Hero */}
            <section className="about-hero">
                <div className="container text-center">
                    <div className="about-hero-icon">
                        <i className="fa-solid fa-book-open"></i>
                    </div>
                    <h1 className="about-hero-title">
                        Your Notes. <span className="text-accent">Everywhere.</span>
                    </h1>
                    <p className="about-hero-sub">
                        iNotebook is a full-stack, cloud-based note-taking app designed to keep
                        your ideas organised, secure, and always within reach.
                    </p>
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        <a href="/signup" className="btn btn-primary btn-lg about-cta">
                            <i className="fa-solid fa-user-plus me-2"></i>Get Started — it's free
                        </a>
                        <a href="/login" className="btn btn-outline-light btn-lg about-cta">
                            <i className="fa-solid fa-right-to-bracket me-2"></i>Sign In
                        </a>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="about-features">
                <div className="container">
                    <h2 className="section-heading text-center">
                        Why <span className="text-accent">iNotebook</span>?
                    </h2>
                    <p className="section-sub text-center">
                        Everything you need to capture, organise and revisit your thoughts.
                    </p>
                    <div className="row g-4 mt-2">
                        {features.map((f, i) => (
                            <div className="col-md-4 col-sm-6" key={i}>
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className={f.icon}></i>
                                    </div>
                                    <h5 className="feature-title">{f.title}</h5>
                                    <p className="feature-desc">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="about-stack">
                <div className="container">
                    <h2 className="section-heading text-center">
                        Built With
                    </h2>
                    <p className="section-sub text-center">A modern MERN stack powering every note you write.</p>
                    <div className="stack-grid mt-4">
                        {stack.map((s, i) => (
                            <div className="stack-badge" key={i}>
                                <i className={s.icon} style={{ color: s.color }}></i>
                                <span>{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="about-how">
                <div className="container">
                    <h2 className="section-heading text-center">How It Works</h2>
                    <div className="row g-4 mt-2 justify-content-center">
                        {[
                            { step: '01', icon: 'fa-solid fa-user-plus', title: 'Create Account', desc: 'Sign up for free in seconds.' },
                            { step: '02', icon: 'fa-solid fa-plus',      title: 'Add Notes',      desc: 'Capture ideas with a title, description and tag.' },
                            { step: '03', icon: 'fa-solid fa-cloud',     title: 'Sync Anywhere',  desc: 'Access your notes from any browser, any device.' },
                        ].map((item, i) => (
                            <div className="col-md-4 text-center" key={i}>
                                <div className="how-card">
                                    <div className="how-step">{item.step}</div>
                                    <div className="how-icon">
                                        <i className={item.icon}></i>
                                    </div>
                                    <h5 className="how-title">{item.title}</h5>
                                    <p className="how-desc">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="about-bottom-cta text-center">
                <div className="container">
                    <h3>Ready to get organised?</h3>
                    <p className="text-muted-light">Join iNotebook today and never lose a thought again.</p>
                    <a href="/signup" className="btn btn-primary btn-lg mt-2">
                        <i className="fa-solid fa-rocket me-2"></i>Start for Free
                    </a>
                </div>
            </section>

        </div>
    );
}
