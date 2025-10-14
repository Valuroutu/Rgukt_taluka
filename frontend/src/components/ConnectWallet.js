import React, { useState } from "react";
import { ethers } from "ethers";

const ConnectWallet = ({ setSigner, setAddress }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccountState] = useState(null);

  const connect = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    
    setSigner(signer);
    setAddress(accounts[0]);
    setAccountState(accounts[0]);
    setConnected(true);
  };

  return (
    <div className="connect-wallet-container">
  {connected && account ? (
    <p>Connected - {account}</p>
  ) : (
    <button onClick={connect} className="btn-connect">
      Connect Wallet
    </button>
  )}
</div>
  );
};

export default ConnectWallet;

