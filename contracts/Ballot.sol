// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BlindSigSecp256k1.sol";

contract Ballot {
    enum BallotStatus {
        REGISTERED,
        OPEN,
        CLOSE
    }

    struct Candidate {
        string name;
        uint voteCount;
    }

    BallotStatus public status;
    bool public isOfficial;
    address public chairperson; // or group
    uint256 public startTime; // milliseconds
    uint256 public endTime; // milliseconds
    uint256 public publicKeyX;
    uint256 public publicKeyY;

    Candidate[] private candidates;

    mapping(uint256 => bool) public serverSig;  // Avoiding Double Voting
    mapping(uint256 => bool) public ownerSig;   // Avoiding Double Voting

    /// Create new ballot
    constructor(
        uint256 _publicKeyX,
        uint256 _publicKeyY,
        string[] memory _candidateNames,
        bool _isOfficial,
        uint256 _startTime, // milliseconds
        uint256 _endTime // milliseconds
    ) {
        require(
            _startTime < _endTime && block.timestamp < _endTime,
            "The start time must be earlier than the end time."
        );
        chairperson = tx.origin;
        isOfficial = _isOfficial;
        startTime = _startTime;
        endTime = _endTime;

        publicKeyX = _publicKeyX;
        publicKeyY = _publicKeyY;

        /// Register candidates
        for (uint i=0; i<_candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }

        /// Initialize BallotStatus
        status = BallotStatus.REGISTERED;
        if(checkTimeForStart()) status = BallotStatus.OPEN;
    }

    function checkTimeForStart() internal view returns (bool){
        require(
            status == BallotStatus.REGISTERED,
            "This function can be called only at REGISTERED status."
        );
        uint256 currentTime = block.timestamp;
        if (currentTime >= startTime && currentTime < endTime) return true;
        else return false;
    }

    function checkTimeForEnd() internal view returns (bool){
        require(
            status == BallotStatus.OPEN,
            "This function can be called only at OPEN status."
        );
        uint256 currentTime = block.timestamp;
        if (endTime <= currentTime) return true;
        else return false;
    }

    function open() external {
        if(checkTimeForStart()) status = BallotStatus.OPEN;
        else revert("Before the start time.");
    }

    function close(uint256 _totalNum) external {
        // Verify the number of signature and vote count is the same
        uint256 totalNum = 0;
        for (uint i=0; i<candidates.length; i++) {
            totalNum = totalNum + candidates[i].voteCount;
        }
        require(totalNum == _totalNum, "Number of signature and vote count is not the same");

        if(checkTimeForEnd()) status = BallotStatus.CLOSE;
        else revert("Before the end time.");
    }

    function resultOfBallot() external view returns (Candidate[] memory candidates_) {
        require(
            status == BallotStatus.CLOSE,
            "This function is restricted only at CLOSE status."
        );
        candidates_ = candidates;
    }

    function vote(bytes memory _m, uint256 _serverSig, uint256 _ownerSig, uint256[2] memory R) external {
        require(
            status == BallotStatus.OPEN,
            "Vote is allowed at Ballot is OPEN."
        );
        require(serverSig[_serverSig] == false, "The server signature has already been used.");
        require(ownerSig[_ownerSig] == false, "The owner signature has already been used.");

        // verify signature
        BlindSigSecp256k1.verifySig(_m, _serverSig, R);                             // verify signature of server signature
        BlindSigSecp256k1.verifySig(_m, _ownerSig, R, [publicKeyX, publicKeyY]);    // verify signature of ballot owner

        // * WHEN array out of bounds: throw automatically and revert all changes
        uint256 m = uint(uint8(_m[0])) - 48;
        candidates[m].voteCount += 1; // weight is always 1

        // Avoiding Double Voting
        serverSig[_serverSig] = true;
        ownerSig[_ownerSig] = true;
    }
}
