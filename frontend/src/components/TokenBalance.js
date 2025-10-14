import { useState, useEffect } from "react";
import { ethers } from "ethers";
import RGUKTTalukaTokenJson from "../abi/RGUKTTalukaToken.json";

const TokenBalance = ({ signer, account }) => {
  const [balance, setBalance] = useState("0");
  const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS; // your token address

  const fetchBalance = async () => {
    if (!signer || !account) return;
    try {
      const tokenContract = new ethers.Contract(tokenAddress, RGUKTTalukaTokenJson.abi, signer);
      const rawBalance = await tokenContract.balanceOf(account);
      setBalance(ethers.formatUnits(rawBalance, 18));
    } catch (err) {
      console.error("Error fetching token balance:", err);
      setBalance("0");
    }
  };

  useEffect(() => {
    if (account) fetchBalance();
  }, [account, signer]);

  return (
    <div className="p-4 bg-gray-800 text-white rounded w-full max-w-sm mx-auto mt-4">
      <h2 className="text-center font-bold mb-2">Your RGT Balance</h2>
      {account ? (
        <>
          <p>Connected Wallet: <strong>{account}</strong></p>
          <p>Token Balance: <strong>{balance} RGT</strong></p>
          <button
            className="btn mt-2"
            onClick={fetchBalance}
          >
            Refresh Balance
          </button>
        </>
      ) : (
        <p className="text-center">Connect your wallet to see balance</p>
      )}
    </div>
  );
};

export default TokenBalance;
