// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "elliptic-curve-solidity/contracts/EllipticCurve.sol";

contract Ballot {
    enum BallotStatus {
        REGISTERED,
        OPEN,
        CLOSE
    }

    struct Voter {
        bool right;
        bool voted;
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

    mapping(bytes32 => Voter) public voters; // key is did
    Candidate[] private candidates;

    /// Create new ballot
    constructor(
        uint256 _publicKeyX,
        uint256 _publicKeyY,
        string[] memory _candidateNames,
        bool _isOfficial,
        uint256 _startTime, // milliseconds
        uint256 _endTime, // milliseconds
        bytes32[] memory _voters
    ) public {
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

        /// Give voters the right to vote
        // give rights if official ballot, else discard 'voters'
        if (isOfficial) {
            for (uint i=0; i<_voters.length; i++) {
                bytes32 newVoter = _voters[i];
                voters[newVoter].right = true; // give right
                // voters[newVoter].voted = false; // default is false
            }
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

    function vote(uint _vote, bytes32 did) external {
        require( // only called one time
            status == BallotStatus.OPEN,
            "Vote is allowed at Ballot is OPEN."
        );

        Voter storage sender = voters[did]; // can be anonymous??
        if(isOfficial) require(sender.right, "Has no right to vote.");
        require(!sender.voted, "Already voted.");
        sender.voted = true;

        // * WHEN array out of bounds: throw automatically and revert all changes
        candidates[_vote].voteCount += 1; // weight is always 1
    }

    function open() external {
        if(checkTimeForStart()) status = BallotStatus.OPEN;
        else revert("Before the start time.");
    }

    function close() external {
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

    uint256 N =         0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;
    uint256 Gx =        0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint256 Gy =        0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
    uint256 A =         0x0000000000000000000000000000000000000000000000000000000000000000;
    uint256 B =         0x0000000000000000000000000000000000000000000000000000000000000007;
    uint256 P =         0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;
    uint256 PUBKEYx =   0x7b3603b13efe830a672de384b1afc369f3e9800727ed4585db291ee6a75807a4;
    uint256 PUBKEYy =   0x4c89be9b5e3e54ebe7dc11f7f3dd29204078a89a35f04258841aee5ca3d59a44;
    uint256 Rx =        0x546233c90e9a195806cd68b53255c075e17ab65b87d86cfa3c964b92b303b80e;
    uint256 Ry =        0x1ae318011cffbd3cff2e1e9df8cdc1b48d291dc1c3cb93e1ef74104d0625483c;

    function verifySig(bytes memory m, uint256 sig) external view {
        // calculate left-side
        uint256[2] memory left;
        (left[0], left[1]) = EllipticCurve.ecMul(sig, Gx, Gy, A, P);// sG

        // calculate right-side
        uint256 h = uint(keccak256(m));
        uint a = (Rx * h) % N;
        uint256[2] memory b;
        (b[0], b[1]) = EllipticCurve.ecMul(a, PUBKEYx, PUBKEYy, A, P);
        uint256[2] memory right;
        (right[0], right[1]) = EllipticCurve.ecAdd(Rx, Ry, b[0], b[1], A, P); // R + xRh(m)Pub

        require(left[0] == right[0], "Verify went wrong: x");
        require(left[1] == right[1], "Verify went wrong: y");
    }

    function verifySig(bytes memory m, uint256 sig, uint256[2] memory R) external view {
        // calculate left-side
        uint256[2] memory left;
        (left[0], left[1]) = EllipticCurve.ecMul(sig, Gx, Gy, A, P);// sG

        // calculate right-side
        uint256 h = uint(keccak256(m));
        uint a = (R[0] * h) % N;
        uint256[2] memory b;
        (b[0], b[1]) = EllipticCurve.ecMul(a, PUBKEYx, PUBKEYy, A, P);
        uint256[2] memory right;
        (right[0], right[1]) = EllipticCurve.ecAdd(R[0], R[1], b[0], b[1], A, P); // R + xRh(m)Pub

        require(left[0] == right[0], "Verify went wrong: x");
        require(left[1] == right[1], "Verify went wrong: y");
    }
}
