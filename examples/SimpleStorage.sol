// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleStorage
 * @dev Store and retrieve a value in a mapping
 */
contract SimpleStorage {
    
    uint256 public storedData;
    
    constructor(uint256 _initialValue) {
        storedData = _initialValue;
    }
    
    /**
     * @dev Store value in variable
     * @param x value to store
     */
    function set(uint256 x) public {
        storedData = x;
    }
    
    /**
     * @dev Return value 
     * @return value of 'storedData'
     */
    function get() public view returns (uint256) {
        return storedData;
    }
}
