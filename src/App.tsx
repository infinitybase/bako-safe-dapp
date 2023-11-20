import { useEffect } from 'react';
import { BSafeConnector, WalletEnumEvents } from './BSafeConnector';
import './App.css';
import {
  Address,
  BaseAssetId,
  bn,
  Provider,
  ScriptTransactionRequest,
} from 'fuels';
import { Fuel, getGasConfig } from '@fuel-wallet/sdk';

const bsafe = new BSafeConnector();
const fuel = new Fuel();

/*
 * Simulate a transaction by Fuel Wallet account to Bsafe vault
 * */
const simulateTransaction = async (bsafeVault: string) => {
  if (!(await fuel.isConnected())) {
    await fuel.connect();
  }

  const fuelCurrentAccount = await fuel.currentAccount();

  const provider = await Provider.create('https://beta-4.fuel.network/graphql');
  const { gasLimit, gasPrice } = await getGasConfig(provider);
  const transactionRequest = new ScriptTransactionRequest({
    gasLimit,
    gasPrice,
  });

  /* Set assets to Bsafe vault  */
  const toAddress = Address.fromString(bsafeVault);
  const amount = bn.parseUnits('0.00001');
  transactionRequest.addCoinOutput(toAddress, amount);

  /* Set resources to Fuel Account */
  const wallet = await fuel.getWallet(fuelCurrentAccount);
  const resources = await wallet.getResourcesToSpend([[amount, BaseAssetId]]);
  transactionRequest.addResources(resources);

  return transactionRequest;
};

function App() {
  useEffect(() => {
    bsafe.on(WalletEnumEvents.CONNECTION, (connectionState) => {
      console.log('connectionState', connectionState);
    });
    bsafe.on(WalletEnumEvents.ACCOUNTS, async () => {
      await bsafe.accounts();
    });
    bsafe.on(WalletEnumEvents.CURRENT_ACCOUNT, async () => {
      await bsafe.currentAccount();
    });
  }, []);

  return (
    <>
      <button
        onClick={async () => {
          console.log(
            '[PAGE] connect:',
            await bsafe.connect(),
            'network',
            await bsafe.currentNetwork()
          );
        }}
      >
        CONNECT
      </button>
      <button
        onClick={async () => {
          const bsafeVaultAddress = await bsafe.currentAccount();
          const transactionRequest = await simulateTransaction(
            bsafeVaultAddress
          );

          const a = await bsafe.sendTransaction(
            bsafeVaultAddress,
            transactionRequest
          );

          console.log('[PAGE]: sendTransaction', a);
        }}
      >
        TRANSACTION
      </button>
      <button
        onClick={async () => {
          await bsafe.disconnect();
          console.log('[PAGE]: isConnected', await bsafe.isConnected());
        }}
      >
        DISCONNECT
      </button>
    </>
  );
}

export default App;
