import { Link } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';

const START = [
  { step: '1', title: 'Add a tank', text: 'Go to My Tanks and create each aquarium (name, size, type, fish, plants).', to: '/tanks' },
  { step: '2', title: 'Log water', text: 'Open Water, pick a tank, type readings or upload a test-kit photo, then save.', to: '/water' },
  { step: '3', title: 'Set care tasks', text: 'In Care, add jobs like water change. Tick them off when done.', to: '/maintenance' },
];

const GUIDES = [
  {
    title: 'Dashboard',
    to: '/dashboard',
    points: [
      'See tank count, fish count, tasks, and health at a glance.',
      'Use Today’s tasks to mark work done.',
      'Open alerts to jump to Water.',
    ],
  },
  {
    title: 'My Tanks',
    to: '/tanks',
    points: [
      'Create, edit, or delete a tank.',
      'Type: Community, Planted, Monster Fish, or Nano.',
      'Add fish and plant names as tags.',
    ],
  },
  {
    title: 'Water',
    to: '/water',
    points: [
      'Enter pH, temp, ammonia (NH₃), nitrite (NO₂), nitrate (NO₃), and oxygen (O₂).',
      'You can drop a test-kit photo to fill the form.',
      'Save to get a score and what to do next.',
    ],
  },
  {
    title: 'Care',
    to: '/maintenance',
    points: [
      'Add a task with a date, time, and optional tank.',
      'Due today and the calendar show what is next.',
      'Completed work appears in the maintenance log.',
    ],
  },
  {
    title: 'Growth',
    to: '/growth',
    points: [
      'Pick a tank and fish, then log length (cm).',
      'Weight is optional.',
      'Use the chart to see change over time.',
    ],
  },
  {
    title: 'Gear',
    to: '/equipment',
    points: [
      'Add filter, heater, lighting, pump, CO₂, or other items per tank.',
      'Set status: Working, Needs service, or Replaced.',
    ],
  },
  {
    title: 'Planner',
    to: '/ai/plants',
    points: [
      'Plants, Species, and Designer do not need a saved tank.',
      'Answer the questions, then save a result to history.',
      'Designer also gives a kit / shopping list.',
    ],
  },
  {
    title: 'Profile',
    to: '/profile',
    points: [
      'Change your username or email.',
      'New password must be at least 6 characters.',
      'Sign out from Profile or the sidebar.',
    ],
  },
];

const RANGES = [
  ['pH', '6.5 – 7.8'],
  ['Temp', '22 – 30 °C'],
  ['Ammonia (NH₃)', '0 ppm'],
  ['Nitrite (NO₂)', '0 ppm'],
  ['Nitrate (NO₃)', 'under 20 ppm'],
  ['Oxygen (O₂)', 'above 6 ppm'],
];

function Help() {
  return (
    <div className="page-screen">
      <div className="page">
        <PageHero
          eyebrow="Guide"
          title="Help & Guidelines"
          subtitle="Short steps for everyday tank care in Aqua Mind"
        />

        <section className="help-start">
          <h2>Start here</h2>
          <div className="help-start-grid">
            {START.map((item) => (
              <Link key={item.step} to={item.to} className="card help-step">
                <span className="help-step-num">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="help-guides">
          <h2>How each page works</h2>
          <div className="help-grid">
            {GUIDES.map((guide) => (
              <article key={guide.title} className="card help-card">
                <div className="help-card-head">
                  <h3>{guide.title}</h3>
                  <Link to={guide.to} className="help-open">Open</Link>
                </div>
                <ul>
                  {guide.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="card help-ranges">
          <h2>Safe water targets</h2>
          <p>These are the usual community-tank ranges Aqua Mind uses when it scores a test.</p>
          <div className="help-range-grid">
            {RANGES.map(([label, value]) => (
              <div key={label} className="help-range">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card help-tips">
          <h2>Quick tips</h2>
          <ul>
            <li>Change 25–40% water weekly. Move pH slowly — no more than 0.2 per day.</li>
            <li>If ammonia or nitrite is up, do a large water change and pause extra feeding.</li>
            <li>Search modules in the top bar to jump to a page.</li>
            <li>The bell shows water and task alerts. Toasts also appear after a test or due task.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Help;
