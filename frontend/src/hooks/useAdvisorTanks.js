import { useEffect, useState } from 'react';
import { tankService } from '../services/tankService';

export function useAdvisorTanks() {
  const [tanks, setTanks] = useState([]);
  const [selectedTank, setSelectedTank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    tankService.getAll()
      .then((data) => {
        setTanks(data);
        if (data.length) setSelectedTank(data[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const tank = tanks.find((t) => t.id === selectedTank);

  return {
    tanks,
    tank,
    selectedTank,
    setSelectedTank,
    loading,
    error,
    setError,
  };
}
