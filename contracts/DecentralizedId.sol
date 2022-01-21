// SPDX-License-Identifier: DuckBox
pragma solidity >=0.7.0 <0.9.0;

contract DecentralizedId {
    struct User {
        string id;
        bool isValid;
    }

    address public owner;
    mapping(string => User) public users;

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
        return users[_id].isValid;
    }

    function registerUser(string memory _id) onlyOwner public {
        require(
            checkRegistered(_id) == false,
            "Already registered user."
        );
        users[_id].id = _id;
        users[_id].isValid = true;
    }

    function removeUser(string memory _id) onlyOwner external {
        delete users[_id];
    }

    function getUser(string memory _id) external view returns (User memory){
        require(
            checkRegistered(_id) == true,
            "Invalid request for an unregistered user."
        );
        return users[_id];
    }
}
