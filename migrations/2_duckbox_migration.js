const DecentralizedId = artifacts.require("DecentralizedId");
const Groups = artifacts.require("Groups");
const Ballots = artifacts.require("Ballots");
const blindsig = artifacts.require("BlindSigSecp256k1");
const ellCurve = artifacts.require("EllipticCurve");

module.exports = async function (deployer){
    await deployer.deploy(ellCurve);
    await deployer.link(ellCurve, [blindsig]);
    await deployer.deploy(blindsig);
    await deployer.link(blindsig, [Ballots]);

    await deployer.deploy(DecentralizedId)
    await deployer.deploy(Groups, DecentralizedId.address)
    await deployer.deploy(Ballots, DecentralizedId.address);
};
