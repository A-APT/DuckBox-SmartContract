const DecentralizedId = artifacts.require("DecentralizedId");

module.exports = function (deployer) {
    deployer.deploy(DecentralizedId, "0x10a6B7480356Fd74559C9CfAc90EA8d5790fCa51");
};
