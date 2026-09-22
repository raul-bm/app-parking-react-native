import { api } from '@/api/client';
import { createContext, useCallback, useContext, useState } from 'react';

const PinsContext = createContext<any>(null);

export function PinsProvider({ children }: { children: React.ReactNode }) {
  const [pins, setPins] = useState<any[]>([]);
  const refresh = useCallback(async () => {
    try {
      const data = await api('/pins');
      if (Array.isArray(data)) setPins(data);
    } catch (e) {
      console.log('refresh error', e);
    }
  }, []);

  const addPin = async (lat: number, long: number, note?: string) => {
    await api('/pins', { method: 'POST', body: JSON.stringify({ lat, long, note }) });
    await refresh();
  };

  const removePin = async (id: number) => {
    await api(`/pins/${id}`, { method: 'DELETE' });
    const data = await api('/pins');
    if (Array.isArray(data)) setPins(data);
  };

  return (
    <PinsContext.Provider value={{ pins, refresh, addPin, removePin, setPins }}>
      {children}
    </PinsContext.Provider>
  );
}

export const usePins = () => useContext(PinsContext);
