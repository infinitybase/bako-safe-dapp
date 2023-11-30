/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import axios, { AxiosInstance } from 'axios';
import { JsonAbi, TransactionRequestLike } from 'fuels';
import { Asset } from '@fuel-wallet/types';

const URL = 'http://localhost:3333';
const BSAFEAPP = 'http://localhost:5173';

type FuelABI = JsonAbi;
type Network = {
  url: string;
  chainId: number;
};

class DAppWindow {
  constructor(
    private config: {
      popup: {
        top: number;
        left: number;
        width: number;
        height: number;
      };
      sessionId: string;
      name: string;
      origin: string;
    }
  ) {}

  open(method: string) {
    const { popup } = this.config;

    return window.open(
      `${BSAFEAPP}${method}${this.queryString}`,
      'popup',
      `left=${popup.left},top=${popup.top},width=${popup.width},height=${popup.height}`
    );
  }

  private get queryString() {
    const { origin, name, sessionId } = this.config;
    return `?sessionId=${sessionId}&name=${name}&origin=${origin}`;
  }
}

// low                    -> wallet
// high with []           -> socket server[api]
// high with []_type      -> popup
export enum WalletEnumEvents {
  //accounts
  ACCOUNTS = 'accounts',
  CURRENT_ACCOUNT = 'currentAccount',

  // transfer
  TRANSACTION_CREATED = '[TRANSACTION_CREATED]',
  TRANSACTION_SEND = '[TRANSACTION_SEND]',

  //popup auth
  AUTH_CONFIRMED = '[AUTH_CONFIRMED]',
  AUTH_REJECTED = '[AUTH_REJECTED]',
  AUTH_DISCONECT_DAPP = '[AUTH_DISCONECT_DAPP]',
  AUTH_DISCONECT_CONFIRM = '[AUTH_DISCONECT_CONFIRM]',

  //connections
  CONNECTION = 'connection',
  POPUP_TRANSFER = '[POPUP_TRANSFER]_connected',
  CONNECTED_NETWORK = '[CONNECTED_NETWORK]',

  //default
  DEFAULT = 'message',
}

export class BSafeConnector extends EventEmitter {
  name = 'BSage Vault';
  metadata = {
    image: 'https://avatars.githubusercontent.com/u/8186664?s=200&v=4',
    install: {
      action: 'https://chrome.google.com/webstore/detail/bsafe-vault',
      link: 'google.com',
      description:
        'BSafe Vault is a browser extension that allows you to interact with the BSafe Network.',
    },
  };
  installed: boolean = true;
  connected: boolean = false;

  private readonly socket: Socket;
  private readonly sessionId: string;
  private readonly api: AxiosInstance = axios.create({
    baseURL: URL,
  });
  private dAppWindow: DAppWindow;

  constructor() {
    super();
    let sessionId: string = localStorage.getItem('sessionId') || '';
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
    }

    this.sessionId = sessionId;

    this.socket = io(URL, {
      auth: {
        username: `${'[WALLET]'}`,
        data: new Date(),
        sessionId: this.sessionId,
        origin: window.origin,
      },
    });

    this.dAppWindow = new DAppWindow({
      sessionId,
      name: document.title,
      origin: window.origin,
      popup: {
        top: 0,
        left: 2560,
        width: 450,
        height: 1280,
      },
    });

    this.socket.on(WalletEnumEvents.DEFAULT, (message) => {
      this.emit(message.type, ...message.data);
    });
  }

  async connect() {
    return new Promise((resolve) => {
      const w = this.dAppWindow.open('/');
      w?.addEventListener('close', () => {
        resolve(false);
      });
      this.on(WalletEnumEvents.CONNECTION, (connection) => {
        this.connected = connection;
        resolve(connection);
      });
    });
  }

  /*
   * @param {string} address - The address to sign the transaction
   * @param {Transaction} transaction - The transaction to send
   *
   * @returns {string} - The transaction id
   */
  async sendTransaction(
    _address: string,
    _transaction: TransactionRequestLike
  ) {
    console.log('[SEND_TRANSACTION]: ', _address, _transaction);
    return new Promise((resolve, reject) => {
      const w = this.dAppWindow.open(`/dapp/transaction`);
      w?.addEventListener('close', () => {
        reject('closed');
      });
      this.on(WalletEnumEvents.POPUP_TRANSFER, () => {
        this.socket.emit(WalletEnumEvents.TRANSACTION_SEND, {
          to: `${this.sessionId}:${window.origin}`,
          content: {
            address: _address,
            transaction: _transaction,
          },
        });
      });
      this.on(WalletEnumEvents.TRANSACTION_CREATED, (content) => {
        console.log('TRANSACTION_CREATED', content);
        resolve(`0x${content}`);
      });
    });
  }

  async ping() {
    return true;
  }

  //todo: make a file on sdk, to return this object
  async version() {
    return {
      app: '0.0.1',
      network: '>=0.12.4',
    };
  }

  async isConnected() {
    const { data } = await this.api.get(
      `${URL}/connections/${this.sessionId}/state`
    );

    return data;
  }

  async accounts() {
    const { data } = await this.api.get(
      `${URL}/connections/${this.sessionId}/accounts`
    );
    return data;
  }

  async currentAccount() {
    const { data } = await this.api.get(
      `${URL}/connections/${this.sessionId}/currentAccount`
    );
    return data;
  }

  async disconnect() {
    this.socket.emit(WalletEnumEvents.AUTH_DISCONECT_DAPP, {
      to: `${this.sessionId}:${window.origin}`,
      content: {
        sessionId: this.sessionId,
      },
    });
    this.emit(WalletEnumEvents.CONNECTION, false);
    this.emit(WalletEnumEvents.ACCOUNTS, []);
    this.emit(WalletEnumEvents.CURRENT_ACCOUNT, null);
    return false;
  }

  async currentNetwork() {
    const { data } = await this.api.get(
      `${URL}/connections/${this.sessionId}/currentNetwork`
    );

    console.log('[currentNetwork]: ', data);
    return data;
  }

  async assets(): Promise<Array<Asset>> {
    return [];
  }

  async signMessage(address: string, message: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async addAssets(assets: Asset[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addAsset(assets: Asset): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addNetwork(networkUrl: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async selectNetwork(network: Network): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async networks(): Promise<Array<Network>> {
    throw new Error('Method not implemented.');
  }

  async addABI(contractId: string, abi: FuelABI): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async getABI(id: string): Promise<FuelABI | null> {
    throw new Error('Method not implemented.');
  }

  async hasABI(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  //   async addABI(_contractId: string, _abi: FuelABI) {
  //     return true;
  //   }

  //   async getABI(_id: string) {
  //     return null;
  //   }

  //   async hasABI(_id: string) {
  //     return true;
  //   }
}
