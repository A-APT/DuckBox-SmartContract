// SPDX-License-Identifier: DuckBox
pragma solidity >=0.7.0 <0.9.0;

contract Ballots {
    struct BallotBox {
        bool isValid;
        Ballot ballot;
    }
    mapping(string => BallotBox) ballots;
    address public owner;

    constructor() {
        owner = msg.sender;
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

    mapping(string => Voter) public voters; // key is did
    Candidate[] private candidates;

    /// Create new ballot
    constructor(
        string[] memory _candidateNames,
        bool _isOfficial,
        uint256 _startTime, // milliseconds
        uint256 _endTime, // milliseconds
        string[] memory _voters
    ) {
        require(
            _startTime < _endTime && block.timestamp < _endTime,
            "The start time must be earlier than the end time."
        );
        chairperson = msg.sender;
        isOfficial = _isOfficial;
        startTime = _startTime;
        endTime = _endTime;

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
                string memory newVoter = _voters[i];
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

    function vote(uint _vote, string memory did) external {
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
}
