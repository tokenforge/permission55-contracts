import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, execute, log } = deployments;

    const { deployer } = await getNamedAccounts();
    console.log("Deployer", deployer);

    const token = await deployments.get("Permissions55");
    console.log("Permissions55-Address:", token.address);

    await execute(
        "Permissions55",
        { from: deployer, log: true },
        "createOrMint",
        "0xe18F1eF7290357d8687eC268BF66a903BF17Ef81",
        1 , 'ipfs://QmdQNC9ASzTCGwrRYqx4MfKWx1M7JAX4bq1x15nBM9Wc1Q'
    );

    await execute(
        "Permissions55",
        { from: deployer, log: true },
        "createOrMint",
        "0xC1dAe5cE49FA879b8902F8991D33DE2Bf21605C0",
        1, 'ipfs://QmdQNC9ASzTCGwrRYqx4MfKWx1M7JAX4bq1x15nBM9Wc1Q'
    );

    //await execute('Permissions55', {from: deployer, log: true}, 'create', '0xe18F1eF7290357d8687eC268BF66a903BF17Ef81', 2, '');

    //await execute('Permissions55', {from: deployer, log: true}, 'mint', '0xC1dAe5cE49FA879b8902F8991D33DE2Bf21605C0', 2);
    // await execute('Permissions55', {from: deployer, log: true}, 'create', '0xC1dAe5cE49FA879b8902F8991D33DE2Bf21605C0', 2, '');

    log("Ready.");
};
export default func;
func.dependencies = ["Permissions55"];
func.tags = ["Permissions55Minting"];
