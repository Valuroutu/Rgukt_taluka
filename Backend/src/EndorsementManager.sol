// SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RGUKTTalukaToken.sol";

contract EndorsementManager is Ownable {
    struct Endorsement {
        address endorser;
        address endorsee;
        string endorserName;
        string endorseeName;
        string location;
        string occupation;
        string phoneNumber;
        string reason;
        string ipfsHash;
        uint256 timestamp;
        uint8 review; 
        bool validated;
    }

    RGUKTTalukaToken public token;

    mapping(address => Endorsement[]) private endorsementsByEndorsee;
    address[] private allEndorsees;

    address[] public validators;

    event EndorsementFiled(
        address indexed endorser,
        address indexed endorsee,
        string reason,
        string ipfsHash,
        string location,
        string occupation,
        uint8 review,
        uint256 timestamp
    );

    event EndorsementValidated(
        uint256 indexed index,
        address indexed validator,
        address indexed endorser,
        uint256 timestamp
    );

    event ValidatorAdded(address indexed validator);

    constructor(address tokenAddress, address v1, address v2, address v3) Ownable(msg.sender) {
        token = RGUKTTalukaToken(tokenAddress);
        validators.push(v1);
        validators.push(v2);
        validators.push(v3);
    }

    modifier onlyValidator() {
        bool isValidator = false;
        for (uint i = 0; i < validators.length; i++) {
            if (msg.sender == validators[i]) {
                isValidator = true;
                break;
            }
        }
        require(isValidator, "Not a validator");
        _;
    }

    function fileEndorsement(
        address endorsee,
        string memory endorserName,
        string memory endorseeName,
        string memory location,
        string memory occupation,
        string memory phoneNumber,
        string memory reason,
        string memory ipfsHash,
        uint8 review
    ) external {
        require(endorsee != address(0), "Invalid endorsee");
        require(bytes(reason).length > 0, "Reason required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(bytes(endorserName).length > 0, "Endorser name required");
        require(bytes(endorseeName).length > 0, "Endorsee name required");
        require(bytes(location).length > 0, "Location required");
        require(bytes(occupation).length > 0, "Occupation required");
        require(bytes(phoneNumber).length > 0, "Phone number required");
        require(review <= 5, "Review must be between 0 and 5");

        // Add endorsee to global list if first endorsement
        if (endorsementsByEndorsee[endorsee].length == 0) {
            allEndorsees.push(endorsee);
        }

        endorsementsByEndorsee[endorsee].push(
            Endorsement({
                endorser: msg.sender,
                endorsee: endorsee,
                endorserName: endorserName,
                endorseeName: endorseeName,
                location: location,
                occupation: occupation,
                phoneNumber: phoneNumber,
                reason: reason,
                ipfsHash: ipfsHash,
                timestamp: block.timestamp,
                review: review,
                validated: false
            })
        );

        token.mint(msg.sender, 10 * 10**18); // reward endorser

        emit EndorsementFiled(
            msg.sender,
            endorsee,
            reason,
            ipfsHash,
            location,
            occupation,
            review,
            block.timestamp
        );
    }

    // ✅ New Correct Function
    function getEndorsementsByOccupation(string memory _occupation)
        public
        view
        returns (Endorsement[] memory)
    {
        uint256 totalCount = 0;

        // First loop: count matches
        for (uint256 i = 0; i < allEndorsees.length; i++) {
            Endorsement[] storage list = endorsementsByEndorsee[allEndorsees[i]];
            for (uint256 j = 0; j < list.length; j++) {
                if (
                    keccak256(abi.encodePacked(list[j].occupation)) ==
                    keccak256(abi.encodePacked(_occupation))
                ) {
                    totalCount++;
                }
            }
        }

        // Second loop: collect matches
        Endorsement[] memory results = new Endorsement[](totalCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allEndorsees.length; i++) {
            Endorsement[] storage list = endorsementsByEndorsee[allEndorsees[i]];
            for (uint256 j = 0; j < list.length; j++) {
                if (
                    keccak256(abi.encodePacked(list[j].occupation)) ==
                    keccak256(abi.encodePacked(_occupation))
                ) {
                    results[index] = list[j];
                    index++;
                }
            }
        }

        return results;
    }

    function validateEndorsement(address endorsee, uint256 index) external onlyValidator {
        require(index < endorsementsByEndorsee[endorsee].length, "Invalid index");
        Endorsement storage e = endorsementsByEndorsee[endorsee][index];
        require(!e.validated, "Already validated");

        e.validated = true;

        // Mint rewards
        token.mint(e.endorser, 10 * 10**18); // endorser reward
        token.mint(msg.sender, 5 * 10**18); // validator reward

        emit EndorsementValidated(index, msg.sender, e.endorser, block.timestamp);
    }

    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator");
        for (uint i = 0; i < validators.length; i++) {
            require(validators[i] != validator, "Validator exists");
        }
        validators.push(validator);
        emit ValidatorAdded(validator);
    }

    function getEndorsements(address endorsee)
        external
        view
        returns (
            address[] memory endorsers,
            string[] memory endorserNames,
            string[] memory endorseeNames,
            string[] memory locations,
            string[] memory occupations,
            string[] memory phoneNumbers,
            string[] memory reasons,
            string[] memory ipfsHashes,
            uint256[] memory timestamps,
            uint8[] memory reviews,
            bool[] memory validatedFlags
        )
    {
        Endorsement[] storage list = endorsementsByEndorsee[endorsee];
        uint256 len = list.length;

        endorsers = new address[](len);
        endorserNames = new string[](len);
        endorseeNames = new string[](len);
        locations = new string[](len);
        occupations = new string[](len);
        phoneNumbers = new string[](len);
        reasons = new string[](len);
        ipfsHashes = new string[](len);
        timestamps = new uint256[](len);
        reviews = new uint8[](len);
        validatedFlags = new bool[](len);

        for (uint i = 0; i < len; i++) {
            Endorsement storage e = list[i];
            endorsers[i] = e.endorser;
            endorserNames[i] = e.endorserName;
            endorseeNames[i] = e.endorseeName;
            locations[i] = e.location;
            occupations[i] = e.occupation;
            phoneNumbers[i] = e.phoneNumber;
            reasons[i] = e.reason;
            ipfsHashes[i] = e.ipfsHash;
            timestamps[i] = e.timestamp;
            reviews[i] = e.review;
            validatedFlags[i] = e.validated;
        }
    }

    function getValidators() external view returns (address[] memory) {
        return validators;
    }

    function getAllEndorsees() external view returns (address[] memory) {
        return allEndorsees;
    }
}
