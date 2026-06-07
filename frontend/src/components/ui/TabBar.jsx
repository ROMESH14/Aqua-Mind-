import { useState } from 'react';

function TabBar({ tabs, onChange }) {
  const [active, setActive] = useState(0);

  const select = (index) => {
    setActive(index);
    onChange?.(index);
  };

  return (
    <div className="tab-bar">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={`tab-pill${active === index ? ' active' : ''}`}
          onClick={() => select(index)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default TabBar;
