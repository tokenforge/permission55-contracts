import { ethers } from "hardhat";
import { Permissions55__factory } from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export type TestSigners = {
    random: SignerWithAddress;
    axel: SignerWithAddress;
    ben: SignerWithAddress;
    chantal: SignerWithAddress;

    deployer: SignerWithAddress;

    minter1: SignerWithAddress;
    minter2: SignerWithAddress;

    whitelister: SignerWithAddress;
    
    operator1: SignerWithAddress;
    operator2: SignerWithAddress;
    
    fraudster: SignerWithAddress;
    
};

export async function setupSigners() {
    const [deployer, axel, ben, chantal, minter1, minter2, whitelister, fraudster, unknown] = await ethers.getSigners();
    return { deployer, axel, ben, chantal, minter1, minter2, whitelister, fraudster, unknown };
}

export async function setupSignersEx(): Promise<TestSigners> {
    const [deployer, axel, ben, chantal, minter1, minter2, operator1, operator2, whitelister, random, fraudster] = await ethers.getSigners();
    return {
        deployer,
        axel,
        ben,
        chantal,
        minter1,
        minter2,
        operator1,
        operator2,
        random,
        whitelister,
        fraudster
    };
}

export async function deployPermissions() {
    const signers = await setupSignersEx();

    const permissionsFactory = (await ethers.getContractFactory("Permissions55", signers.deployer)) as Permissions55__factory;
    const permissions = await permissionsFactory.deploy("https://admin-token-uri");
    await permissions.deployed();
    
    return { permissions, deployer: signers.deployer, signers };
}
