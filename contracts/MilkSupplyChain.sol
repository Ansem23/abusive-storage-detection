// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";


contract MilkSupplyChain is Ownable {
    struct Batch {
        uint256 id;
        address producer;
        uint256 quantity;
        uint256 timestamp;
    }
    
    uint256 public nextBatchId;
    mapping(uint256 => Batch) public batches;
    mapping(address => uint256) public stockBalance;
    
    // Role management
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isReseller;
    mapping(address => bool) public isProducer;
    
    // Events
    event Produced(uint256 batchId, address indexed producer, uint256 quantity, uint256 timestamp);
    event Transferred(address indexed from, address indexed to, uint256 quantity);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event ResellerAdded(address indexed reseller);
    event ProducerAdded(address indexed producer);
    event ResellerRemoved(address indexed reseller);
    event ProducerRemoved(address indexed producer);
    
    modifier onlyAdmin() {
        require(isAdmin[msg.sender] || owner() == msg.sender, "Not an admin");
        _;
    }
    
    modifier onlyProducer() {
        require(isProducer[msg.sender], "Not an authorized producer");
        _;
    }
    
    modifier onlyReseller() {
        require(isReseller[msg.sender], "Not an authorized reseller");
        _;
    }
    
  constructor() {
    _transferOwnership(msg.sender);
    isAdmin[msg.sender] = true;
    emit AdminAdded(msg.sender);
}


    
    function addAdmin(address account) external onlyAdmin {
        require(!isAdmin[account], "Address is already an admin");
        isAdmin[account] = true;
        emit AdminAdded(account);
    }
    
    function removeAdmin(address account) external onlyAdmin {
        require(isAdmin[account], "Address is not an admin");
        isAdmin[account] = false;
        emit AdminRemoved(account);
    }
    
    function setReseller(address account) external onlyAdmin {
        require(!isReseller[account], "Address is already a reseller");
        isReseller[account] = true;
        emit ResellerAdded(account);
    }
    
    function removeReseller(address account) external onlyAdmin {
        require(isReseller[account], "Address is not a reseller");
        isReseller[account] = false;
        emit ResellerRemoved(account);
    }
    
    function setProducer(address account) external onlyAdmin {
        require(!isProducer[account], "Address is already a producer");
        isProducer[account] = true;
        emit ProducerAdded(account);
    }
    
    function removeProducer(address account) external onlyAdmin {
        require(isProducer[account], "Address is not a producer");
        isProducer[account] = false;
        emit ProducerRemoved(account);
    }
    
    function produce(uint256 quantity) external onlyProducer {
        uint256 batchId = nextBatchId++;
        batches[batchId] = Batch(batchId, msg.sender, quantity, block.timestamp);
        stockBalance[msg.sender] += quantity;
        emit Produced(batchId, msg.sender, quantity, block.timestamp);
    }
    
    function transferStock(address to, uint256 amount) external {
        require(stockBalance[msg.sender] >= amount, "Insufficient stock");
        require(isProducer[msg.sender] || isReseller[msg.sender], "Unauthorized transfer");
        require(isReseller[to], "Recipient not authorized");
        
        stockBalance[msg.sender] -= amount;
        stockBalance[to] += amount;
        emit Transferred(msg.sender, to, amount);
    }
}