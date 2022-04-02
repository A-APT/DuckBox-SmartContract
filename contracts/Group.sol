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
        WATING,
        VALID
    }

    address public owner; //group leader
    GroupStatus public status;
    
    mapping(string => MemberStatus) public members; //key: user did, value: Requester

    constructor(string memory _ownerDid) {
        owner = msg.sender;
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
    function requestMember(string memory _userDid) onlyValidGroup external{
        require(
            members[_userDid] == MemberStatus.INVALID,
            "Already request Member"
        );

        members[_userDid] = MemberStatus.REQUEST;
    }

    //mutual authentication
    function approveMember(string memory _approverDid, string memory _requesterDid) onlyValidGroup external{
        //Check Approver Permissions
        require(
            members[_approverDid] == MemberStatus.VALID,
            "No permission"
        );
        //Check if requester is already a member of the group
        require(
           members[_requesterDid] == MemberStatus.REQUEST ||  members[_requesterDid] == MemberStatus.WATING,
            "Already group member"
        );
        
        if(members[_requesterDid] == MemberStatus.REQUEST){
            members[_requesterDid] = MemberStatus.WATING;
        }else if(members[_requesterDid] == MemberStatus.WATING){
            members[_requesterDid] = MemberStatus.VALID;
        }
    }

    //Withdrawal
    function exitMember(string memory _requesterDid) onlyValidGroup external {
        //Check if requester is a member of the group
        require(
           members[_requesterDid] == MemberStatus.VALID,
            "Not member"
        );

        delete members[_requesterDid];
    }

    //group authentication
    function approveGroupAuthentication(string memory _approverDid) external{
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
        }

        members[_approverDid] = MemberStatus.VALID;
    }
}
