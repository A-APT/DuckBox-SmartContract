// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Ballot.sol";

contract Ballots {
    struct BallotBox {
        bool isValid;
        Ballot ballot;
        bytes32 chairpersonDid;
    }

    mapping(string => BallotBox) ballots;
    address public owner;
    address public didAddress;

    constructor(address _didAddress) {
        owner = tx.origin;
        didAddress = _didAddress;
    }

    modifier onlyOwner {
        require(
            owner == tx.origin,
            "This function is restricted to the contract's owner."
        );
        _;
    }

    modifier checkDid(bytes32 _did){
        (bool success, bytes memory result) = didAddress.call(
            abi.encodeWithSignature('checkDidValid(address,bytes32)', tx.origin, _did));

        require(success, "faild to transfer ether");
        _;
    }

    function registerBallot(
        bytes32 _chairpersonDid,
        uint256 _publicKeyX,
        uint256 _publicKeyY,
        string memory _ballotId,
        string[] memory _candidateNames,
        bool _isOfficial,
        uint256 _startTime, // milliseconds
        uint256 _endTime // milliseconds
    ) checkDid(_chairpersonDid) external returns (Ballot){

        require(
            ballots[_ballotId].isValid == false,
            "Already registered ballot (id)."
        );

        ballots[_ballotId].isValid = true;
        ballots[_ballotId].ballot = new Ballot(_publicKeyX, _publicKeyY, _candidateNames, _isOfficial, _startTime, _endTime);
        ballots[_ballotId].chairpersonDid = _chairpersonDid;

        return ballots[_ballotId].ballot;
    }

    function getBallot(string memory _ballotId) external view returns (Ballot) {
        BallotBox memory ballotBox = ballots[_ballotId];
        require(
            ballotBox.isValid == true,
            "Unregistered ballot (id)."
        );
        return ballotBox.ballot;
    }

    function open(string memory _ballotId) external {
        ballots[_ballotId].ballot.open();
    }

    function close(string memory _ballotId, uint256 _totalNum) onlyOwner external {
        ballots[_ballotId].ballot.close(_totalNum);
    }

    function resultOfBallot(string memory _ballotId) external view returns (Ballot.Candidate[] memory candidates_) {
        candidates_ = ballots[_ballotId].ballot.resultOfBallot();
    }

    function vote(
        string memory _ballotId,
        bytes memory _m,
        uint256 _serverSig,
        uint256 _ownerSig,
        uint256[2] memory R
    ) external {
        BallotBox memory ballotBox = ballots[_ballotId];
        require(
            ballotBox.isValid == true,
            "Unregistered ballot (id)."
        );
        ballotBox.ballot.vote(_m, _serverSig, _ownerSig, R);
    }
}
