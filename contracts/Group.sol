// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Group{
    enum GroupStatus {
        INVALID,
        WAITING,
        VALID
    }
    
    enum MemberStatus{
        INVALID,
        REQUEST,
        WAITING,
        VALID
    }

    string public groupId;
    GroupStatus public status;
    
    mapping(bytes32 => MemberStatus) public members; //key: user did, value: Requester

    event groupAuthCompleted(string groupId);

    constructor(string memory _groupId, bytes32 _ownerDid) {
        groupId = _groupId;
        members[_ownerDid] = MemberStatus.VALID;

        status = GroupStatus.INVALID;
    }

    modifier onlyValidGroup{
        require(
            status == GroupStatus.VALID,
            "This function is restricted to the Valid group"
        );
        _;
    }

    //Request to join a group
    function requestMember(bytes32 _userDid) onlyValidGroup external{
        require(
            members[_userDid] == MemberStatus.INVALID,
            "Already request Member"
        );

        members[_userDid] = MemberStatus.REQUEST;
    }

    //mutual authentication
    function approveMember(bytes32 _approverDid, bytes32 _requesterDid) onlyValidGroup external{
        //Check Approver Permissions
        require(
            members[_approverDid] == MemberStatus.VALID,
            "No permission"
        );
        //Check if requester is already a member of the group
        require(
           members[_requesterDid] == MemberStatus.REQUEST ||  members[_requesterDid] == MemberStatus.WAITING,
            "Already group member"
        );
        
        if(members[_requesterDid] == MemberStatus.REQUEST){
            members[_requesterDid] = MemberStatus.WAITING;
        }else if(members[_requesterDid] == MemberStatus.WAITING){
            members[_requesterDid] = MemberStatus.VALID;
        }
    }

    //Withdrawal
    function exitMember(bytes32 _requesterDid) onlyValidGroup external {
        //Check if requester is a member of the group
        require(
           members[_requesterDid] == MemberStatus.VALID,
            "Not member"
        );

        delete members[_requesterDid];
    }

    //group authentication
    function approveGroupAuthentication(bytes32 _approverDid) external{
        //Check if the group is already approved
        require(
           status != GroupStatus.VALID,
            "Already approved group"
        );

        //Check for duplicate approvers
        require(
           members[_approverDid] != MemberStatus.VALID,
            "can not approve"
        );
        
        if(status == GroupStatus.INVALID){
            status = GroupStatus.WAITING;
        }else if(status == GroupStatus.WAITING){
            status = GroupStatus.VALID;
            emit groupAuthCompleted(groupId); // emit event for notify group status is changed to VALID
        }

        members[_approverDid] = MemberStatus.VALID;
    }
}
