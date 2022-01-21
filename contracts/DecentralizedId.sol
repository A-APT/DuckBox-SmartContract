// SPDX-License-Identifier: DuckBox
pragma solidity >=0.7.0 <0.9.0;

contract DecentralizedId {
    struct Id {
        string id;
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

    constructor(address _owner) {
        owner = _owner;
    }

    function checkRegistered(string memory _id) internal view returns (bool) {
        return ids[_id].isValid;
    }

    function registerId(string memory _id) onlyOwner public {
        require(
            checkRegistered(_id) == false,
            "Already registered ID."
        );
        ids[_id].id = _id;
        ids[_id].isValid = true;
    }

    function removeId(string memory _id) onlyOwner external {
        delete ids[_id];
    }

    function getId(string memory _id) external view returns (Id memory){
        require(
            checkRegistered(_id) == true,
            "Invalid request for an unregistered ID."
        );
        return ids[_id];
    }
}
