pragma solidity >=0.7.0 <0.9.0;

contract Group{
    enum GroupStatus {
        INVALID,
        WAITING,
        VALID
    }
    struct Member{
        uint count;
        bool isValid;
    }

    address public owner; //group leader
    GroupStatus public status;
    
    mapping(string => Member) public members; //key: user did, value: Requester

    constructor(string memory _ownerDid) {
        owner = msg.sender;
        members[_ownerDid].count = 0;
        members[_ownerDid].isValid = true;

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
            members[_userDid].count == 0,
            "Already request Member"
        );

        members[_userDid].count = 0;
        members[_userDid].isValid = false;
    }

    //mutual authentication
    function approveMember(string memory _approverDid, string memory _requesterDid) onlyValidGroup external returns(bool){
        //Check Approver Permissions
        require(
            members[_approverDid].isValid == true,
            "No permission"
        );
        //Check if requester is already a member of the group
        require(
           members[_requesterDid].isValid == false,
            "Already group member"
        );
        
        members[_requesterDid].count++;
        
        if(members[_requesterDid].count>=2){
            members[_requesterDid].isValid = true;
        }
        return members[_requesterDid].isValid;
    }

    //Withdrawal
    function exitMember(string memory _requesterDid) onlyValidGroup external {
        //Check if requester is a member of the group
        require(
           members[_requesterDid].isValid == true,
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
           members[_approverDid].isValid == false,
            "can not approve"
        );
        
        if(status == GroupStatus.INVALID){
            status = GroupStatus.WAITING;
        }else if(status == GroupStatus.WAITING){
            status = GroupStatus.VALID;
        }

        members[_approverDid].isValid = true;
    }
}
