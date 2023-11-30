import { useEffect } from 'react';
import './App.css';
import { MyContractAbi__factory } from './contracts/factories/MyContractAbi__factory';
import contractIds from './contracts/contract-ids.json';
import { bn, Address, BaseAssetId } from 'fuels';

/* eslint-disable no-console */
import {
  // useAccounts,
  useDisconnect,
  useConnectUI,
  useIsConnected,
  useFuel,
  useAccount,
} from '@fuel-wallet/react';
import { FuelWalletProvider } from '@fuel-wallet/sdk';

//fuel.selectConnector(bsafe.name);
//fuel.selectConnector(bsafe.name);
/*
 * Simulate a transaction by Fuel Wallet account to Bsafe vault
 * */
// const simulateTransaction = async (bsafeVault: string) => {
//   if (!(await fuel.isConnected())) {
//     await fuel.connect();
//   }

//   const fuelCurrentAccount = await fuel.currentAccount();

//   const provider = await Provider.create('https://beta-4.fuel.network/graphql');
//   const { gasLimit, gasPrice } = await getGasConfig(provider);
//   const transactionRequest = new ScriptTransactionRequest({
//     gasLimit,
//     gasPrice,
//   });

//   /* Set assets to Bsafe vault  */
//   const toAddress = Address.fromString(bsafeVault);
//   const amount = bn.parseUnits('0.00001');
//   transactionRequest.addCoinOutput(toAddress, amount);

//   /* Set resources to Fuel Account */
//   const wallet = await fuel.getWallet(fuelCurrentAccount);
//   const resources = await wallet.getResourcesToSpend([[amount, BaseAssetId]]);
//   transactionRequest.addResources(resources);

//   return transactionRequest;
// };

function App() {
  const { connect } = useConnectUI();
  const { fuel } = useFuel();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { account } = useAccount();
  // const { wallet } = useWallet(account);
  // console.log(account);
  // console.log(wallet);
  // const { accounts } = useAccounts();
  // const { account } = useAccount();
  // const { network } = useNetwork();

  async function handleContractCall() {
    if (!account) return;
    const provider = await FuelWalletProvider.create(
      'http://localhost:4000/graphql'
    );
    const wallet = await fuel.getWallet(account, provider);
    const contract = MyContractAbi__factory.connect(
      contractIds.myContract,
      wallet
    );
    const { value, transactionId } = await contract.functions
      .return_true(10)
      .txParams({
        gasPrice: bn(1),
        gasLimit: bn(1_000_000),
      })
      .call();
    // transactionId vai ser o txID do banco de dados
    console.log(value);
    console.log(transactionId);
    console.log('[PAGE]: sendTransaction');
  }

  async function handleTransfer() {
    if (!account) return;
    // --> BSafeProvider -> extends FuelWalletProvider -> getTransactionResponse -> TransactionReponse -> waitForApproval.
    const provider = await FuelWalletProvider.create(
      'http://localhost:4000/graphql'
    );
    const wallet = await fuel.getWallet(account, provider);

    const result = await wallet.transfer(
      Address.fromRandom(),
      bn(1_000_000),
      BaseAssetId,
      {
        gasPrice: bn(1),
        gasLimit: bn(1_000_000),
      }
    );

    // const connector = await fuel.getConnector('Basfe Wallet');
    // connector.on('transaction:done', (transaction) => {
    //   console.log(transaction);
    // })

    console.log('result', result);
    try {
      const { id, status } = await result.waitForResult();
      console.log('nao loga....');
      console.log('transaction id', id);
      console.log('status', status);
    } catch (e) {
      console.log('error', e);
    }
  }

  useEffect(() => {
    fuel.on(fuel.events.connection, (connectionState: boolean) => {
      console.log('connectionState', connectionState);
    });
    fuel.on(fuel.events.accounts, async (accounts: Array<string>) => {
      console.log('accounts', accounts);
    });
    fuel.on(
      fuel.events.currentAccount,
      async (currentAccount: string | null) => {
        console.log('currentAccount', currentAccount);
      }
    );
  }, []);

  useEffect(() => {
    // console.log('[PAGE] isConnected', isConnected);
    // console.log('[PAGE] accounts', accounts);
    // console.log('[PAGE] network', network);
    // console.log('[PAGE] account', account);
    // console.log('[PAGE] accounts', accounts);
  }, [isConnected]);

  return (
    <>
      <button
        onClick={async () => {
          console.log(
            '[PAGE] connect:',
            connect(),
            'network'
            //fuel.currentAccount()
          );
        }}
      >
        CONNECT
      </button>
      <button
        onClick={() => {
          handleContractCall();
        }}
      >
        CALL CONTRACT
      </button>
      <button
        onClick={() => {
          handleTransfer();
        }}
      >
        TRANSFER
      </button>
      <button
        onClick={async () => {
          disconnect();
          console.log('[PAGE]: isConnected', await fuel.isConnected());
        }}
      >
        DISCONNECT
      </button>
    </>
  );
}

export default App;
