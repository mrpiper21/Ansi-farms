import React, { createContext, useState, useContext, useRef, ReactNode } from 'react';
import { PestDetectionBottomSheetRef } from '../components/bottom-sheets/PestDetectionBottomSheet';

interface BottomSheetContextType {
  openPestDetectionBottomSheet: () => void;
  pestDetectionBottomSheetRef: React.RefObject<PestDetectionBottomSheetRef>;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};

interface BottomSheetProviderProps {
  children: ReactNode;
}

export const BottomSheetProvider: React.FC<BottomSheetProviderProps> = ({ children }) => {
  const pestDetectionBottomSheetRef = useRef<PestDetectionBottomSheetRef>(null);

  const openPestDetectionBottomSheet = () => {
    pestDetectionBottomSheetRef.current?.open();
  };

  return (
    <BottomSheetContext.Provider value={{ openPestDetectionBottomSheet, pestDetectionBottomSheetRef: pestDetectionBottomSheetRef as React.RefObject<PestDetectionBottomSheetRef> }}>
      {children}
    </BottomSheetContext.Provider>
  );
}; 