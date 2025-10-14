import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import EndorsementManagerJson from "../abi/EndorsementManager.json";

function ViewEndorsements({ signer, account }) {
  const [endorsee, setEndorsee] = useState("");
  const [endorsements, setEndorsements] = useState([]);
  const [validators, setValidators] = useState([]);

  const managerAddress = process.env.REACT_APP_MANAGER_ADDRESS;

  // Fetch validators
  const fetchValidators = async () => {
    if (!signer) return;
    try {
      const contract = new ethers.Contract(managerAddress, EndorsementManagerJson.abi, signer);
      const vals = await contract.getValidators();
      setValidators(vals.map((v) => v.toLowerCase()));
    } catch (err) {
      console.error("fetchValidators error:", err);
      setValidators([]);
    }
  };

  // Fetch endorsements for a given endorsee
  const fetchEndorsements = async () => {
    if (!signer) return alert("Connect wallet first!");
    if (!ethers.isAddress(endorsee)) return alert("Enter a valid Ethereum address");

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
      ] = await contract.getEndorsements(endorsee);

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
        index: i
      }));

      setEndorsements(formatted);
    } catch (err) {
      console.error("fetchEndorsements error:", err);
      setEndorsements([]);
    }
  };

  // Check if current account is a validator
  const isValidator = account && validators.includes(account.toLowerCase());

  useEffect(() => {
    if (signer) fetchValidators();
  }, [signer]);

  const handleValidate = async (index) => {
    if (!signer) return alert("Connect wallet first!");
    try {
      const contract = new ethers.Contract(managerAddress, EndorsementManagerJson.abi, signer);
      const tx = await contract.validateEndorsement(endorsee, index);
      await tx.wait();
      alert("✅ Endorsement validated successfully!");
      fetchEndorsements();
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || err?.message || "Validation failed");
    }
  };

  return (
    <div className="endorsements" style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <h2>📜 View Endorsements</h2>

      <input
        type="text"
        placeholder="Enter endorsee address"
        value={endorsee}
        onChange={(e) => setEndorsee(e.target.value)}
        className="input"
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <button
        onClick={fetchEndorsements}
        className="btn"
        style={{ padding: "8px 16px", marginBottom: 16 }}
      >
        Fetch
      </button>

      {endorsements.length === 0 ? (
        <p>No endorsements found.</p>
      ) : (
        endorsements.map((ed) => (
          <div
            key={`${ed.endorser}-${ed.index}`}
            className="endorsement-card"
            style={{
              border: "1px solid #ccc",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              backgroundColor:"linear-gradient(135deg, #1f2937, #111827);"
            }}
          >
            <p><strong>🧑 Endorser Address:</strong> {ed.endorser}</p>
            <p><strong>Endorser Name:</strong> {ed.endorserName}</p>
            <p><strong>Endorsee Name:</strong> {ed.endorseeName}</p>
            <p><strong>📍 Location:</strong> {ed.location}</p>
            <p><strong>💼 Occupation:</strong> {ed.occupation}</p>
            <p><strong>📞 Phone:</strong> {ed.phoneNumber}</p>
            <p><strong>📝 Reason:</strong> {ed.reason}</p>
            <p><strong>💬 Review:</strong> {ed.review}</p>
            <p><strong>🕒 Timestamp:</strong> {ed.timestamp ? new Date(ed.timestamp * 1000).toLocaleString() : "N/A"}</p>
            <p><strong>✅ Validated:</strong> {ed.validated ? "Yes" : "No"}</p>

            {ed.ipfsHash && (
              <a
                href={ed.ipfsHash.replace("ipfs://", "https://ipfs.io/ipfs/")}
                target="_blank"
                rel="noopener noreferrer"
              >
                View File on IPFS
              </a>
            )}

            {isValidator && !ed.validated && (
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn-validate"
                  onClick={() => handleValidate(ed.index)}
                  style={{ padding: "6px 12px", backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: 4 }}
                >
                  Validate
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ViewEndorsements;


