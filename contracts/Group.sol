// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./DecentralizedId.sol";

contract Group{
    enum GroupStatus {
        INVALID,
        WAITING,
        VALID
    }

    struct Requester{
        bytes32 did;
        bool isValid;
    }

    string public groupId;
    GroupStatus public status;
    
    mapping(bytes32 => bool) public members; //key: user did, value: boolean
    Requester[] public requesters;

    event groupAuthCompleted(string groupId);
    event memberAuthCompleted(string groupId, bytes32 did);

    constructor(string memory _groupId, bytes32 _ownerDid) {
        groupId = _groupId;
        members[_ownerDid] = true;

        status = GroupStatus.INVALID;
    }

    modifier onlyValidGroup{
        require(
            status == GroupStatus.VALID,
            "This function is restricted to the Valid group"
        );
        _;
    }
    
    function getRequesterList() external view returns(Requester[] memory requesters_){
        requesters_ = requesters;
    }

    function getMember(bytes32 _userDid) external view returns(bool){
        return members[_userDid];
    }

    //Request to join a group
    function requestMember(bytes32 _userDid) onlyValidGroup external{
        require(
            members[_userDid] == false,
            "Already group Member"
        );

        bool flag = false;

        for(uint i = 0; i<requesters.length; i++){
            if(requesters[i].did == _userDid){
                flag = true;
                break;
            }
        }

        require(flag == false, "Already group Member");

        requesters.push(Requester({
                did: _userDid,
                isValid: false
            }));
    }

    //mutual authentication
    function approveMember(bytes32 _approverDid, bytes32 _requesterDid) onlyValidGroup external returns (bool) {
        //Check Approver Permissions
        require(
            members[_approverDid] == true,
            "No permission"
        );
        //Check if requester is already a member of the group
        require(
           members[_requesterDid] == false,
            "Already group member"
        );
        
        for(uint i = 0; i<requesters.length; i++){
            if(requesters[i].did == _requesterDid){
                if(requesters[i].isValid == false){
                    requesters[i].isValid = true;
                }else if(requesters[i].isValid == true){
                    //add mapping
                    members[_requesterDid] = true;
                    //delete array
                    remove(i);
                    // emit event
                    emit memberAuthCompleted(groupId, _requesterDid);
                }
                break;
            }
        }

        return members[_requesterDid];
    }

    function remove(uint index) internal {
        if (index >= requesters.length) return;

        for (uint i = index; i<requesters.length-1; i++){
            requesters[i] = requesters[i+1];
        }
        requesters.pop();
    }

     function getRequesterVaild(uint index) external view returns(bool){
        return requesters[index].isValid;
    }

    //Withdrawal
    function exitMember(bytes32 _requesterDid) onlyValidGroup external {
        //Check if requester is a member of the group
        require(
           members[_requesterDid] == true,
            "Not member"
        );

        delete members[_requesterDid];
    }

    //group authentication
    function approveGroupAuthentication(bytes32 _approverDid) external returns (bool) {
        //Check if the group is already approved
        require(
           status != GroupStatus.VALID,
            "Already approved group"
        );

        //Check for duplicate approvers
        require(
           members[_approverDid] != true,
            "can not approve"
        );

        members[_approverDid] = true;

        if(status == GroupStatus.INVALID){
            status = GroupStatus.WAITING;
        }else if(status == GroupStatus.WAITING){
            status = GroupStatus.VALID;
            emit groupAuthCompleted(groupId); // emit event for notify group status is changed to VALID
            return true;
        }
        return false;
    }

}
