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
    // function registerDid(address _address, string memory _id) external {
    //     did.registerId(_address, _id);
    // }
    // function removeDid(address _address) external {
    //     did.removeId(_address);
    // }
    ///


    /// Group

    ///


    /// Ballot
    function registerBallot(
        string memory _ballotId,
        string[] memory _candidateNames,
        bool _isOfficial,
        uint256 _startTime, // milliseconds
        uint256 _endTime, // milliseconds
        string[] memory _voters
    ) checkRegistered external returns (Ballot){

        require(address(ballots[_ballotId]) == address(0));
        ballots[_ballotId] = new Ballot(_candidateNames, _isOfficial, _startTime, _endTime, _voters);
        return ballots[_ballotId];
    }
    function openBallot(string memory _ballotId) external {
        require(address(ballots[_ballotId]) != address(0));
        ballots[_ballotId].open();
    }
    function closeBallot(string memory _ballotId) external {
        require(address(ballots[_ballotId]) != address(0));
        ballots[_ballotId].close();
    }
    function getResultOfBallot(string memory _ballotId) external view returns (Ballot.Candidate[] memory candidates_){
        require(address(ballots[_ballotId]) != address(0));
        return ballots[_ballotId].resultOfBallot();
    }
    // TODO vote
    ///
}
