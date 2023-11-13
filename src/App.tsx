import { useEffect } from "react";
import { BSafeConnector, WalletEnumEvents } from "./BSafeConnector";
import { txData } from "./txdata";
import "./App.css";
import { transactionRequestify } from "fuels";

const bsafe = new BSafeConnector();

function App() {
  useEffect(() => {
    bsafe.on(WalletEnumEvents.CONNECTION, (connectionState) => {
      console.log("connectionState", connectionState);
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
          console.log("[PAGE] connect:", await bsafe.connect());
        }}
      >
        CONNECT
      </button>
      <button
        onClick={async () => {
          const a = await bsafe.sendTransaction(
            await bsafe.currentAccount(),
            transactionRequestify(JSON.parse(txData))
          );

          console.log("[PAGE]: sendTransaction", a);
        }}
      >
        TRANSACTION
      </button>
    </>
  );
}

export default App;
