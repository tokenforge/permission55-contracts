import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;

    const { deployer } = await getNamedAccounts();

    return;

    const permissions = await deployments.get("Permissions55");
    console.log("Using Permissions55: " + permissions.address);

    const factoryV2 = await deployments.get("SPVFactoryV2");
    console.log("Memorizing SPVFactoryV2: " + factoryV2.address);

    const instance = await deploy("SPVFactoryV3", {
        from: deployer,
        args: [permissions.address],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    });

    log("SPV3-Factory: " + instance.address);

    // The transaction that was sent to the network to deploy the Contract
    log("- Transaction: " + instance.transactionHash);

    log("Ready.");
};
export default func;
func.tags = ["SPVFactoryV2"];
