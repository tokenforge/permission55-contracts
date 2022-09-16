import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts} = hre;
    const {deploy, execute, log} = deployments;

    const {deployer} = await getNamedAccounts();
    
    console.log("Deployer", deployer)
    
    // WE use existing instance
    
    const instance = await deploy('Permissions55', {
        from: deployer,
        args: ['https://token-forge.io'],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    });
    
    log("Factory: " + instance.address);

    // The transaction that was sent to the network to deploy the Contract
    log("- Transaction: " + instance.transactionHash);
    
    log("Ready.");

};
export default func;
func.tags = ['Permissions55'];
