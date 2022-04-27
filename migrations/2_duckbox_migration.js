const DecentralizedId = artifacts.require("DecentralizedId");
const Groups = artifacts.require("Groups");
const Ballots = artifacts.require("Ballots");

module.exports = function (deployer){
    deployer.deploy(DecentralizedId).then(function(){
        return deployer.deploy(Groups, DecentralizedId.address).then(function(){
            // return deployer.deploy(Ballots, DecentralizedId.address);
        });
    });
};
