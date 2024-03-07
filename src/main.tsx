import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { FuelProvider } from '@fuels/react';
import { BSafeConnector } from 'bsafe';
import { ChakraProvider } from '@chakra-ui/react';
import { defaultTheme } from './themes/default.ts';

const bsafe = new BSafeConnector();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FuelProvider
      theme={'dark'}
      fuelConfig={{
        connectors: [bsafe],
        storage: null
      }}
    >
      <ChakraProvider theme={defaultTheme}>
        <App />
      </ChakraProvider>
    </FuelProvider>
  </React.StrictMode>
);
