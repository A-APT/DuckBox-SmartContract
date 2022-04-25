const Ballot = artifacts.require("Ballot");
const Ballots = artifacts.require("Ballots");
const blindsig = artifacts.require("BlindSigSecp256k1");
const ellCurve = artifacts.require("EllipticCurve");

let startTime = Math.floor(Date.now() / 1000)
let endTime = startTime + 100

module.exports = async function (deployer) {
    await deployer.deploy(ellCurve);
    await deployer.link(ellCurve, [blindsig]);
    await deployer.deploy(blindsig);
    await deployer.link(blindsig, [Ballot, Ballots]);
    await deployer.deploy(Ballot, ["candidate1"], true, startTime, endTime, ["voter1", "voter2"]);
    await deployer.deploy(Ballots);
};
