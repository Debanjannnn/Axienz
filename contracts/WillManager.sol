// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SmartWill {
    struct Will {
        uint256 startTime;
        uint256 lastVisited;
        uint256 tenYears;
        address payable recipient;
        string description;
        bool exists;
        uint256 totalDeposited;  // Track total amount deposited
        uint256 depositCount;    // Track number of deposits
    }

    struct Activity {
        uint256 timestamp;
        string activityType;     // "CREATED", "PING", "DEPOSIT", "RECIPIENT_CHANGED", "CLAIMED"
        uint256 amount;          // Amount involved (0 for non-monetary activities)
        address relatedAddress;  // Recipient address for context
        string description;      // Activity description
    }

    struct UserActivity {
        bool hasActivity;
        Activity[] activities;
        uint256 totalActivities;
        uint256 lastActivityTime;
    }

    mapping(address => Will) public wills;
    mapping(address => UserActivity) private userActivities;
    address[] private willCreators;

    // Events
    event WillCreated(address indexed creator, address indexed recipient, uint256 amount, string description);
    event Ping(address indexed creator, uint256 timestamp);
    event Claimed(address indexed recipient, uint256 amount, address indexed creator);
    event RecipientChanged(address indexed creator, address indexed oldRecipient, address indexed newRecipient);
    event DepositMade(address indexed creator, uint256 amount, address indexed recipient);
    event ActivityRecorded(address indexed user, string activityType, uint256 timestamp);

    modifier willExists(address creator) {
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

    // New modifier to check if will time has passed
    modifier willNotExpired(address creator) {
        require(block.timestamp <= wills[creator].lastVisited + wills[creator].tenYears, "Will has expired - only beneficiary can claim");
        _;
    }

    // New modifier to check if will time has passed (for claim function)
    modifier willExpired(address creator) {
        require(block.timestamp > wills[creator].lastVisited + wills[creator].tenYears, "Owner is still active");
        _;
    }

    // Internal function to record user activity
    function _recordActivity(
        address user,
        string memory activityType,
        uint256 amount,
        address relatedAddress,
        string memory description
    ) internal {
        UserActivity storage userActivity = userActivities[user];
        
        if (!userActivity.hasActivity) {
            userActivity.hasActivity = true;
        }

        Activity memory newActivity = Activity({
            timestamp: block.timestamp,
            activityType: activityType,
            amount: amount,
            relatedAddress: relatedAddress,
            description: description
        });

        userActivity.activities.push(newActivity);
        userActivity.totalActivities++;
        userActivity.lastActivityTime = block.timestamp;

        emit ActivityRecorded(user, activityType, block.timestamp);
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
            exists: true,
            totalDeposited: msg.value,
            depositCount: 1
        });

        willCreators.push(msg.sender);

        // Record activity for will creator
        _recordActivity(
            msg.sender,
            "CREATED",
            msg.value,
            _recipient,
            string(abi.encodePacked("Created will with initial deposit of ", _uint2str(msg.value), " wei for recipient"))
        );

        // Record activity for recipient (they can see they were added as beneficiary)
        _recordActivity(
            _recipient,
            "BENEFICIARY_ADDED",
            msg.value,
            msg.sender,
            string(abi.encodePacked("Added as beneficiary to will created by ", _addressToString(msg.sender)))
        );

        emit WillCreated(msg.sender, _recipient, msg.value, _description);
    }

    function ping() external onlyWillOwner willExists(msg.sender) willNotExpired(msg.sender) {
        wills[msg.sender].lastVisited = block.timestamp;

        _recordActivity(
            msg.sender,
            "PING",
            0,
            wills[msg.sender].recipient,
            "Updated will activity status"
        );

        emit Ping(msg.sender, block.timestamp);
    }

    function claim(address creator) external willExists(creator) onlyRecipient(creator) willExpired(creator) {
        Will storage willData = wills[creator];
        require(address(this).balance > 0, "No funds to claim");

        uint256 amount = address(this).balance;
        address recipient = willData.recipient;

        // Record activity for both creator and recipient
        _recordActivity(
            creator,
            "CLAIMED_FROM",
            amount,
            recipient,
            string(abi.encodePacked("Will claimed by recipient for ", _uint2str(amount), " wei"))
        );

        _recordActivity(
            recipient,
            "CLAIMED",
            amount,
            creator,
            string(abi.encodePacked("Claimed will from ", _addressToString(creator), " for ", _uint2str(amount), " wei"))
        );

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
        emit Claimed(recipient, amount, creator);
    }

    function changeRecipient(address payable newRecipient) external onlyWillOwner willExists(msg.sender) willNotExpired(msg.sender) {
        require(newRecipient != address(0), "New recipient cannot be zero address");
        require(msg.sender != newRecipient, "Owner cannot be the recipient");

        address oldRecipient = wills[msg.sender].recipient;
        wills[msg.sender].recipient = newRecipient;
        wills[msg.sender].lastVisited = block.timestamp; // This acts as an automatic ping

        // Record activity for will owner
        _recordActivity(
            msg.sender,
            "RECIPIENT_CHANGED",
            0,
            newRecipient,
            string(abi.encodePacked("Changed recipient from ", _addressToString(oldRecipient), " to ", _addressToString(newRecipient)))
        );

        // Record activity for old recipient (they were removed)
        _recordActivity(
            oldRecipient,
            "BENEFICIARY_REMOVED",
            0,
            msg.sender,
            string(abi.encodePacked("Removed as beneficiary from will owned by ", _addressToString(msg.sender)))
        );

        // Record activity for new recipient (they were added)
        _recordActivity(
            newRecipient,
            "BENEFICIARY_ADDED",
            0,
            msg.sender,
            string(abi.encodePacked("Added as beneficiary to will owned by ", _addressToString(msg.sender)))
        );

        emit Ping(msg.sender, block.timestamp);
        emit RecipientChanged(msg.sender, oldRecipient, newRecipient);
    }

    function deposit(address payable newRecipient) external payable onlyWillOwner willExists(msg.sender) willNotExpired(msg.sender) {
        require(msg.value > 0, "Deposit must be greater than 0");
        require(newRecipient != address(0), "New recipient cannot be zero address");
        require(msg.sender != newRecipient, "Owner cannot be the recipient");

        address oldRecipient = wills[msg.sender].recipient;
        wills[msg.sender].recipient = newRecipient;
        wills[msg.sender].lastVisited = block.timestamp; // This acts as an automatic ping
        wills[msg.sender].totalDeposited += msg.value;
        wills[msg.sender].depositCount++;

        // Record deposit activity
        _recordActivity(
            msg.sender,
            "DEPOSIT",
            msg.value,
            newRecipient,
            string(abi.encodePacked("Deposited ", _uint2str(msg.value), " wei and updated recipient"))
        );

        // If recipient changed, record the change
        if (oldRecipient != newRecipient) {
            _recordActivity(
                oldRecipient,
                "BENEFICIARY_REMOVED",
                0,
                msg.sender,
                string(abi.encodePacked("Removed as beneficiary during deposit by ", _addressToString(msg.sender)))
            );

            _recordActivity(
                newRecipient,
                "BENEFICIARY_ADDED",
                msg.value,
                msg.sender,
                string(abi.encodePacked("Added as beneficiary with deposit of ", _uint2str(msg.value), " wei"))
            );
        }

        emit Ping(msg.sender, block.timestamp);
        emit DepositMade(msg.sender, msg.value, newRecipient);
    }

    // New function to check if a will has expired
    function isWillExpired(address creator) external view returns (bool) {
        if (!wills[creator].exists) {
            return false;
        }
        return block.timestamp > wills[creator].lastVisited + wills[creator].tenYears;
    }

    // New function to get time until expiration (or 0 if expired)
    function getTimeUntilExpiration(address creator) external view returns (uint256) {
        if (!wills[creator].exists) {
            return 0;
        }
        
        uint256 expirationTime = wills[creator].lastVisited + wills[creator].tenYears;
        if (block.timestamp >= expirationTime) {
            return 0;
        }
        
        return expirationTime - block.timestamp;
    }

    // Get user's recent activity (paginated)
    function getUserActivity(address user, uint256 offset, uint256 limit) 
        external 
        view 
        returns (
            Activity[] memory activities,
            uint256 totalActivities,
            uint256 lastActivityTime,
            bool hasMore
        ) 
    {
        UserActivity storage userActivity = userActivities[user];
        
        if (!userActivity.hasActivity || offset >= userActivity.totalActivities) {
            return (new Activity[](0), 0, 0, false);
        }

        uint256 end = offset + limit;
        if (end > userActivity.totalActivities) {
            end = userActivity.totalActivities;
        }

        uint256 length = end - offset;
        Activity[] memory result = new Activity[](length);

        // Return activities in reverse chronological order (newest first)
        for (uint256 i = 0; i < length; i++) {
            uint256 index = userActivity.totalActivities - 1 - offset - i;
            result[i] = userActivity.activities[index];
        }

        return (
            result,
            userActivity.totalActivities,
            userActivity.lastActivityTime,
            end < userActivity.totalActivities
        );
    }

    // Get user's activity summary
    function getUserActivitySummary(address user) 
        external 
        view 
        returns (
            uint256 totalActivities,
            uint256 lastActivityTime,
            bool hasActivity,
            string memory lastActivityType
        ) 
    {
        UserActivity storage userActivity = userActivities[user];
        
        if (!userActivity.hasActivity || userActivity.totalActivities == 0) {
            return (0, 0, false, "");
        }

        Activity storage lastActivity = userActivity.activities[userActivity.totalActivities - 1];
        
        return (
            userActivity.totalActivities,
            userActivity.lastActivityTime,
            userActivity.hasActivity,
            lastActivity.activityType
        );
    }

    // Get activities by type for a user
    function getUserActivitiesByType(address user, string memory activityType) 
        external 
        view 
        returns (Activity[] memory) 
    {
        UserActivity storage userActivity = userActivities[user];
        
        if (!userActivity.hasActivity) {
            return new Activity[](0);
        }

        // First pass: count matching activities
        uint256 count = 0;
        for (uint256 i = 0; i < userActivity.totalActivities; i++) {
            if (keccak256(bytes(userActivity.activities[i].activityType)) == keccak256(bytes(activityType))) {
                count++;
            }
        }

        // Second pass: collect matching activities
        Activity[] memory result = new Activity[](count);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < userActivity.totalActivities; i++) {
            if (keccak256(bytes(userActivity.activities[i].activityType)) == keccak256(bytes(activityType))) {
                result[resultIndex] = userActivity.activities[i];
                resultIndex++;
            }
        }

        return result;
    }

    // Existing functions with minor updates
    function hasCreatedWill(address _address) public view returns (bool) {
        return wills[_address].exists;
    }

    function getAllWills() public view returns (address[] memory) {
        return willCreators;
    }

    function getTotalWills() public view returns (uint256) {
        return willCreators.length;
    }

    function getWillDetails(address creator) public view returns (
        uint256 startTime,
        uint256 lastVisited,
        uint256 tenYears,
        address recipient,
        string memory description,
        bool exists,
        uint256 totalDeposited,
        uint256 depositCount
    ) {
        Will storage will = wills[creator];
        return (
            will.startTime,
            will.lastVisited,
            will.tenYears,
            will.recipient,
            will.description,
            will.exists,
            will.totalDeposited,
            will.depositCount
        );
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Helper functions for string conversion
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}