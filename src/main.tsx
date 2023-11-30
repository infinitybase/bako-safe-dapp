import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FuelProvider } from '@fuel-wallet/react';
import { BSafeConnector } from './BSafeConnector.tsx';

const bsafe = new BSafeConnector();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FuelProvider
      fuelConfig={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        connectors: [bsafe as any],
        storage: null,
      }}
    >
      <App />
    </FuelProvider>
  </React.StrictMode>
);
