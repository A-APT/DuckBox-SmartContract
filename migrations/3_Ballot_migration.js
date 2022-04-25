const Ballot = artifacts.require("Ballot");
const Ballots = artifacts.require("Ballots");
const blindsig = artifacts.require("BlindSigSecp256k1");
const ellCurve = artifacts.require("EllipticCurve");
const DecentralizedId = artifacts.require("DecentralizedId");

let startTime = Math.floor(Date.now() / 1000)
let endTime = startTime + 100
let PUBKEYx = BigInt("0x4719ded852f84728c0e25e2a7111e880f4ef516155f62e3db82be7b2981b0323")
let PUBKEYy = BigInt("0xe84813d29f2125b707bc94244aec3c3d52a8025b5f7c988c92736daa22a621ac")

module.exports = async function (deployer) {
    await deployer.deploy(ellCurve);
    await deployer.link(ellCurve, [blindsig]);
    await deployer.deploy(blindsig);
    await deployer.link(blindsig, [Ballot, Ballots]);
    await deployer.deploy(DecentralizedId);
    await deployer.deploy(Ballot, PUBKEYx, PUBKEYy, ["candidate1"], true, startTime, endTime, ["0x11", "0x22"]);
    await deployer.deploy(Ballots, DecentralizedId.address);
};
