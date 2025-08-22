// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ContributionBadgesV2} from "../src/ContributionBadgesV2.sol";

contract DeployV2 is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        ContributionBadgesV2 contributionBadges = new ContributionBadgesV2();
        
        console.log("ContributionBadgesV2 deployed to:", address(contributionBadges));
        console.log("USDC Address (Base):", address(contributionBadges.USDC()));
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        vm.stopBroadcast();
    }
}
