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

    event groupAuthCompleted(string groupId);
    event memberAuthCompleted(string groupId, bytes32 did);

    constructor(address _didAddress) {
        owner = tx.origin;
        didAddress = _didAddress;
    }

    modifier checkDid(bytes32 _did){
        (bool success, bytes memory result) = didAddress.call(
            abi.encodeWithSignature('checkDidValid(address,bytes32)', tx.origin, _did));

        require(success, "faild to transfer ether");
        _;
    }

    function registerGroup( //by owner
        string memory _groupId, 
        bytes32 _ownerDid
    ) checkDid(_ownerDid) external{
        require(
            groups[_groupId].isValid == false,
            "Already registered group"
        );
        groups[_groupId].isValid = true;
        groups[_groupId].group = new Group(_groupId, _ownerDid);
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
    function requestMember(string memory _groupId, bytes32 _userDid, string memory _name, string memory _email) checkDid(_userDid) external{
        GroupBox memory groupBox = groups[_groupId];
        require(
            groupBox.isValid == true,
            "Unregistered group (id)."
        );

        groupBox.group.requestMember(_userDid, _name, _email);
    }

    function approveMember(string memory _groupId, bytes32 _approverDid, bytes32 _requesterDid)  checkDid(_approverDid) external{
        GroupBox memory groupBox = groups[_groupId];
        require(
            groupBox.isValid == true,
            "Unregistered group (id)."
        );

        bool result = groupBox.group.approveMember(_approverDid, _requesterDid);
        if(result) emit memberAuthCompleted(_groupId, _requesterDid);
    }

    function exitMember(string memory _groupId, bytes32 _requesterDid) checkDid(_requesterDid) external{
        GroupBox memory groupBox = groups[_groupId];
        require(
            groupBox.isValid == true,
            "Unregistered group (id)."
        );

        groupBox.group.exitMember(_requesterDid);
    }

    function approveGroupAuthentication(string memory _groupId, bytes32 _approverDid) checkDid(_approverDid) external{
        GroupBox memory groupBox = groups[_groupId];
        require(
            groupBox.isValid == true,
            "Unregistered group (id)."
        );

        bool result = groupBox.group.approveGroupAuthentication(_approverDid);
        if(result) emit groupAuthCompleted(_groupId);
    }

    function getRequesterList(string memory _groupId) external view returns(bytes32[] memory did, bool[] memory isValid, string[] memory name, string[] memory email){
        GroupBox memory groupBox = groups[_groupId];
        Group.Requester[] memory requesters = groupBox.group.getRequesterList();

        bytes32[] memory _did = new bytes32[](requesters.length);
        bool[] memory _isValid = new bool[](requesters.length);
        string[] memory _name = new string[](requesters.length);
        string[] memory _email = new string[](requesters.length);
        
        for(uint i = 0; i< requesters.length; i++){
            _did[i] = requesters[i].did;
            _isValid[i] = requesters[i].isValid;
            _name[i] = requesters[i].name;
            _email[i] = requesters[i].email;
        }
        did = _did;
        isValid = _isValid;
        name = _name;
        email = _email;
    }

    function getMemberStatus(string memory _groupId, bytes32 _userDid) external view returns(bool){
        GroupBox memory groupBox = groups[_groupId];
        return groupBox.group.getMember(_userDid);
    }
}
