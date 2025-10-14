
import React, { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import FileEndorsement from "./components/FileEndorsement";
import ViewEndorsements from "./components/ViewEndorsements";
import ValidatorPanel from "./components/ValidatorPanel";
import TokenBalance from "./components/TokenBalance";
import SearchByOccupation from "./components/SearchByOccupation";
import "./App.css";

function App() {
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="app-container">
      <h1 className="title"> Skill Endorsement DApp </h1>

      <ConnectWallet setSigner={setSigner} setAddress={setAccount} />

      {signer && account && (
        <>
          <FileEndorsement signer={signer} onSuccess={onRefresh} />
           <SearchByOccupation signer={signer} />
          <ValidatorPanel signer={signer} account={account} onSuccess={onRefresh} />
          <ViewEndorsements key={refreshKey} signer={signer} account={account} />
          <TokenBalance signer={signer} account={account} />
        </>
      )}
    </div>
  );
}

export default App;
