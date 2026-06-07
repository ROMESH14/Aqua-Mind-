import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tanks from './pages/Tanks';
import WaterQuality from './pages/WaterQuality';
import Maintenance from './pages/Maintenance';
import AIAdvisor from './pages/AIAdvisor';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="tanks" element={<Tanks />} />
            <Route path="water" element={<WaterQuality />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="ai" element={<AIAdvisor />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
