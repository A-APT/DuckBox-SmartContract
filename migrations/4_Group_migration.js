const Group = artifacts.require("Group");
let _groupId = "groupId";
let _groupOwnerDid = "groupOwnerDid";

module.exports = function (deployer){
    deployer.deploy(Group, _groupId, _groupOwnerDid);
};
