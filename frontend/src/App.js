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
  const [activeSection, setActiveSection] = useState("file");
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="app-container">
      <h1 className="title">Skill Endorsement DApp</h1>

      <ConnectWallet setSigner={setSigner} setAddress={setAccount} />

      {signer && account && (
        <div className="dashboard-layout">
          
          {/* LEFT SIDEBAR */}
          <aside className="sidebar">
            <h3 className="sidebar-title">Dashboard</h3>

            <button onClick={() => setActiveSection("file")}>
              File Endorsement
            </button>

            <button onClick={() => setActiveSection("search")}>
              Search Skill
            </button>

            <button onClick={() => setActiveSection("validate")}>
              Validator Panel
            </button>

            <button onClick={() => setActiveSection("view")}>
              View Endorsements
            </button>

            <button onClick={() => setActiveSection("balance")}>
              Token Balance
            </button>
          </aside>

          {/* RIGHT CONTENT */}
          <main className="dashboard-content">
            {activeSection === "file" && (
              <FileEndorsement signer={signer} onSuccess={onRefresh} />
            )}

            {activeSection === "search" && (
              <SearchByOccupation signer={signer} />
            )}

            {activeSection === "validate" && (
              <ValidatorPanel
                signer={signer}
                account={account}
                onSuccess={onRefresh}
              />
            )}

            {activeSection === "view" && (
              <ViewEndorsements
                key={refreshKey}
                signer={signer}
                account={account}
              />
            )}

            {activeSection === "balance" && (
              <TokenBalance signer={signer} account={account} />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
