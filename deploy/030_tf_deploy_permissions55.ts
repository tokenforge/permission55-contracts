import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const CONTRACT_NAME = "TF_Permissions55";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;

    const { deployer } = await getNamedAccounts();

    console.log("Deployer", deployer);

    // WE use existing instance

    const instance = await deploy(CONTRACT_NAME, {
        contract: "Permissions55",
        from: deployer,
        args: ["https://token-forge.io"],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    });

    log(CONTRACT_NAME + ": " + instance.address);

    // The transaction that was sent to the network to deploy the Contract
    log("- Transaction: " + instance.transactionHash);

    
};
export default func;
func.tags = [CONTRACT_NAME];
