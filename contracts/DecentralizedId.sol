// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedId {
    struct Id {
        bytes32 id;
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

    function checkDidValid(address _address, bytes32 did) public view{
        require(did == ids[_address].id, "Not equal Did");
    }

    function registerId(address _address, bytes32 _id) onlyOwner external {
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

    function getContractAddress() external view returns (address){
        return address(this);
    }
}
