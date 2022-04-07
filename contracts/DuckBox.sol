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
    modifier checkDid(string memory _did){
        require(
            keccak256(bytes(did.getDid(tx.origin))) == keccak256(bytes(_did)),
            "Dose not match Did"
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


    /// Group
    function registerGroup( //request owner
        string memory _groupId, 
        string memory _ownerDid
    ) checkDid(_ownerDid) checkRegistered external{
        groups[_groupId] = new Group(_groupId, _ownerDid);
    }

    function requestGroupMember( //request requester
        string memory _groupId, 
        string memory _userDid
    ) checkDid(_userDid) checkRegistered external{
        groups[_groupId].requestMember(_userDid);
    }

    function approveGroupMember( //request approver
        string memory _groupId, 
        string memory _approverDid, 
        string memory _requesterDid
    ) checkRegistered external{
        groups[_groupId].approveMember(_approverDid, _requesterDid);
    }

    function exitMember( //reqeust requester
        string memory _groupId, 
        string memory _requesterDid
    ) checkRegistered external {
        groups[_groupId].exitMember(_requesterDid);
    }

    function approveGroupAuthentication( //request approver
        string memory _groupId, 
        string memory _approverDid
    ) checkDid(_approverDid) checkRegistered external {
        groups[_groupId].approveGroupAuthentication(_approverDid);
    }

    function getMemberStatus(string memory _groupId, string memory _did) external view returns (Group.MemberStatus _status){
        _status = groups[_groupId].getMemberStatus(_did);
    }
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
