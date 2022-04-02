// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "./DecentralizedId.sol";
import "./Ballot.sol";
import "./Group.sol";

contract DuckBox {
    address public owner;
    DecentralizedId public did;
    mapping(string => Group) public groups;
    mapping(string => Ballot) public ballots;

    constructor() {
        owner = msg.sender;
        did = new DecentralizedId();
    }

    /// modifier
    modifier onlyOwner {
        require(
            msg.sender == owner,
            "This function is restricted to the contract's owner."
        );
        _;
    }
    modifier checkDid(string memory _id) {
        require(
            did.checkRegistered(_id),
            "Requested did is not registered."
        );
        _;
    }


    /// DecentralizedId
    function registerDid(string memory _id) external returns (address){
        did.registerId(_id);
        return msg.sender;
    }
    function removeDid(string memory _id) external {
        did.removeId(_id);
    }
    ///


}
