import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {mintingRoles} from "../utils/deployUtils";

const PERM55_CONTRACT_NAME = "TF_Permissions55";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { log } = deployments;

    const { deployer } = await getNamedAccounts();
    console.log("Mint TF_Permission55 tokens using Deployer", deployer);

    const token = await deployments.get(PERM55_CONTRACT_NAME);
    console.log(PERM55_CONTRACT_NAME + "-Address:", token.address);

    await mintingRoles(hre, PERM55_CONTRACT_NAME);

    log("Ready.");
};
export default func;
func.dependencies = [PERM55_CONTRACT_NAME];
func.tags = [PERM55_CONTRACT_NAME + "_Minting"];
func.runAtTheEnd = true;
