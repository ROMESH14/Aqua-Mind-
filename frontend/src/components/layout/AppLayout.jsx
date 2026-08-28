import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppTopbar from './AppTopbar';
import NotifyToast from '../ui/NotifyToast';
import { NotificationProvider } from '../../context/NotificationContext';

function AppLayout() {
  return (
    <NotificationProvider>
      <div className="app-shell">
        <div className="water-bubbles" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>
        <Sidebar />
        <main className="app-canvas">
          <AppTopbar />
          <Outlet />
        </main>
        <NotifyToast />
      </div>
    </NotificationProvider>
  );
}

export default AppLayout;
