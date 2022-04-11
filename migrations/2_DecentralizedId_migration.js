const DecentralizedId = artifacts.require("DecentralizedId");
const Groups = artifacts.require("Groups");

module.exports = function (deployer){
    deployer.deploy(DecentralizedId).then(function(){
        return deployer.deploy(Groups, DecentralizedId.address);
    });
};
