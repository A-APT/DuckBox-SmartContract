// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Group.sol";

contract Groups {
    struct GroupBox {
        bool isValid;
        Group group;
        bytes32 leader; //group leader
    }

    mapping(string => GroupBox) groups; //key is groupId
    address public owner;
    address public didAddress;

    constructor(address _didAddress) {
        owner = tx.origin;
        didAddress = _didAddress;
    }

    function registerGroup( //by owner
        string memory _groupId, 
        bytes32 _ownerDid
    ) external{
        require(
            groups[_groupId].isValid == false,
            "Already registered group"
        );
        groups[_groupId].isValid = true;
        groups[_groupId].group = new Group(_groupId, _ownerDid, didAddress);
        groups[_groupId].leader = _ownerDid;
    }

    function deleteGroup( //by owner
        string memory _groupId,
        bytes32 _ownerDid
    ) external{
        require(
            groups[_groupId].leader == _ownerDid,
            "does not match owner did"
        );
        delete groups[_groupId];
    }

    //Group function
    function requestMember(string memory _groupId, bytes32 _userDid) external{
        GroupBox memory groupBox = groups[_groupId];
        require(
            groupBox.isValid == true,
            "Unregistered group (id)."
        );

        groupBox.group.requestMember(_userDid);
    }

    function approveMember(string memory _groupId, bytes32 _approverDid, bytes32 _requesterDid) external{
        GroupBox memory groupBox = groups[_groupId];
        require(
            groupBox.isValid == true,
            "Unregistered group (id)."
        );

        groupBox.group.approveMember(_approverDid, _requesterDid);
    }

    function exitMember(string memory _groupId, bytes32 _requesterDid) external{
        GroupBox memory groupBox = groups[_groupId];
        require(
            groupBox.isValid == true,
            "Unregistered group (id)."
        );

        groupBox.group.exitMember(_requesterDid);
    }

    function approveGroupAuthentication(string memory _groupId, bytes32 _approverDid) external{
        GroupBox memory groupBox = groups[_groupId];
        require(
            groupBox.isValid == true,
            "Unregistered group (id)."
        );

        groupBox.group.approveGroupAuthentication(_approverDid);
    }
}
