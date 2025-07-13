// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.28;

contract SmartWill {

    struct Will{
        uint256 startTime;
        uint256 lastVisited;
        uint256 tenYears;
        address payable recipient;
        string description;  // Added description field
        bool exists;
    }

    mapping(address => Will) public wills;
    address[] private willCreators; // Array to track all will creators

    event WillCreated(address indexed creator, address indexed recipient);
    event Ping(address indexed creator);
    event Claimed(address indexed recipient, uint256 amount);
    event RecipientChanged(address indexed creator, address indexed newRecipient);
    event DepositMade(address indexed creator, uint256 amount, address indexed newRecipient);

    modifier willExists(address creator){
        require(wills[creator].exists, "Will doesn't exist!");
        _;
    }

    modifier onlyRecipient(address creator) {
        require(msg.sender == wills[creator].recipient, "Caller is not the recipient");
        _;
    }

    modifier onlyWillOwner() {
        require(wills[msg.sender].exists, "Will doesn't exist!");
        _;
    }

    function createWill(address payable _recipient, string memory _description) external payable {
        require(!wills[msg.sender].exists, "Will already exists for sender");
        require(_recipient != address(0), "Recipient cannot be zero address");
        require(msg.sender != _recipient, "Owner cannot be the recipient");
        require(msg.value > 0, "Initial deposit required");
        require(bytes(_description).length >= 50, "Description must be at least 50 characters");

        wills[msg.sender] = Will({
            startTime: block.timestamp,
            lastVisited: block.timestamp,
            tenYears: 10 * 365 days,
            recipient: _recipient,
            description: _description,
            exists: true
        });

        willCreators.push(msg.sender);
        emit WillCreated(msg.sender, _recipient);
    }

    // Function to check if an address has created a will
    function hasCreatedWill(address _address) public view returns (bool) {
        return wills[_address].exists;
    }

    // Function to get all wills
    function getAllWills() public view returns (address[] memory) {
        return willCreators;
    }

    // Function to get the total count of wills
    function getTotalWills() public view returns (uint256) {
        return willCreators.length;
    }

    // Function to get details of a will by creator address
    function getWillDetails(address creator) public view returns (
        uint256 startTime,
        uint256 lastVisited,
        uint256 tenYears,
        address recipient,
        string memory description,
        bool exists
    ) {
        Will storage will = wills[creator];
        return (
            will.startTime,
            will.lastVisited,
            will.tenYears,
            will.recipient,
            will.description,
            will.exists
        );
    }

    function ping() external onlyWillOwner willExists(msg.sender) {
        wills[msg.sender].lastVisited = block.timestamp;
        emit Ping(msg.sender);
    }

    function claim(address creator) external willExists(creator) onlyRecipient(creator) {
        Will storage willData = wills[creator];
        require(block.timestamp > willData.lastVisited + willData.tenYears, "Owner is still active");
        require(address(this).balance > 0, "No funds to claim");

        uint256 amount = address(this).balance;
        willData.recipient.transfer(amount);
        
        // Remove the will from the creators array
        for(uint i = 0; i < willCreators.length; i++) {
            if(willCreators[i] == creator) {
                willCreators[i] = willCreators[willCreators.length - 1];
                willCreators.pop();
                break;
            }
        }
        
        delete wills[creator];
        emit Claimed(willData.recipient, amount);
    }

    function changeRecipient(address payable newRecipient) external onlyWillOwner willExists(msg.sender) {
        require(newRecipient != address(0), "New recipient cannot be zero address");
        require(msg.sender != newRecipient, "Owner cannot be the recipient");
        wills[msg.sender].recipient = newRecipient;
        wills[msg.sender].lastVisited = block.timestamp;
        emit Ping(msg.sender);
        emit RecipientChanged(msg.sender, newRecipient);
    }

    function deposit(address payable newRecipient) external payable onlyWillOwner willExists(msg.sender) {
        require(msg.value > 0, "Deposit must be greater than 0");
        require(newRecipient != address(0), "New recipient cannot be zero address");
        require(msg.sender != newRecipient, "Owner cannot be the recipient");

        wills[msg.sender].recipient = newRecipient;
        wills[msg.sender].lastVisited = block.timestamp;
        emit Ping(msg.sender);
        emit DepositMade(msg.sender, msg.value, newRecipient);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}