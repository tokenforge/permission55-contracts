import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;

    const { deployer } = await getNamedAccounts();

    const permissions = await deployments.get("GREBI_Permissions55");
    console.log("Using Permissions55: " + permissions.address);

    const instance = await deploy("GREBI_GeSActFactory", {
        contract: 'GeSActFactory',
        from: deployer,
        args: [permissions.address],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    });

    log("GeSActFactory-Factory: " + instance.address);

    // The transaction that was sent to the network to deploy the Contract
    log("- Transaction: " + instance.transactionHash);

    log("Ready.");
};
export default func;
func.dependencies = ["GREBI_Permissions55"];
func.tags = ["GREBI_GeSActFactory"];
