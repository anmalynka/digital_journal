import { useState, useEffect } from 'react';

export interface CircadianState {
  paperColor: string;
  intensity: number; // 0 to 1
  label: string;
}

export const useCircadian = () => {
  const [state, setState] = useState<CircadianState>({
    paperColor: '#fdfcf0',
    intensity: 0,
    label: 'Daylight',
  });

  useEffect(() => {
    const updateCircadian = () => {
      const hour = new Date().getHours();
      
      // Early Morning (5-8): Soft Blue/White
      if (hour >= 5 && hour < 9) {
        setState({ paperColor: '#f8f9ff', intensity: 0.2, label: 'Dawn' });
      } 
      // Daytime (9-17): Pure White
      else if (hour >= 9 && hour < 18) {
        setState({ paperColor: '#ffffff', intensity: 0, label: 'Daylight' });
      }
      // Evening (18-21): Warm Cream/Yellow
      else if (hour >= 18 && hour < 22) {
        setState({ paperColor: '#fefae0', intensity: 0.5, label: 'Golden Hour' });
      }
      // Night (22-4): Deep Amber/Warm
      else {
        setState({ paperColor: '#faedcd', intensity: 0.8, label: 'Candlelight' });
      }
    };

    updateCircadian();
    const interval = setInterval(updateCircadian, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return state;
};
