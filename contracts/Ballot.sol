// SPDX-License-Identifier: DuckBox
pragma solidity >=0.7.0 <0.9.0;

contract Ballot {
    enum BallotStatus {
        OPEN,
        ONGOING,
        FINISHED
    }

    struct Voter {
        bool right;
        bool voted;
    }

    struct Candidate {
        bytes32 name; // short name
        uint voteCount;
    }

    modifier atFinished {
        require(
            status == BallotStatus.FINISHED,
            "This function is restricted only at FINISHED status."
        );
        _;
    }

    BallotStatus public status;
    bool public isOfficial;
    address public chairperson; // or group

    mapping(string => Voter) public voters; // key is did
    Candidate[] private candidates;

    /// Create new ballot
    constructor(bytes32[] memory _candidateNames, bool _isOfficial) {
        isOfficial = _isOfficial;
        chairperson = msg.sender;

        // Register candidates
        for (uint i=0; i<_candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }

        if(isOfficial) status = BallotStatus.OPEN;
        else status = BallotStatus.ONGOING; // community doesn't need 'right'
    }

    /// Give voters the right to vote on this ballot
    function giveRightToVoters(string[] memory _voters) external {
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require( // only called one time
            status == BallotStatus.OPEN,
            "This function can only at OPEN status (called once)."
        );
        for (uint i=0; i<_voters.length; i++) {
            string memory newVoter = _voters[i];
            voters[newVoter].right = true; // give right
            // voters[newVoter].voted = false; // default is false
        }
        status = BallotStatus.ONGOING; // vote is started
    }

    function vote(uint _vote, string memory did) external {
        require( // only called one time
            status == BallotStatus.ONGOING,
            "Vote is allowed at Ballot is ONGOING."
        );

        Voter storage sender = voters[did]; // can be anonymous??
        if(isOfficial) require(sender.right, "Has no right to vote.");
        require(!sender.voted, "Already voted.");
        sender.voted = true;

        // * WHEN array out of bounds: throw automatically and revert all changes
        candidates[_vote].voteCount += 1; // weight is always 1
    }

    function close() external {
        require(
            msg.sender == chairperson,
            "Only chairperson can close this ballot."
        );
        status = BallotStatus.FINISHED;
    }

    function resultOfBallot() atFinished external view returns (Candidate[] memory candidates_) {
        candidates_ = candidates;
    }
}
