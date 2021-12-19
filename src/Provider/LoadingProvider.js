import React, {useState} from 'react';
import LoadingContext from '../Context/LoadingContext';

const LoadingProvider = ({children}) => {
  const setIsLoading = bool => {
    setLoading(prevState => {
      return {
        ...prevState,
        isLoading: bool,
      };
    });
  };

  const initialState = {
    isLoading: false,
    setIsLoading,
  };

  const [loading, setLoading] = useState(initialState);

  return <LoadingContext.Provider value={loading}>{children}</LoadingContext.Provider>;
};

export default LoadingProvider;
