import { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import EndorsementManagerJson from "../abi/EndorsementManager.json";

const FileEndorsement = ({ signer, onSuccess }) => {
  const [endorsee, setEndorsee] = useState("");
  const [endorserName, setEndorserName] = useState("");
  const [endorseeName, setEndorseeName] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [review, setReview] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadToPinata = async (f) => {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const formData = new FormData();
    formData.append("file", f);
    try {
      const res = await axios.post(url, formData, {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data`,
          pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
          pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
        },
      });
      return `ipfs://${res.data.IpfsHash}`;
    } catch (err) {
      console.error("IPFS upload error:", err?.response?.data || err.message);
      throw new Error("IPFS upload failed");
    }
  };

  const handleSubmit = async () => {
    if (!signer) return alert("Connect wallet first!");
    if (
      !endorsee ||
      !endorserName ||
      !endorseeName ||
      !location ||
      !occupation ||
      !phoneNumber ||
      !reason ||
      !file ||
      !review
    ) {
      return alert("All fields are required");
    }

    if (isNaN(review) || review < 0 || review > 5)
      return alert("Review must be a number between 0 and 5");

    setLoading(true);
    try {
      const ipfsHash = await uploadToPinata(file);

      const contract = new ethers.Contract(
        process.env.REACT_APP_MANAGER_ADDRESS,
        EndorsementManagerJson.abi,
        signer
      );

      const tx = await contract.fileEndorsement(
        endorsee,
        endorserName,
        endorseeName,
        location,
        occupation,
        phoneNumber,
        reason,
        ipfsHash,
        parseInt(review)
      );

      await tx.wait();

      alert("✅ Endorsement filed successfully! You earned 10 RGUKT tokens.");
      setEndorsee("");
      setEndorserName("");
      setEndorseeName("");
      setLocation("");
      setOccupation("");
      setPhoneNumber("");
      setReason("");
      setReview("");
      setFile(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || err?.message || "Failed to file endorsement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-md mx-auto">
      <h2 className="font-bold mb-3 text-lg">File Endorsement</h2>

      <input
        type="text"
        placeholder="Endorsee Address"
        value={endorsee}
        onChange={(e) => setEndorsee(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <input
        type="text"
        placeholder="Endorser Name"
        value={endorserName}
        onChange={(e) => setEndorserName(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <input
        type="text"
        placeholder="Endorsee Name"
        value={endorseeName}
        onChange={(e) => setEndorseeName(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <input
        type="text"
        placeholder="Occupation"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <input
        type="text"
        placeholder="Reason for Endorsement"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <input
        type="number"
        placeholder="Review (0–5)"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
        min="0"
        max="5"
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-2 w-full mb-2 rounded"
      />

      <button
        onClick={handleSubmit}
        className="p-2 bg-green-600 text-white rounded w-full"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Endorsement"}
      </button>
    </div>
  );
};

export default FileEndorsement;
