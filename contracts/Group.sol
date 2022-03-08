pragma solidity >=0.7.0 <0.9.0;

contract Group{
    enum GroupStatus {
        INVALID,
        WAITING,
        VALID
    }
    struct Requester{
        uint count;
        bool isValid;
    }

    address public owner; //group leader
    GroupStatus public status;
    
    mapping(string => Requester) public requesters; //key: user did, value: Requester

    constructor(string memory _ownerDid) {
        owner = msg.sender;
        requesters[_ownerDid].count = 0;
        requesters[_ownerDid].isValid = true;

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
            requesters[_userDid].count == 0,
            "Already request Member"
        );

        requesters[_userDid].count = 0;
        requesters[_userDid].isValid = false;
    }

    //mutual authentication
    function approveMember(string memory _approverDid, string memory _requesterDid) onlyValidGroup external returns(bool){
        //Check Approver Permissions
        require(
            requesters[_approverDid].isValid == true,
            "No permission"
        );
        //Check if requester is already a member of the group
        require(
           requesters[_requesterDid].isValid == false,
            "Already group member"
        );
        
        requesters[_requesterDid].count++;
        
        if(requesters[_requesterDid].count>=2){
            requesters[_requesterDid].isValid = true;
        }
        return requesters[_requesterDid].isValid;
    }

    //Withdrawal
    function exitMember(string memory _requesterDid) onlyValidGroup external {
        //Check if requester is a member of the group
        require(
           requesters[_requesterDid].isValid == true,
            "Not member"
        );

        delete requesters[_requesterDid];
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
           requesters[_approverDid].isValid == false,
            "can not approve"
        );
        
        if(status == GroupStatus.INVALID){
            status = GroupStatus.WAITING;
        }else if(status == GroupStatus.WAITING){
            status = GroupStatus.VALID;
        }

        requesters[_approverDid].isValid = true;
    }
}
