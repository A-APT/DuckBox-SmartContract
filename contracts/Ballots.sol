// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;
import "./Ballot.sol";

contract Ballots {
    struct BallotBox {
        bool isValid;
        Ballot ballot;
    }
    mapping(string => BallotBox) ballots;
    address public owner;

    constructor() public {
        owner = tx.origin;
    }

    function registerBallot(
        string memory _ballotId,
        string[] memory _candidateNames,
        bool _isOfficial,
        uint256 _startTime, // milliseconds
        uint256 _endTime, // milliseconds
        string[] memory _voters
    ) external returns (Ballot){

        require(
            ballots[_ballotId].isValid == false,
            "Already registered ballot (id)."
        );

        ballots[_ballotId].isValid = true;
        ballots[_ballotId].ballot = new Ballot(_candidateNames, _isOfficial, _startTime, _endTime, _voters);

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
