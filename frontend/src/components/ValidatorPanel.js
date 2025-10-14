import { useState, useEffect } from "react";
import { ethers } from "ethers";
import EndorsementManagerJson from "../abi/EndorsementManager.json";

const ValidatorPanel = ({ signer, account, onSuccess }) => {
  const [endorseeAddr, setEndorseeAddr] = useState("");
  const [endorsements, setEndorsements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newValidator, setNewValidator] = useState("");

  const managerAddress = process.env.REACT_APP_MANAGER_ADDRESS;

  const validators = [
    "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  ].map((a) => a.toLowerCase());

  const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (!account) return;
    const lower = account.toLowerCase();
    setIsAllowed(validators.includes(lower) || lower === owner.toLowerCase());
  }, [account]);

  const fetchEndorsements = async () => {
    if (!signer || !endorseeAddr) return;
    try {
      const contract = new ethers.Contract(managerAddress, EndorsementManagerJson.abi, signer);
      const [
        endorsers,
        endorserNames,
        endorseeNames,
        locations,
        occupations,
        phoneNumbers,
        reasons,
        ipfsHashes,
        timestamps,
        reviews,
        validatedFlags
      ] = await contract.getEndorsements(endorseeAddr);

      const formatted = endorsers.map((_, i) => ({
        endorser: endorsers[i],
        endorserName: endorserNames[i],
        endorseeName: endorseeNames[i],
        location: locations[i],
        occupation: occupations[i],
        phoneNumber: phoneNumbers[i],
        reason: reasons[i],
        ipfsHash: ipfsHashes[i],
        timestamp: Number(timestamps[i]),
        review: Number(reviews[i]),
        validated: validatedFlags[i],
        index: i,
      }));

      setEndorsements(formatted); // ✅ replace previous data
    } catch (err) {
      console.error(err);
      setEndorsements([]); // clear previous data
      alert("Failed to fetch endorsements");
    }
  };

  const validate = async (index) => {
    if (!signer) return alert("Connect wallet first!");
    setLoading(true);
    try {
      const contract = new ethers.Contract(managerAddress, EndorsementManagerJson.abi, signer);
      const tx = await contract.validateEndorsement(endorseeAddr, index);
      await tx.wait();
      alert("✅ Endorsement validated and rewarded with 5 RGUKT tokens!");
      fetchEndorsements(); // refresh data
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || err?.message || "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  const addValidator = async () => {
    if (!signer) return alert("Connect wallet first!");
    if (!ethers.isAddress(newValidator)) return alert("Enter a valid address");

    setLoading(true);
    try {
      const contract = new ethers.Contract(managerAddress, EndorsementManagerJson.abi, signer);
      const tx = await contract.addValidator(newValidator);
      await tx.wait();
      alert("✅ Validator added successfully!");
      setNewValidator("");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || err?.message || "Add validator failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAllowed) return null;

  return (
    <div className="validator-panel">
      <h2>🔍 Validator Panel</h2>

      <input
        type="text"
        placeholder="Enter Endorsee Address"
        value={endorseeAddr}
        onChange={(e) => setEndorseeAddr(e.target.value)}
      />
      <button onClick={fetchEndorsements}>Fetch Endorsements</button>

      {endorsements.length > 0 && (
        <div className="endorsements-list">
          {endorsements.map((ed) => (
            <div key={ed.index} className="endorsement-card">
              <p><strong>👤 Endorser Address:</strong> {ed.endorser}</p>
              <p><strong>Endorser Name:</strong> {ed.endorserName}</p>
              <p><strong>Endorsee Name:</strong> {ed.endorseeName}</p>
              <p><strong>📍 Location:</strong> {ed.location}</p>
              <p><strong>💼 Occupation:</strong> {ed.occupation}</p>
              <p><strong>📞 Phone:</strong> {ed.phoneNumber}</p>
              <p><strong>📝 Reason:</strong> {ed.reason}</p>
              <p><strong>💬 Review:</strong> {ed.review}</p>
              <p><strong>🕒 Timestamp:</strong> {new Date(ed.timestamp * 1000).toLocaleString()}</p>
              <p><strong>✅ Validated:</strong> {ed.validated ? "Yes" : "No"}</p>

              {ed.ipfsHash && (
                <a href={ed.ipfsHash.replace("ipfs://", "https://ipfs.io/ipfs/")} target="_blank" rel="noopener noreferrer">
                  View File on IPFS
                </a>
              )}

              {!ed.validated && (
                <button onClick={() => validate(ed.index)} disabled={loading}>
                  {loading ? "Validating..." : "Validate"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {account?.toLowerCase() === owner.toLowerCase() && (
        <>
          <hr />
          <h3>👑 Owner Controls</h3>
          <input
            type="text"
            placeholder="New Validator Address"
            value={newValidator}
            onChange={(e) => setNewValidator(e.target.value)}
          />
          <button onClick={addValidator} disabled={loading}>
            {loading ? "Adding..." : "Add Validator"}
          </button>
        </>
      )}
    </div>
  );
};

export default ValidatorPanel;
