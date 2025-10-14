import { useState } from "react";
import { ethers } from "ethers";
import EndorsementManagerJson from "../abi/EndorsementManager.json";

const SearchByOccupation = ({ signer }) => {
  const [occupation, setOccupation] = useState("");
  const [endorsements, setEndorsements] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!occupation) return alert("Enter an occupation");
    if (!signer) return alert("Connect wallet first!");

    setLoading(true);
    try {
      const contract = new ethers.Contract(
        process.env.REACT_APP_MANAGER_ADDRESS,
        EndorsementManagerJson.abi,
        signer
      );

      const result = await contract.getEndorsementsByOccupation(occupation);

      const formatted = result.map((e) => ({
        endorser: e.endorser,
        endorsee: e.endorsee,
        endorserName: e.endorserName,
        endorseeName: e.endorseeName,
        location: e.location,
        phoneNumber: e.phoneNumber,
        reason: e.reason,
        occupation: e.occupation,
        review: e.review,
        ipfsHash: e.ipfsHash,
        timestamp: new Date(Number(e.timestamp) * 1000).toLocaleString(),
        validated: e.validated,
      }));

      setEndorsements(formatted);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch endorsements");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-bold mb-2">Search Endorsements by Occupation</h2>
      <input
        type="text"
        placeholder="Enter Occupation (e.g. Teacher)"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
        className="border p-1 w-full mb-2"
      />
      <button
        onClick={handleSearch}
        className="p-2 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {endorsements.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Results:</h3><hr/>
          {endorsements.map((e, i) => (
            <div key={i} className="border p-2 mb-2 rounded">
              <p><b>Endorser Name:</b> {e.endorserName}</p>
              <p><b>Endorser Address:</b> {e.endorser}</p>
              <p><b>Endorsee Name:</b> {e.endorseeName}</p>
              <p><b>Endorsee Address:</b> {e.endorsee}</p>
              <p><b>Location:</b> {e.location}</p>
              <p><b>Phone:</b> {e.phoneNumber}</p>
              <p><b>Occupation:</b> {e.occupation}</p>
              <p><b>Reason:</b> {e.reason}</p>
              <p><b>Review:</b> {e.review} / 5</p>
              <p><b>Validated:</b> {e.validated ? "Yes" : "No"}</p>
              {e.ipfsHash && (
                <p>
                  <b>IPFS File:</b>{" "}
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${e.ipfsHash.replace(
                      "ipfs://",
                      ""
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View File
                  </a>
                </p>
              )}
              <p><b>Timestamp:</b> {e.timestamp}</p><hr/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchByOccupation;
