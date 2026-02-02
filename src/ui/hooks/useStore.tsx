import React, { createContext, useContext, useMemo, useState } from 'react';
import { seedIfEmpty, updateStore } from '../../storage/storage';
import { StoreData } from '../../types';

interface StoreContextValue {
  store: StoreData;
  setStore: React.Dispatch<React.SetStateAction<StoreData>>;
  update: (updater: (store: StoreData) => StoreData) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<StoreData>(() => seedIfEmpty());

  const update = (updater: (store: StoreData) => StoreData) => {
    const next = updateStore(updater);
    setStore(next);
  };

  const value = useMemo(() => ({ store, setStore, update }), [store]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
