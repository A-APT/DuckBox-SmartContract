const Ballot = artifacts.require("Ballot");

let startTime = Math.floor(Date.now() / 1000)
let endTime = startTime + 100

module.exports = function (deployer) {
    deployer.deploy(Ballot, ["candidate1"], true, startTime, endTime, ["voter1", "voter2"]);
};
