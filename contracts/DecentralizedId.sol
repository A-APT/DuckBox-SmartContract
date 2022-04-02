// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract DecentralizedId {
    struct Id {
        string id;
        bool isValid;
    }

    address public owner;
    mapping(address => Id) public ids;

    modifier onlyOwner {
        require(
            owner == tx.origin,
            "This function is restricted to the contract's owner."
        );
        _;
    }

    constructor() {
        owner = tx.origin;
    }

    function checkRegistered(address _address) public view returns (bool) {
        return ids[_address].isValid;
    }

    function registerId(address _address, string memory _id) onlyOwner external {
        require(
            checkRegistered(_address) == false,
            "Already registered address."
        );
        ids[_address].id = _id;
        ids[_address].isValid = true;
    }

    function removeId(address _address) onlyOwner external {
        delete ids[_address];
    }
}
