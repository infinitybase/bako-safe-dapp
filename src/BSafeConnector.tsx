import { EventEmitter } from "events";
import { io, Socket } from "socket.io-client";
import axios, { AxiosInstance } from "axios";
import { TransactionRequestLike } from "fuels";

const URL = "http://localhost:3333";
const BSAFEAPP = "http://localhost:5173";

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
      "popup",
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
  ACCOUNTS = "accounts",
  CURRENT_ACCOUNT = "currentAccount",

  // transfer
  TRANSACTION_CREATED = "[TRANSACTION_CREATED]",
  TRANSACTION_SEND = "[TRANSACTION_SEND]",

  //connections
  CONNECTION = "connection",
  POPUP_TRANSFER = "[POPUP_TRANSFER]_connected",

  //default
  DEFAULT = "message",
}

export class BSafeConnector extends EventEmitter {
  name = "BSage Vault";
  private readonly socket: Socket;
  private readonly sessionId: string;
  private readonly api: AxiosInstance = axios.create({
    baseURL: URL,
  });

  private dAppWindow: DAppWindow;

  constructor() {
    super();
    let sessionId: string = localStorage.getItem("sessionId") || "";
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("sessionId", sessionId);
    }
    console.log(sessionId);
    this.sessionId = sessionId;

    this.socket = io(URL, {
      auth: {
        username: `${"[WALLET]"}`,
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
      const w = this.dAppWindow.open("/");
      w?.addEventListener("close", () => {
        resolve(false);
      });
      this.on(WalletEnumEvents.CONNECTION, (connection) => {
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
    //const acc = await this.currentAccount();
    return new Promise((resolve, reject) => {
      const w = this.dAppWindow.open(`/dapp/transaction`);
      w?.addEventListener("close", () => {
        reject("closed");
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
        resolve(content);
      });
    });
  }

  //   async ping() {
  //     await setTimeout(this._pingDelay);
  //     return true;
  //   }

  //   async version() {
  //     return {
  //       app: "0.0.1",
  //       network: ">=0.12.4",
  //     };
  //   }

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

  //   async disconnect() {
  //     this.emit(FuelConnectorEventTypes.connection, false);
  //     this.emit(FuelConnectorEventTypes.accounts, []);
  //     this.emit(FuelConnectorEventTypes.currentAccount, null);
  //     return false;
  //   }

  //   async signMessage(_address: string, _message: string) {
  //     const wallet = this._wallets.find((w) => w.address.toString() === _address);
  //     if (!wallet) {
  //       throw new Error("Wallet is not found!");
  //     }
  //     return wallet.signMessage(_message);
  //   }

  //   async currentAccount() {
  //     return this._accounts[0];
  //   }

  //   async assets() {
  //     return [];
  //   }

  //   async addAssets(_assets: Array<Asset>) {
  //     return true;
  //   }

  //   async addNetwork(_network: Network) {
  //     this._networks.push(_network);
  //     this.emit(FuelConnectorEventTypes.networks, this._networks);
  //     this.emit(FuelConnectorEventTypes.currentNetwork, _network);
  //     return true;
  //   }

  //   async selectNetwork(_network: Network) {
  //     this.emit(FuelConnectorEventTypes.currentNetwork, _network);
  //     return true;
  //   }

  //   async networks() {
  //     return this._networks ?? [];
  //   }

  //   async currentNetwork() {
  //     return this._networks[0];
  //   }

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
