// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
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

    function getGroups(string memory _id) external view returns(GroupBox memory){
        return groups[_id];
    }
}
