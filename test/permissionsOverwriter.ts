import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PermissionsOverwriter__factory } from "../typechain";
import { ethers } from "hardhat";
import { deployPermissions, setupSignersEx } from "./lib/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("Custom PermissionSet", () => {
    const myDefaultCustomPermissionSetId = 11;
    const myNewCustomPermissionSetId = 42;

    async function deployPermissionsOverwriter() {
        const signers = await setupSignersEx();
        const { permissions } = await loadFixture(deployPermissions);

        const permissionsOverwriterFactory = (await ethers.getContractFactory(
            "PermissionsOverwriter",
            signers.deployer
        )) as PermissionsOverwriter__factory;
        const permissionsOverwriter = await permissionsOverwriterFactory.deploy(
            permissions.address,
            myDefaultCustomPermissionSetId
        );
        await permissionsOverwriter.deployed();

        return { permissions, permissionsOverwriter, signers };
    }

    it("permissions Overwriter has the write permission set id", async () => {
        const { permissionsOverwriter } = await loadFixture(deployPermissionsOverwriter);

        await expect(await permissionsOverwriter.getPermissionSetId()).to.eq(myDefaultCustomPermissionSetId);
    });

    it("should emit PermissionSetIdChanged-Event upon changing PermissionSetID", async () => {
        const { permissionsOverwriter } = await loadFixture(deployPermissionsOverwriter);

        await expect(permissionsOverwriter.setPermissionSetId(myNewCustomPermissionSetId))
            .to.emit(permissionsOverwriter, "PermissionSetIdChanged")
            .withArgs(myDefaultCustomPermissionSetId, myNewCustomPermissionSetId);
    });

    it("should revert with ErrPermissionSetIDWasAlreadySet-Event when no changes will happen", async () => {
        const { permissionsOverwriter } = await loadFixture(deployPermissionsOverwriter);

        await expect(permissionsOverwriter.setPermissionSetId(await permissionsOverwriter.getPermissionSetId()))
            .to.be.revertedWithCustomError(permissionsOverwriter, "ErrPermissionSetIDWasAlreadySet")
            .withArgs();
    });
    
    it("should emit PermissionSetIdChanged-Event upon changing PermissionSetID", async () => {
        const { permissions, permissionsOverwriter } = await loadFixture(deployPermissionsOverwriter);

        await expect(permissionsOverwriter.setRoleIdOverwrite(await permissions.TOKEN_ROLE_WHITELIST_ADMIN(), true))
            .to.emit(permissionsOverwriter, "SetRoleIdOverwritten")
            .withArgs(await permissions.TOKEN_ROLE_WHITELIST_ADMIN(), true)
            .to.emit(permissionsOverwriter, "SetRoleIdOverwritten")
            .withArgs(await permissions.TOKEN_ROLE_IS_WHITELISTED(), true)
        ;
    });

    it("should revert when non-admin will try to change permissions-set-id", async () => {
        const signers = await setupSignersEx();
        const { permissionsOverwriter } = await loadFixture(deployPermissionsOverwriter);

        const asFraudster = permissionsOverwriter.connect(signers.fraudster);
        await expect(asFraudster.setPermissionSetId(123))
            .to.be.revertedWith(`AccessControl: account ${signers.fraudster.address.toLowerCase()} is missing role 0x01`)
    });


});
