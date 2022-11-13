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

    operator1: SignerWithAddress;
    operator2: SignerWithAddress;
    
    fraudster: SignerWithAddress;
};

export async function setupSigners() {
    const [deployer, axel, ben, chantal, minter1, minter2] = await ethers.getSigners();
    return { deployer, axel, ben, chantal, minter1, minter2 };
}

export async function setupSignersEx(): Promise<TestSigners> {
    const [deployer, axel, ben, chantal, minter1, minter2, operator1, operator2, random, fraudster] = await ethers.getSigners();
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
        fraudster
    };
}

export async function deployPermissions() {
    const { deployer } = await setupSigners();

    const permissionsFactory = (await ethers.getContractFactory("Permissions55", deployer)) as Permissions55__factory;
    const permissions = await permissionsFactory.deploy("https://admin-token-uri");
    await permissions.deployed();

    return { permissions };
}
