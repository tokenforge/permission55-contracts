import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { GeSAct20v1, GeSAct20v1__factory, Permissions55 } from "../../typechain";
import { ethers } from "hardhat";
import { deployPermissions, setupSignersEx } from "./fixtures";

const VALUES_ISIN = "ISIN123456789";
const VALUES_ISSUER_NAME = "Unlimited Financial Services";
const VALUES_RECORD_KEEPING = "individual";

export async function deployTokenGeSact20forPermissionSetId(
    deployer: SignerWithAddress,
    permissions: Permissions55,
    permissionSetId: number
): Promise<GeSAct20v1> {
    const tokenFactory = (await ethers.getContractFactory("GeSAct20v1", deployer)) as GeSAct20v1__factory;

    const params: GeSAct20v1.ContractParametersStruct = {
        isin: VALUES_ISIN,
        issuerName: VALUES_ISSUER_NAME,
        recordKeeping: VALUES_RECORD_KEEPING,
        mixedRecordKeeping: "1",
        thirdPartyRights: "",
        terms: "ALl rights reserved.",
        transferRestrictions:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    };

    const token = await tokenFactory
        .connect(deployer)
        .deploy(permissions.address, permissionSetId, "Coin", "CCC", "", params);

    return await token.deployed();
}

export async function deployTokenGeSact20() {
    const signers = await setupSignersEx();

    const defaultPermissionSetId = 0;
    const { permissions } = await deployPermissions();

    const token = await deployTokenGeSact20forPermissionSetId(signers.deployer, permissions, defaultPermissionSetId);

    return { token, permissions, signers };
}
