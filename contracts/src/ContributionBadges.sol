// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC1155 } from "openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import { Ownable } from "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title ContributionBadges
/// @notice ERC-1155 badges for run-club contributions with tipping functionality
/// @dev Soulbound NFTs that cannot be transferred, with on-chain stats and ETH tipping
contract ContributionBadges is ERC1155, Ownable {
    error NonTransferable();
    
    // NFT IDs for the four contribution buttons
    uint256 public constant ATTEND = 1;    // ✅ Attend button
    uint256 public constant HOST = 2;      // 🏁 Host button  
    uint256 public constant PACE = 3;      // ⏱️ Pace button
    uint256 public constant SUPPLIES = 4;  // 🧃 Supplies button
    
    // User data stored on-chain
    struct UserStats {
        uint256 totalPoints;
        uint256 currentStreak;
        string lastAttendDate;
        uint256 totalTipsReceived;
        uint256 totalTipsSent;
    }
    
    mapping(address => UserStats) public userStats;
    mapping(address => mapping(uint256 => string)) public lastContribution;
    mapping(address => string[]) public unlockedBadges;
    
    // Events for frontend updates
    event ContributionMade(address indexed user, uint256 contributionType, string date, uint256 newPoints, uint256 newStreak);
    event TipSent(address indexed from, address indexed to, uint256 amount, string message);
    event BadgeUnlocked(address indexed user, string badgeName);
    
    constructor() ERC1155("https://run-based.vercel.app/api/metadata/{id}") Ownable(msg.sender) {}
    
    /// @notice Main function to handle all four contribution buttons
    /// @param contributionType The type of contribution (1=ATTEND, 2=HOST, 3=PACE, 4=SUPPLIES)
    function makeContribution(uint256 contributionType) external {
        require(contributionType >= 1 && contributionType <= 4, "Invalid contribution type");
        
        string memory today = _getCurrentDate();
        require(
            keccak256(bytes(lastContribution[msg.sender][contributionType])) != keccak256(bytes(today)),
            "Already contributed this type today"
        );
        
        // Mint NFT badge
        _mint(msg.sender, contributionType, 1, "");
        lastContribution[msg.sender][contributionType] = today;
        
        // Update points based on contribution type
        uint256 points = _getPointsForType(contributionType);
        userStats[msg.sender].totalPoints += points;
        
        // Update streak (only for attendance)
        if (contributionType == ATTEND) {
            _updateStreak(msg.sender, today);
        }
        
        // Check for badge unlocks
        _checkBadgeUnlocks(msg.sender);
        
        emit ContributionMade(
            msg.sender, 
            contributionType, 
            today, 
            userStats[msg.sender].totalPoints,
            userStats[msg.sender].currentStreak
        );
    }
    
    /// @notice Tip a contributor with ETH and a message
    /// @param contributor The address to tip
    /// @param message A message to accompany the tip
    function tipContributor(address contributor, string memory message) external payable {
        require(msg.value > 0, "Must send ETH");
        require(contributor != msg.sender, "Cannot tip yourself");
        
        // Update tip tracking
        userStats[msg.sender].totalTipsSent += msg.value;
        userStats[contributor].totalTipsReceived += msg.value;
        
        // Direct ETH transfer
        payable(contributor).transfer(msg.value);
        
        emit TipSent(msg.sender, contributor, msg.value, message);
    }
    
    /// @notice Get all user data in one call (gas efficient for frontend)
    /// @param user The user address to query
    /// @return contributions Array of NFT counts [attend, host, pace, supplies]
    /// @return stats User stats struct
    /// @return badges Array of unlocked badge names
    function getUserData(address user) external view returns (
        uint256[4] memory contributions,
        UserStats memory stats,
        string[] memory badges
    ) {
        contributions = [
            balanceOf(user, ATTEND),
            balanceOf(user, HOST),
            balanceOf(user, PACE),
            balanceOf(user, SUPPLIES)
        ];
        stats = userStats[user];
        badges = unlockedBadges[user];
    }
    
    /// @notice Update streak for attendance contributions
    /// @param user The user address
    /// @param today Today's date string
    function _updateStreak(address user, string memory today) internal {
        string memory yesterday = _getYesterday();
        UserStats storage stats = userStats[user];
        
        if (keccak256(bytes(stats.lastAttendDate)) == keccak256(bytes(yesterday))) {
            stats.currentStreak += 1; // Continue streak
        } else if (keccak256(bytes(stats.lastAttendDate)) != keccak256(bytes(today))) {
            stats.currentStreak = 1; // Reset streak
        }
        // If same day, keep current streak
        
        stats.lastAttendDate = today;
    }
    
    /// @notice Check and award achievement badges
    /// @param user The user address to check
    function _checkBadgeUnlocks(address user) internal {
        // First Stride badge
        if (balanceOf(user, ATTEND) == 1 && !_hasBadge(user, "First Stride")) {
            unlockedBadges[user].push("First Stride");
            emit BadgeUnlocked(user, "First Stride");
        }
        
        // 50 Club badge  
        if (userStats[user].totalPoints >= 50 && !_hasBadge(user, "50 Club")) {
            unlockedBadges[user].push("50 Club");
            emit BadgeUnlocked(user, "50 Club");
        }
        
        // Week Warrior badge
        if (userStats[user].currentStreak >= 7 && !_hasBadge(user, "Week Warrior")) {
            unlockedBadges[user].push("Week Warrior");
            emit BadgeUnlocked(user, "Week Warrior");
        }
        
        // Host Hero badge
        if (balanceOf(user, HOST) >= 5 && !_hasBadge(user, "Host Hero")) {
            unlockedBadges[user].push("Host Hero");
            emit BadgeUnlocked(user, "Host Hero");
        }
    }
    
    /// @notice Check if user has a specific badge
    /// @param user The user address
    /// @param badgeName The badge name to check
    /// @return Whether the user has the badge
    function _hasBadge(address user, string memory badgeName) internal view returns (bool) {
        string[] memory badges = unlockedBadges[user];
        for (uint i = 0; i < badges.length; i++) {
            if (keccak256(bytes(badges[i])) == keccak256(bytes(badgeName))) {
                return true;
            }
        }
        return false;
    }
    
    /// @notice Get points for contribution type
    /// @param contributionType The contribution type
    /// @return Points awarded for this contribution type
    function _getPointsForType(uint256 contributionType) internal pure returns (uint256) {
        if (contributionType == ATTEND) return 10;   // ✅ Attend = 10 points
        if (contributionType == HOST) return 50;     // 🏁 Host = 50 points
        if (contributionType == PACE) return 20;     // ⏱️ Pace = 20 points
        if (contributionType == SUPPLIES) return 15; // 🧃 Supplies = 15 points
        return 0;
    }
    
    /// @notice Get current date as string (simplified for hackathon)
    /// @return Current date string
    function _getCurrentDate() internal view returns (string memory) {
        return string(abi.encodePacked("day-", _toString(block.timestamp / 86400)));
    }
    
    /// @notice Get yesterday's date as string
    /// @return Yesterday's date string
    function _getYesterday() internal view returns (string memory) {
        return string(abi.encodePacked("day-", _toString((block.timestamp / 86400) - 1)));
    }
    
    /// @notice Convert uint to string
    /// @param value The uint to convert
    /// @return String representation
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // Make NFTs soulbound (non-transferable)
    function safeTransferFrom(address, address, uint256, uint256, bytes memory) public virtual override {
        revert NonTransferable();
    }
    
    function safeBatchTransferFrom(address, address, uint256[] memory, uint256[] memory, bytes memory) public virtual override {
        revert NonTransferable();
    }
}
