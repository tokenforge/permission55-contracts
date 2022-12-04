import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, execute, read, log } = deployments;

    const { deployer } = await getNamedAccounts();
    console.log("Mint GREBI_Permission55 tokens using Deployer", deployer);

    const token = await deployments.get("GREBI_Permissions55");
    console.log("GREBI_Permissions55-Address:", token.address);

    let bal = await read("GREBI_Permissions55", "balanceOf", "0xe18F1eF7290357d8687eC268BF66a903BF17Ef81", 1 )
    if(bal.toNumber() == 0) {
        await execute(
            "GREBI_Permissions55",
            {from: deployer, log: true},
            "createOrMint",
            "0xe18F1eF7290357d8687eC268BF66a903BF17Ef81",
            1, 'ipfs://QmdQNC9ASzTCGwrRYqx4MfKWx1M7JAX4bq1x15nBM9Wc1Q'
        );
    }

    bal = await read("GREBI_Permissions55", "balanceOf", "0xC1dAe5cE49FA879b8902F8991D33DE2Bf21605C0", 1 )
    if(bal.toNumber() == 0) {
        await execute(
            "GREBI_Permissions55",
            {from: deployer, log: true},
            "createOrMint",
            "0xC1dAe5cE49FA879b8902F8991D33DE2Bf21605C0",
            1, 'ipfs://QmdQNC9ASzTCGwrRYqx4MfKWx1M7JAX4bq1x15nBM9Wc1Q'
        );
    }

    log("Ready.");
};
export default func;
func.dependencies = ["GREBI_Permissions55"];
func.tags = ["GREBI_Permissions55Minting"];
func.runAtTheEnd = true;
