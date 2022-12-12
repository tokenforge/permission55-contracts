import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {mintingRoles} from "../utils/deployUtils";

const CONTRACT_NAME = "Permissions55";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, network, getNamedAccounts} = hre;
    const {log} = deployments;

    const {deployer} = await getNamedAccounts();
    console.log("Mint Permission55 tokens using Deployer", deployer);

    const token = await deployments.get(CONTRACT_NAME);
    console.log("Permissions55-Address: ", token.address);

    await mintingRoles(hre, CONTRACT_NAME);

    log("Ready.");
};
export default func;
func.dependencies = [CONTRACT_NAME];
func.tags = [CONTRACT_NAME + "Setup"];
func.runAtTheEnd = true;
