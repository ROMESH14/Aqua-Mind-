import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthModal from '../components/auth/AuthModal';
import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';

const NAV_SECTIONS = [
  { id: 'features', label: 'Features' },
  { id: 'about', label: 'About' },
  { id: 'how-it-works', label: 'How it works' },
];

const HEADER_OFFSET = 88;

const features = [
  {
    icon: '◈',
    title: 'Dashboard',
    desc: 'Stats, alerts & temperature trends at a glance.',
    image: 'deck-dashboard.png',
  },
  {
    icon: '✦',
    title: 'Planner',
    desc: 'Plant and species recommendations for your tank.',
    image: 'deck-betta.png',
  },
  {
    icon: '◎',
    title: 'My Tanks',
    desc: 'Manage all your aquariums in one place.',
    image: 'deck-tank.png',
  },
  {
    icon: '◉',
    title: 'Water Quality',
    desc: 'Track pH, temp, ammonia, nitrite & more.',
    image: 'deck-water.webp',
  },
  {
    icon: '◷',
    title: 'Maintenance',
    desc: 'Schedule water changes & never miss a task.',
    image: 'deck-plants.png',
  },
];

const aboutPoints = [
  {
    icon: '🎯',
    title: 'Our mission',
    desc: 'Help aquarists keep healthier tanks with less guesswork.',
  },
  {
    icon: '🐠',
    title: 'Who it\'s for',
    desc: 'Hobbyists and keepers managing one tank or many.',
  },
  {
    icon: '✦',
    title: 'Why Aqua Mind',
    desc: 'Tracking, reminders, and AI guidance in one place.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Create your account',
    desc: 'Sign up free in seconds — no credit card needed.',
  },
  {
    num: '02',
    title: 'Add your tanks',
    desc: 'Set up each aquarium with species, size, and your care routine.',
  },
  {
    num: '03',
    title: 'Track & get advice',
    desc: 'Log readings, schedule tasks, and let AI flag issues before they become problems.',
  },
];

const deckCards = [
  { src: 'deck-plants.png', alt: 'Planted aquascape with live plants', label: 'Live plants', position: 'center' },
  { src: 'deck-fish.png', alt: 'Discus fish in aquarium', label: 'Discus fish', position: 'center' },
  { src: 'deck-tank.png', alt: 'Aquascaped tank with driftwood', label: 'Aquascape', position: 'center' },
  { src: 'deck-betta.png', alt: 'Siamese fighting fish', label: 'Betta fish', position: 'center top' },
  { src: 'deck-goldfish.png', alt: 'Oranda goldfish in tank', label: 'Goldfish', position: 'center top' },
];

const DEFAULT_DECK_INDEX = deckCards.length - 1;

function getDeckCardStyle(index, activeIndex) {
  const rel = index - activeIndex;
  const abs = Math.abs(rel);

  if (rel === 0) {
    return {
      transform: 'translate3d(-50%, calc(-50% - 18px), 0) scale(1.07) rotate(0deg)',
      zIndex: 30,
    };
  }

  const dir = rel < 0 ? -1 : 1;
  const rotate = dir * (5 + abs * 6);
  const tx = dir * (32 + abs * 34);
  const ty = 4 + abs * 8;
  const scale = Math.max(0.86, 1 - abs * 0.034);

  return {
    transform: `translate3d(calc(-50% + ${tx}px), calc(-50% + ${ty}px), 0) scale(${scale}) rotate(${rotate}deg)`,
    zIndex: 30 - abs,
  };
}

