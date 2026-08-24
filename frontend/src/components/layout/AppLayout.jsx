import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppTopbar from './AppTopbar';

function AppLayout() {
  return (
    <div className="app-shell">
      <div className="water-bubbles" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <Sidebar />
      <main className="app-canvas">
        <AppTopbar />
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
