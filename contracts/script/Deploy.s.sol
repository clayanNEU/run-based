// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ContributionBadges.sol";

/// @title Deploy script for ContributionBadges
/// @notice Deploys the ContributionBadges contract to Base Sepolia
/// @dev Run with: forge script script/Deploy.s.sol:Deploy --rpc-url $BASE_SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ContributionBadges badges = new ContributionBadges();
        
        console2.log("ContributionBadges deployed at:", address(badges));
        console2.log("Chain ID:", block.chainid);
        console2.log("Deployer:", msg.sender);
        
        vm.stopBroadcast();
    }
}
