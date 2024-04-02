import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { FuelProvider } from '@fuels/react';
import { BakoSafeConnector } from 'bakosafe';
import { ChakraProvider } from '@chakra-ui/react';
import { defaultTheme } from './themes/default.ts';

const bsafe = new BakoSafeConnector();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FuelProvider
      theme={'dark'}
      fuelConfig={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        connectors: [bsafe as any],
        storage: null
      }}
    >
      <ChakraProvider theme={defaultTheme}>
        <App />
      </ChakraProvider>
    </FuelProvider>
  </React.StrictMode>
);
