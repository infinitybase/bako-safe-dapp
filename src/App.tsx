import './App.css';
import { MyContractAbi__factory } from './contracts/contracts/factories/MyContractAbi__factory';
import contractIds from './contracts/contract-ids.json';
import { bn, Address, BaseAssetId } from 'fuels';
import { defaultConfigurable } from 'bsafe';
/* eslint-disable no-console */
import {
  useDisconnect,
  useConnectUI,
  useIsConnected,
  useFuel,
  useAccount,
  //useNetwork,
} from '@fuel-wallet/react';
import { FuelWalletProvider } from '@fuel-wallet/sdk';
//import { useEffect } from 'react';

interface IHandleTransfer {
  assetId?: string;
  amount?: string;
}

function App() {
  const { connect } = useConnectUI();
  const { fuel } = useFuel();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { account } = useAccount();
  //  const { network } = useNetwork();

  // useEffect(() => {
  //   console.log('[network]: ', network);
  // }, [isConnected]);

  async function handleContractCall() {
    if (!account) return;
    const provider = await FuelWalletProvider.create(
      defaultConfigurable['provider']
    );
    //console.log(provider);
    const wallet = await fuel.getWallet(account, provider);
    const contract = MyContractAbi__factory.connect(
      contractIds.myContract,
      wallet
    );
    // await wallet.getBalance(); -> recive balance of predicate
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
    //console.log('[PAGE]: sendTransaction');
  }

  async function handleTransfer(params?: IHandleTransfer) {
    // --> BSafeProvider -> extends FuelWalletProvider -> getTransactionResponse -> TransactionReponse -> waitForApproval.
    const { assetId, amount } = params ?? {};
    //console.log(account, defaultConfigurable['provider']);
    if (!account) return;
    const provider = await FuelWalletProvider.create(
      defaultConfigurable['provider']
    );
    //console.log(provider);
    const wallet = await fuel.getWallet(account, provider);
    // await wallet.getBalance(); -> recive balance of predicate

    const result = await wallet.transfer(
      Address.fromString(
        'fuel1rjlvmq9q25l4388940wpepyceksex5la0wd7093vgwmar0tqn0yscnd0u2'
      ), // todo: move to dynamic this address, this static address is from 'STORE' in mock API
      bn(amount ?? 1_000),
      assetId ?? BaseAssetId,
      {
        gasPrice: bn(1),
        gasLimit: bn(1_000_000),
      }
    );
    //console.log('result: ', result);
    try {
      const { id, status } = await result.waitForResult();
      console.log('result: ', {
        id,
        status,
      });
      //todo: dispatch toast with transaction status and redirect to block explorer
    } catch (e) {
      console.log('error: ', e);
      //todo: 'dispatch toast with error message';
    }
  }

  return (
    <>
      <button
        onClick={async () => {
          connect(),
        }}
      >
        CONNECT
      </button>
      {isConnected && (
        <>
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
            }}
          >
            DISCONNECT
          </button>
        </>
      )}
    </>
  );
}

export default App;
