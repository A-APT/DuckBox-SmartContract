// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;
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

    constructor(address _didAddress) public {
        owner = tx.origin;
        didAddress = _didAddress;
    }
    
    modifier checkDid(bytes32 _did){
        (bool success, bytes memory result) = didAddress.call(
            abi.encodeWithSignature('checkDidValid(address,bytes32)', tx.origin, _did));

        require(success, "faild to transfer ether");
        _;
    }

    function registerBallot(
        bytes32 _chairpersonDid,
        string memory _ballotId,
        string[] memory _candidateNames,
        bool _isOfficial,
        uint256 _startTime, // milliseconds
        uint256 _endTime, // milliseconds
        bytes32[] memory _voters
    ) checkDid(_chairpersonDid) external returns (Ballot){

        require(
            ballots[_ballotId].isValid == false,
            "Already registered ballot (id)."
        );

        ballots[_ballotId].isValid = true;
        ballots[_ballotId].ballot = new Ballot(_candidateNames, _isOfficial, _startTime, _endTime, _voters);
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
}
