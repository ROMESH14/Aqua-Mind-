import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Tanks from './pages/Tanks';
import WaterQuality from './pages/WaterQuality';
import Maintenance from './pages/Maintenance';
import SpeciesAdvisor from './pages/SpeciesAdvisor';
import WaterQualityPrediction from './pages/WaterQualityPrediction';
import PlantedTankAssistant from './pages/PlantedTankAssistant';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tanks" element={<Tanks />} />
            <Route path="water" element={<WaterQuality />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="ai" element={<Navigate to="/ai/species" replace />} />
            <Route path="ai/species" element={<SpeciesAdvisor />} />
            <Route path="ai/predictions" element={<WaterQualityPrediction />} />
            <Route path="ai/plants" element={<PlantedTankAssistant />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
