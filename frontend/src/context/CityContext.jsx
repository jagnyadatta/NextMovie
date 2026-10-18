import React, { createContext, useContext, useState } from 'react';
import { POPULAR_CITIES } from '../utils/constants';

const CityContext = createContext(null);

export const CityProvider = ({ children }) => {
  const [currentCity, setCurrentCityState] = useState(() => {
    return localStorage.getItem('nextmovie_city') || 'Mumbai';
  });

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const setCity = (cityName) => {
    setCurrentCityState(cityName);
    localStorage.setItem('nextmovie_city', cityName);
    setIsCityModalOpen(false);
  };

  const openCityModal = () => setIsCityModalOpen(true);
  const closeCityModal = () => setIsCityModalOpen(false);

  return (
    <CityContext.Provider
      value={{
        currentCity,
        setCity,
        cities: POPULAR_CITIES,
        isCityModalOpen,
        openCityModal,
        closeCityModal,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};

export default CityContext;
