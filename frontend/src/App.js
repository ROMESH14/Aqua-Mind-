import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Tanks from './pages/Tanks';
import WaterQuality from './pages/WaterQuality';
import Maintenance from './pages/Maintenance';
import SpeciesAdvisor from './pages/SpeciesAdvisor';
import WaterQualityPrediction from './pages/WaterQualityPrediction';
import PlantedTankAssistant from './pages/PlantedTankAssistant';
import TankDesigner from './pages/TankDesigner';
import Growth from './pages/Growth';
import Equipment from './pages/Equipment';
import Profile from './pages/Profile';
import Help from './pages/Help';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tanks" element={<Tanks />} />
            <Route path="water" element={<WaterQuality />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="growth" element={<Growth />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="profile" element={<Profile />} />
            <Route path="help" element={<Help />} />
            <Route path="ai" element={<Navigate to="/ai/plants" replace />} />
            <Route path="ai/species" element={<SpeciesAdvisor />} />
            <Route path="ai/predictions" element={<WaterQualityPrediction />} />
            <Route path="ai/plants" element={<PlantedTankAssistant />} />
            <Route path="ai/designer" element={<TankDesigner />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
