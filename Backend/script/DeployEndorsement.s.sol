// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../src/RGUKTTalukaToken.sol";
import "../src/EndorsementManager.sol";
import "forge-std/Script.sol";

contract DeployEndorsement is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy token
        RGUKTTalukaToken token = new RGUKTTalukaToken(1_000_000 * 10**18);

        // Deploy manager with 3 validators
        EndorsementManager manager = new EndorsementManager(
            address(token),
            0x14dC79964da2C08b23698B3D3cc7Ca32193d9955,
            0xa0Ee7A142d267C1f36714E4a8F75612F20a79720,
            0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        );

        // Transfer token ownership to manager for rewards
        token.transferOwnership(address(manager));

        vm.stopBroadcast();
    }
}
