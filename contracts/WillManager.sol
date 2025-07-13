// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WillManager {
    struct Will {
        address beneficiary;
        uint256 amount;
        uint256 lastPingTime;
        uint256 claimWaitTime; // Custom claim wait time in seconds
        uint256 creationTime;
        string description;
        bool isClaimed;
    }

    struct MilestoneRelease {
        address beneficiary;
        uint256 releaseTime;
        uint256 releasePercentage;
        string description;
        bool isClaimed;
    }

    struct MilestoneWill {
        uint256 totalAmount;
        uint256 claimedAmount;
        MilestoneRelease[] releases;
        bool isFullyClaimed;
    }

    mapping(address => Will) public normalWills;
    mapping(address => MilestoneWill[]) public milestoneWills;
    mapping(address => bool) public hasNormalWill;

    mapping(address => bool) private isInWillOwners;
    address[] private willOwners;

    address public platformWallet;
    uint256 public platformFeePercentage;

    event WillCreated(address indexed user, address indexed beneficiary, uint256 amount, string description, uint256 claimWaitTime);
    event MilestoneWillCreated(address indexed user, uint256 totalAmount);
    event WillClaimed(address indexed beneficiary, uint256 amount);
    event MilestoneClaimed(address indexed beneficiary, uint256 amount);
    event Ping(address indexed user);
    event RecipientUpdated(address indexed user, address indexed newRecipient);
    event DepositMade(address indexed user, uint256 amount);
    event UnclaimedWillDistributed(address indexed originalOwner, address indexed newOwner, uint256 amount);
    event WillWithdrawn(address indexed owner, uint256 amount);

    modifier onlyNormalWillOwner() {
        require(hasNormalWill[msg.sender], "No normal will exists");
        _;
    }

    constructor(address _platformWallet, uint256 _platformFeePercentage) {
        platformWallet = _platformWallet;
        platformFeePercentage = _platformFeePercentage;
    }

    function createNormalWill(address payable _beneficiary, string memory _description, uint256 _claimWaitTime) external payable {
        require(!hasNormalWill[msg.sender], "Normal will already exists");
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(msg.sender != _beneficiary, "Owner cannot be beneficiary");
        require(msg.value > 0, "Amount must be > 0");
        require(bytes(_description).length >= 50, "Description too short");
        require(_claimWaitTime >= 60, "Minimum claim wait time is 60 seconds"); // At least 1 minute

        uint256 platformFee = (msg.value * platformFeePercentage) / 100;
        uint256 willAmount = msg.value - platformFee;

        payable(platformWallet).transfer(platformFee);

        normalWills[msg.sender] = Will({
            beneficiary: _beneficiary,
            amount: willAmount,
            lastPingTime: block.timestamp,
            claimWaitTime: _claimWaitTime,
            creationTime: block.timestamp,
            description: _description,
            isClaimed: false
        });

        hasNormalWill[msg.sender] = true;
        _addToWillOwners(msg.sender);

        emit WillCreated(msg.sender, _beneficiary, willAmount, _description, _claimWaitTime);
    }

    function createMilestoneWill(
        address[] memory _beneficiaries,
        uint256[] memory _releaseTimes,
        uint256[] memory _releasePercentages,
        string[] memory _descriptions
    ) external payable {
        require(_beneficiaries.length > 0, "Invalid beneficiaries");
        require(msg.value > 0, "Amount must be > 0");

        uint256 platformFee = (msg.value * platformFeePercentage) / 100;
        uint256 willAmount = msg.value - platformFee;

        payable(platformWallet).transfer(platformFee);

        MilestoneWill storage newWill = milestoneWills[msg.sender].push();
        newWill.totalAmount = willAmount;
        newWill.claimedAmount = 0;
        newWill.isFullyClaimed = false;

        for (uint256 i = 0; i < _releaseTimes.length; i++) {
            newWill.releases.push(MilestoneRelease({
                beneficiary: _beneficiaries[i],
                releaseTime: _releaseTimes[i],
                releasePercentage: _releasePercentages[i],
                description: _descriptions[i],
                isClaimed: false
            }));
        }

        _addToWillOwners(msg.sender);
        emit MilestoneWillCreated(msg.sender, willAmount);
    }

    function claimNormalWill(address _owner) external {
        require(hasNormalWill[_owner], "No normal will");
        Will storage will = normalWills[_owner];
        
        require(msg.sender == will.beneficiary, "Not beneficiary");
        require(block.timestamp >= will.lastPingTime + will.claimWaitTime, "Too early");
        require(!will.isClaimed, "Already claimed");

        will.isClaimed = true;
        hasNormalWill[_owner] = false;
        payable(msg.sender).transfer(will.amount);

        _checkRemoveFromWillOwners(_owner);
        emit WillClaimed(msg.sender, will.amount);
    }

    function claimMilestoneWill(address _owner, uint256 willIndex, uint256 releaseIndex) external {
        require(willIndex < milestoneWills[_owner].length, "Invalid will index");
        MilestoneWill storage will = milestoneWills[_owner][willIndex];
        require(releaseIndex < will.releases.length, "Invalid release index");
        MilestoneRelease storage release = will.releases[releaseIndex];

        require(msg.sender == release.beneficiary, "Not beneficiary");
        require(!release.isClaimed, "Already claimed");
        require(block.timestamp >= release.releaseTime, "Too early");

        uint256 claimableAmount = (will.totalAmount * release.releasePercentage) / 100;
        require(will.claimedAmount + claimableAmount <= will.totalAmount, "Overclaim");

        release.isClaimed = true;
        will.claimedAmount += claimableAmount;
        payable(msg.sender).transfer(claimableAmount);

        if (will.claimedAmount == will.totalAmount) {
            will.isFullyClaimed = true;
        }

        emit MilestoneClaimed(msg.sender, claimableAmount);
    }

     function getNormalWillAsBeneficiary(address _beneficiary) external view returns (address[] memory owners, uint256[] memory amounts) {
    uint256 count = 0;

    // First, count how many wills the beneficiary is a part of
    for (uint256 i = 0; i < willOwners.length; i++) {
        address user = willOwners[i];
        if (hasNormalWill[user] && normalWills[user].beneficiary == _beneficiary && !normalWills[user].isClaimed) {
            count++;
        }
    }

    // Create arrays to store results
    owners = new address[](count);
    amounts = new uint256[](count);
    
    uint256 index = 0;

    // Populate the arrays
    for (uint256 i = 0; i < willOwners.length; i++) {
        address user = willOwners[i];
        if (hasNormalWill[user] && normalWills[user].beneficiary == _beneficiary && !normalWills[user].isClaimed) {
            owners[index] = user;
            amounts[index] = normalWills[user].amount;
            index++;
        }
    }

    return (owners, amounts);
}


    function withdrawNormalWill(uint256 amount) external onlyNormalWillOwner {
        Will storage will = normalWills[msg.sender];
        require(block.timestamp >= will.creationTime + 365 days, "Can only withdraw after 1 year");
        require(!will.isClaimed, "Will already claimed");

        uint256 withdrawableAmount = amount > will.amount ? will.amount : amount;
        will.amount -= withdrawableAmount;
        payable(msg.sender).transfer(withdrawableAmount);

        emit WillWithdrawn(msg.sender, withdrawableAmount);
    }

    function ping() external onlyNormalWillOwner {
        normalWills[msg.sender].lastPingTime = block.timestamp;
        emit Ping(msg.sender);
    }

    function updateRecipient(address newRecipient) external onlyNormalWillOwner {
        require(newRecipient != address(0), "Invalid address");
        require(msg.sender != newRecipient, "Cannot be owner");
        normalWills[msg.sender].beneficiary = newRecipient;
        emit RecipientUpdated(msg.sender, newRecipient);
    }

    function deposit() external payable onlyNormalWillOwner {
        require(msg.value > 0, "Invalid amount");
        normalWills[msg.sender].amount += msg.value;
        emit DepositMade(msg.sender, msg.value);
    }

    function _addToWillOwners(address user) private {
        if (!isInWillOwners[user]) {
            isInWillOwners[user] = true;
            willOwners.push(user);
        }
    }

    function _checkRemoveFromWillOwners(address user) private {
        if (!hasNormalWill[user] && milestoneWills[user].length == 0) {
            isInWillOwners[user] = false;
        }
    }

     function getMilestoneWillsAsBeneficiary(address _beneficiary)
        external
        view
        returns (address[] memory owners, uint256[] memory willIndexes, uint256[] memory releaseIndexes, uint256[] memory releaseAmounts)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < willOwners.length; i++) {
            address user = willOwners[i];
            for (uint256 j = 0; j < milestoneWills[user].length; j++) {
                MilestoneWill storage will = milestoneWills[user][j];
                for (uint256 k = 0; k < will.releases.length; k++) {
                    if (will.releases[k].beneficiary == _beneficiary && !will.releases[k].isClaimed) {
                        count++;
                    }
                }
            }
        }

        owners = new address[](count);
        willIndexes = new uint256[](count);
        releaseIndexes = new uint256[](count);
        releaseAmounts = new uint256[](count);

        uint256 index = 0;
        for (uint256 i = 0; i < willOwners.length; i++) {
            address user = willOwners[i];
            for (uint256 j = 0; j < milestoneWills[user].length; j++) {
                MilestoneWill storage will = milestoneWills[user][j];
                for (uint256 k = 0; k < will.releases.length; k++) {
                    if (will.releases[k].beneficiary == _beneficiary && !will.releases[k].isClaimed) {
                        owners[index] = user;
                        willIndexes[index] = j;
                        releaseIndexes[index] = k;
                        releaseAmounts[index] = (will.totalAmount * will.releases[k].releasePercentage) / 100;
                        index++;
                    }
                }
            }
        }
    }
}