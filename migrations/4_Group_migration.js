const Group = artifacts.require("Group");
let _groupOwnerDid = "groupOwnerDid";

module.exports = function (deployer){
    deployer.deploy(Group, _groupOwnerDid);
};
