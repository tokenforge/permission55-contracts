import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {determineRolesToMint} from "../utils/deployUtils";

const CONTRACT_NAME = "Permissions55";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, network, getNamedAccounts } = hre;
    const { deploy, execute, log } = deployments;

    const { deployer } = await getNamedAccounts();
    console.log("Deployer: ", deployer);

    const instance = await deploy(CONTRACT_NAME, {
        from: deployer,
        args: ["https://token-forge.io"],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    });

    log(CONTRACT_NAME + ': ' + instance.address);

    // The transaction that was sent to the network to deploy the Contract
    log("- Transaction: " + instance.transactionHash);

    log("Ready.");
};
export default func;
func.tags = [CONTRACT_NAME];
