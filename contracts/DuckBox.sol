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
    modifier checkRegistered() {
        require(
            did.checkRegistered(tx.origin),
            "Not registered address."
        );
        _;
    }


    /// DecentralizedId
    function registerDid(address _address, string memory _id) external {
        did.registerId(_address, _id);
    }
    function removeDid(address _address) external {
        did.removeId(_address);
    }
    ///


}
