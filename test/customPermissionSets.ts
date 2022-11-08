import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";
import { deployPermissions, setupSignersEx } from "./lib/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PermissionsOverwriter__factory } from "../typechain";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("Custom PermissionSet Overwriter tests", () => {
    const myCustomPermissionSetId = 42;

    async function deployCustomPermissionSetForTesting() {
        const signers = await setupSignersEx();
        const { permissions } = await loadFixture(deployPermissions);

        return { permissions, signers };
    }

    async function deployPermissionsAwareMock() /*: Promise<{ permissionsAwareMock: PermissionsAwareMock, signers: TestSigners }>*/ {
        const { permissions, signers } = await deployCustomPermissionSetForTesting();

        const permissionsOverwriterFactory = (await ethers.getContractFactory(
            "PermissionsOverwriter",
            signers.deployer
        )) as PermissionsOverwriter__factory;
        const permissionsOverwriter = await permissionsOverwriterFactory.deploy(permissions.address, 0);

        await permissionsOverwriter.deployed();

        return { permissionsOverwriter: permissionsOverwriter, permissions, signers };
    }

    /*it('should return the right name for custom permission-set', async () => {
        const { permissions } = await loadFixture(deployCustomPermissionSetForTesting);
        
        expect(await permissions.permissionSet(myCustomPermissionSetId)).to.eq('CustomSet2')
    })*/

    it("should check the correct roles in their originals", async () => {
        const { permissionsOverwriter, permissions, signers } = await loadFixture(deployPermissionsAwareMock);

        expect(
            await permissionsOverwriter["hasRole(uint256,address)"](
                await permissions.TOKEN_ROLE_MINTER(),
                signers.ben.address
            )
        ).to.be.false;
    });

    it("should fail with custom RoleID when it was not setup correctly", async () => {
        const { permissionsOverwriter, permissions, signers } = await loadFixture(deployPermissionsAwareMock);

        const transformedRoleId = await permissionsOverwriter.transformedRoleId(
            myCustomPermissionSetId,
            await permissions.TOKEN_ROLE_MINTER()
        );

        await permissions.createOrMint(signers.ben.address, transformedRoleId, "minter://");

        expect(
            await permissionsOverwriter["hasRole(uint256,address)"](
                await permissions.TOKEN_ROLE_MINTER(),
                signers.ben.address
            )
        ).to.be.false;
    });

    it("should enable overwrite for IS_WHITELISTED if WHITELIST_ADMIN will be overwritten", async () => {
        const {permissionsOverwriter, permissions} = await loadFixture(deployPermissionsAwareMock);

        expect(await permissionsOverwriter.isRoleIdOverwritten(await permissions.TOKEN_ROLE_IS_WHITELISTED())).to.be.false;
        
        await permissionsOverwriter.setPermissionSetId(myCustomPermissionSetId);
        await permissionsOverwriter.setRoleIdOverwrite(await permissions.TOKEN_ROLE_WHITELIST_ADMIN(), true);
        
        expect(await permissionsOverwriter.isRoleIdOverwritten(await permissions.TOKEN_ROLE_IS_WHITELISTED())).to.be.true;
    })

    it("should enable overwrite for IS_BLACKLISTED if BLACKLIST_ADMIN will be overwritten", async () => {
        const {permissionsOverwriter, permissions} = await loadFixture(deployPermissionsAwareMock);

        expect(await permissionsOverwriter.isRoleIdOverwritten(await permissions.TOKEN_ROLE_IS_BLACKLISTED())).to.be.false;

        await permissionsOverwriter.setPermissionSetId(myCustomPermissionSetId);
        await permissionsOverwriter.setRoleIdOverwrite(await permissions.TOKEN_ROLE_BLACKLIST_ADMIN(), true);

        expect(await permissionsOverwriter.isRoleIdOverwritten(await permissions.TOKEN_ROLE_IS_BLACKLISTED())).to.be.true;
    })

    it("should check the correct roles with overwritten roleIds", async () => {
        const { permissionsOverwriter, permissions, signers } = await loadFixture(deployPermissionsAwareMock);

        await permissionsOverwriter.setPermissionSetId(myCustomPermissionSetId);
        await permissionsOverwriter.setRoleIdOverwrite(await permissions.TOKEN_ROLE_MINTER(), true);

        const roleIdMinter = (await permissions.TOKEN_ROLE_MINTER()).add(myCustomPermissionSetId * 1000);
        const transformedRoleId = await permissionsOverwriter.transformedRoleId(
            myCustomPermissionSetId,
            await permissions.TOKEN_ROLE_MINTER()
        );

        expect(roleIdMinter).to.eq(transformedRoleId);

        await permissions.createOrMint(signers.ben.address, roleIdMinter, "minter://");
        
        console.log(await permissions.balanceOf(signers.ben.address, roleIdMinter));

        expect(
            await permissionsOverwriter["hasRole(uint256,address)"](
                await permissions.TOKEN_ROLE_MINTER(),
                signers.ben.address
            )
        ).to.be.true;
    });
});
