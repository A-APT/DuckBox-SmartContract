const Group = artifacts.require("Group");
const ethers = require('ethers');

let groupID = "groupId";
let ownerDid =  ethers.utils.formatBytes32String("owner");;

module.exports = function (deployer){
    deployer.deploy(Group, groupID, ownerDid);
};
