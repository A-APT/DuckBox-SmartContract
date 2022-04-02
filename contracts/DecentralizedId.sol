// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract DecentralizedId {
    struct Id {
        address addr;
        bool isValid;
    }

    address public owner;
    mapping(string => Id) public ids;

    modifier onlyOwner {
        require(
            msg.sender == owner,
            "This function is restricted to the contract's owner."
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function checkRegistered(string memory _id) public view returns (bool) {
        return ids[_id].isValid;
    }

    function registerId(string memory _id) onlyOwner external {
        require(
            checkRegistered(_id) == false,
            "Already registered ID."
        );
        ids[_id].addr = msg.sender;
        ids[_id].isValid = true;
    }

    function removeId(string memory _id) onlyOwner external {
        delete ids[_id];
    }
}