function Landing() {
  const img = (file) => `${process.env.PUBLIC_URL}/${file}`;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCard, setActiveCard] = useState(DEFAULT_DECK_INDEX);
  const [activeSection, setActiveSection] = useState('');
  const scrollPadRef = useRef(null);
  const authParam = searchParams.get('auth');
  const authMode = authParam === 'register' ? 'register' : authParam === 'login' ? 'login' : null;

  const openAuth = (mode) => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }
    setSearchParams({ auth: mode }, { replace: true });
  };

  const closeAuth = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('auth');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (isAuthenticated && authMode) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authMode, navigate]);

  const updateScrollPad = useCallback(() => {
    const lastId = NAV_SECTIONS[NAV_SECTIONS.length - 1].id;
    const section = document.getElementById(lastId);
    const pad = scrollPadRef.current;
    if (!section || !pad) return;

    const target = section.offsetTop - HEADER_OFFSET;
    const deficit = target + window.innerHeight - document.documentElement.scrollHeight;
    pad.style.height = deficit > 0 ? `${Math.ceil(deficit)}px` : '0px';
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    updateScrollPad();
    const top = el.offsetTop - HEADER_OFFSET;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.min(Math.max(0, top), maxScroll), behavior: 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
    setActiveSection(id);
  }, [updateScrollPad]);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    scrollToSection(id);
  };

  useEffect(() => {
    const onScroll = () => {
      const first = document.getElementById(NAV_SECTIONS[0].id);
      if (first && first.getBoundingClientRect().top > HEADER_OFFSET + 24) {
        setActiveSection('');
        return;
      }

      let current = NAV_SECTIONS[0].id;
      for (const { id } of NAV_SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= HEADER_OFFSET + 24) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    updateScrollPad();
    window.addEventListener('resize', updateScrollPad);

    const hash = window.location.hash.replace('#', '');
    if (NAV_SECTIONS.some((s) => s.id === hash)) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToSection(hash));
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateScrollPad);
    };
  }, [scrollToSection, updateScrollPad]);

  return (
    <div className="landing">
      <header className="lp-header">
        <div className="lp-container lp-header-inner">
          <Link to="/" className="lp-header-logo">
            <Logo size="md" />
          </Link>
          <nav className="lp-header-nav" aria-label="Page sections">
            {NAV_SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={activeSection === id ? 'is-active' : ''}
                onClick={(e) => handleNavClick(e, id)}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="lp-header-actions">
            <button type="button" className="lp-btn lp-btn--ghost lp-btn--nav" onClick={() => openAuth('login')}>
              Sign in
            </button>
            <button type="button" className="lp-btn lp-btn--primary lp-btn--nav" onClick={() => openAuth('register')}>
              Get started
              <span className="lp-btn-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-container lp-hero-inner">
            <div className="lp-hero-left">
              <span className="lp-eyebrow">AI-powered aquarium care</span>
              <h1 className="lp-hero-title">
                Smarter care for every{' '}
                <span className="lp-hero-highlight">aquarium</span>{' '}
                <span className="lp-hero-highlight-alt">you keep.</span>
              </h1>
              <p className="lp-hero-sub">
                Track water quality, manage tanks and fish, schedule maintenance, and get AI species advice — all in Aqua Mind.
              </p>
              <div className="lp-hero-cta">
                <button type="button" className="lp-btn lp-btn--primary lp-btn--lg" onClick={() => openAuth('register')}>
                  Get started free
                </button>
                <span className="lp-hero-note">No credit card required</span>
              </div>
            </div>

            <div className="lp-hero-right">
              <div
                className="lp-deck"
                aria-label="Aquarium tank gallery"
                onMouseLeave={() => setActiveCard(DEFAULT_DECK_INDEX)}
              >
                {deckCards.map((card, i) => {
                  const isActive = activeCard === i;
                  const deckStyle = getDeckCardStyle(i, activeCard);
                  return (
                    <div
                      key={card.src}
                      className={`lp-deck-card${isActive ? ' lp-deck-card--active' : ''}`}
                      style={deckStyle}
                      onMouseEnter={() => setActiveCard(i)}
                      onFocus={() => setActiveCard(i)}
                      onClick={() => setActiveCard(i)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveCard(i); }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isActive}
                      aria-label={card.label}
                    >
                      <img
                        src={img(card.src)}
                        alt={card.alt}
                        loading={i < 2 ? 'eager' : 'lazy'}
                        style={{ objectPosition: card.position }}
                      />
                      <span className="lp-deck-label">{card.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="lp-features">
          <div className="lp-container">
            <div className="lp-features-head">
              <h2>Everything you need</h2>
              <p>Five tools built to keep your aquarium healthy.</p>
            </div>
            <div className="lp-features-grid">
              {features.map((f) => (
                <article key={f.title} className="lp-feature-card">
                  <div className="lp-feature-img">
                    <img src={img(f.image)} alt="" loading="lazy" />
                  </div>
                  <span className="lp-feature-icon">{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="lp-about">
          <div className="lp-container">
            <div className="lp-section-head">
              <span className="lp-eyebrow">About Aqua Mind</span>
              <h2>Built for people who love their aquariums</h2>
              <p>
                One calm dashboard for your tanks, water readings, maintenance schedule,
                and AI-powered species advice.
              </p>
            </div>
            <div className="lp-about-grid">
              {aboutPoints.map((item) => (
                <article key={item.title} className="lp-about-card">
                  <span className="lp-about-icon" aria-hidden="true">{item.icon}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="lp-steps">
          <div className="lp-container">
            <div className="lp-features-head">
              <h2>How it works</h2>
              <p>Up and running in three simple steps.</p>
            </div>
            <div className="lp-steps-grid">
              {steps.map((step) => (
                <article key={step.num} className="lp-step-card">
                  <span className="lp-step-num">{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-banner">
          <div className="lp-container">
            <div className="lp-banner-inner">
              <h2>Ready to dive in?</h2>
              <button type="button" className="lp-btn lp-btn--primary lp-btn--lg" onClick={() => openAuth('register')}>
                Create free account
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <Logo size="sm" />
            <p>Smart aquarium care for every tank you keep.</p>
          </div>
          <nav className="lp-footer-nav" aria-label="Footer">
            {NAV_SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => handleNavClick(e, id)}
              >
                {label}
              </a>
            ))}
            <button type="button" className="lp-footer-link" onClick={() => openAuth('register')}>Get started</button>
          </nav>
          <small className="lp-footer-copy">© {new Date().getFullYear()} Aqua Mind</small>
        </div>
      </footer>
      <div ref={scrollPadRef} className="lp-scroll-pad" aria-hidden="true" />
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={closeAuth}
          onModeChange={(mode) => setSearchParams({ auth: mode }, { replace: true })}
        />
      )}
    </div>
  );
}

export default Landing;
