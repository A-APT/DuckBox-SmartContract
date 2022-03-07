const DecentralizedId = artifacts.require("DecentralizedId");

module.exports = function (deployer) {
    deployer.deploy(DecentralizedId);
};
