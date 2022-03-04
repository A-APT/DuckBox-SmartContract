// SPDX-License-Identifier: DuckBox
pragma solidity >=0.7.0 <0.9.0;

contract Ballot {
    enum BallotStatus {
        OPEN,
        ONGOING,
        FINISHED
    }

    struct Voter {
        uint weight;
        bool voted;
        uint vote;
    }

    struct Candidate {
        bytes32 name; // short name
        uint voteCount;
    }

    modifier atFinished {
        require(
            status == BallotStatus.FINISHED,
            "This function is restricted only at finished status."
        );
        _;
    }

    BallotStatus public status;
    address public chairperson; // or group

    mapping(address => Voter) public voters;
    Candidate[] private candidates;

    function getResult() atFinished external returns (Candidate[]) {
        return candidates;
    }

    /// Create new ballot
    constructor(bytes32[] memory _candidateNames) {
        status = BallotStatus.OPEN;
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        // Register candidates
        for (uint i=0; i<_candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
    }

    /// Give voters the right to vote on this ballot
    function giveRightToVoters(address[] memory _voters) external {
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        for (uint i=0; i<_voters.length; i++) {
            address newVoter = _voters[i];
            voters[newVoter].weight = 1;
            voters[newVoter].voted = false; // TODO add restriction
        }
    }

    function vote(uint _vote) external {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote.");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = _vote;

        // * WHEN array out of bounds: throw automatically and revert all changes
        candidates[_vote].voteCount += sender.weight;
    }

    function resultOfBallot() external view returns (Candidate[] memory candidates_) {
        candidates_ = candidates;
    }
}
