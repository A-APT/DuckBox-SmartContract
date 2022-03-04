pragma solidity >=0.7.0 <0.9.0;

contract Group{
    struct Requester{
        uint count;
        bool isValid;
    }

    address public owner; //group leader
    Requester public groupInfo;

    mapping(string => Requester) public requesters; //key: user did, value: Requester

    constructor(string memory _ownerDid) {
        owner = msg.sender;
        requesters[_ownerDid].count = 0;
        requesters[_ownerDid].isValid = true;

        groupInfo.count = 0;
        groupInfo.isValid = false;
    }

    modifier onlyValidGroup{
        require(
            groupInfo.isValid == true,
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

    //group authentication
    function approveGroupAuthentication(string memory _approverDid) external returns(bool){
        //Check if the group is already approved
        require(
           groupInfo.isValid == false,
            "Already approved group"
        );

        //Check for duplicate approvers
        require(
           requesters[_approverDid].isValid == false,
            "can not approve"
        );
        
        groupInfo.count++;
        requesters[_approverDid].isValid = true;
        
        if(groupInfo.count>=2){
            groupInfo.isValid = true;
        }

        return groupInfo.isValid;
    }
}
