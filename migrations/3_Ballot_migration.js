const Ballot = artifacts.require("Ballot");

module.exports = function (deployer) {
    deployer.deploy(Ballot, ["0x53696c7665720000000000000000000000000000000000000000000000000000"]);
};
