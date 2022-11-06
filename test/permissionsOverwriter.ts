import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {PermissionsOverwriter__factory} from "../typechain";
import {ethers} from "hardhat";
import {deployPermissions, setupSignersEx} from "./lib/fixtures";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";

chai.use(chaiAsPromised);
const {expect} = chai;


describe('Custom PermissionSet', () => {
    const myDefaultCustomPermissionSetId = 11;
    const myNewCustomPermissionSetId = 42;

    async function deployPermissionsOverwriter() {
        const signers = await setupSignersEx();
        const {permissions} = await loadFixture(deployPermissions);


        const permissionsOverwriterFactory = (await ethers.getContractFactory('PermissionsOverwriter', signers.deployer)) as PermissionsOverwriter__factory;
        const permissionsOverwriter = await permissionsOverwriterFactory.deploy(permissions.address, myDefaultCustomPermissionSetId);
        await permissionsOverwriter.deployed();

        return {permissions, permissionsOverwriter, signers};
    }

    it('permissions Overwriter has the write permission set id', async () => {
        const {permissionsOverwriter} = await loadFixture(deployPermissionsOverwriter);

        expect(await permissionsOverwriter.getPermissionSetId()).to.eq(myDefaultCustomPermissionSetId);
    })

    it('should emit PermissionSetIdChanged-Event upon changing PermissionSetID', async () => {
        const {permissionsOverwriter} = await loadFixture(deployPermissionsOverwriter);

        expect(permissionsOverwriter.setPermissionSetId(myNewCustomPermissionSetId))
            .to.emit(permissionsOverwriter, 'PermissionSetIdChanged')
            .withArgs(myDefaultCustomPermissionSetId, myNewCustomPermissionSetId)
    })

    it.only('should emit PermissionSetIdChanged-Event upon changing PermissionSetID', async () => {
        const {permissions, permissionsOverwriter} = await loadFixture(deployPermissionsOverwriter);

        const affectedRoleIds = {
            TOKEN_ROLE_MINTER: await permissions.TOKEN_ROLE_MINTER(),
            TOKEN_ROLE_WHITELIST_ADMIN: await permissions.TOKEN_ROLE_WHITELIST_ADMIN(),
            TOKEN_ROLE_TRANSFERER: await permissions.TOKEN_ROLE_TRANSFERER(),
            TOKEN_ROLE_OPERATOR: await permissions.TOKEN_ROLE_OPERATOR(),
            TOKEN_ROLE_IS_WHITELISTED: await permissions.TOKEN_ROLE_IS_WHITELISTED()
        };

        await expect(permissionsOverwriter.setPermissionSetId(myNewCustomPermissionSetId))
            .to.emit(permissionsOverwriter, 'CustomRoleTokenRemoved')
            .withArgs(affectedRoleIds.TOKEN_ROLE_MINTER, affectedRoleIds.TOKEN_ROLE_MINTER.add(myDefaultCustomPermissionSetId * 1000))
            .to.emit(permissionsOverwriter, 'CustomRoleTokenRemoved')
            .withArgs(affectedRoleIds.TOKEN_ROLE_WHITELIST_ADMIN, affectedRoleIds.TOKEN_ROLE_WHITELIST_ADMIN.add(myDefaultCustomPermissionSetId * 1000))
            .to.emit(permissionsOverwriter, 'CustomRoleTokenRemoved')
            .withArgs(affectedRoleIds.TOKEN_ROLE_TRANSFERER, affectedRoleIds.TOKEN_ROLE_TRANSFERER.add(myDefaultCustomPermissionSetId * 1000))
            .to.emit(permissionsOverwriter, 'CustomRoleTokenRemoved')
            .withArgs(affectedRoleIds.TOKEN_ROLE_OPERATOR, affectedRoleIds.TOKEN_ROLE_OPERATOR.add(myDefaultCustomPermissionSetId * 1000))
            .to.emit(permissionsOverwriter, 'CustomRoleTokenRemoved')
            .withArgs(affectedRoleIds.TOKEN_ROLE_IS_WHITELISTED, affectedRoleIds.TOKEN_ROLE_IS_WHITELISTED.add(myDefaultCustomPermissionSetId * 1000))

            .to.emit(permissionsOverwriter, 'CustomRoleTokenAdded')
            .withArgs(affectedRoleIds.TOKEN_ROLE_MINTER, affectedRoleIds.TOKEN_ROLE_MINTER.add(myNewCustomPermissionSetId * 1000))
            .to.emit(permissionsOverwriter, 'CustomRoleTokenAdded')
            .withArgs(affectedRoleIds.TOKEN_ROLE_WHITELIST_ADMIN, affectedRoleIds.TOKEN_ROLE_WHITELIST_ADMIN.add(myNewCustomPermissionSetId * 1000))
            .to.emit(permissionsOverwriter, 'CustomRoleTokenAdded')
            .withArgs(affectedRoleIds.TOKEN_ROLE_TRANSFERER, affectedRoleIds.TOKEN_ROLE_TRANSFERER.add(myNewCustomPermissionSetId * 1000))
            .to.emit(permissionsOverwriter, 'CustomRoleTokenAdded')
            .withArgs(affectedRoleIds.TOKEN_ROLE_OPERATOR, affectedRoleIds.TOKEN_ROLE_OPERATOR.add(myNewCustomPermissionSetId * 1000))
            .to.emit(permissionsOverwriter, 'CustomRoleTokenAdded')
            .withArgs(affectedRoleIds.TOKEN_ROLE_IS_WHITELISTED, affectedRoleIds.TOKEN_ROLE_IS_WHITELISTED.add(myNewCustomPermissionSetId * 1000))
        ;

        // Check overwritten tokens

        // 1. exemplary for TOKEN_ROLE_MINTER:
        expect(await permissionsOverwriter.getCustomRoleTokenCount(affectedRoleIds.TOKEN_ROLE_MINTER)).to.eq(1);
        expect(await permissionsOverwriter.getCustomRoleTokenAt(affectedRoleIds.TOKEN_ROLE_MINTER, 0)).to.eq(affectedRoleIds.TOKEN_ROLE_MINTER.add(myNewCustomPermissionSetId * 1000));
        expect(await permissionsOverwriter.getCustomRoleTokens(affectedRoleIds.TOKEN_ROLE_MINTER)).to.be.eql([affectedRoleIds.TOKEN_ROLE_MINTER.add(myNewCustomPermissionSetId * 1000)]);

        // 2. as loop upon all roleIds: 
        type ObjectKey = keyof typeof affectedRoleIds;
        for (const tokenRoleIdIdx in affectedRoleIds) {
            const roleId = affectedRoleIds[tokenRoleIdIdx as ObjectKey];

            expect(await permissionsOverwriter.getCustomRoleTokenCount(roleId.toNumber())).to.eq(1);
            expect(await permissionsOverwriter.getCustomRoleTokenAt(roleId, 0)).to.eq(roleId.add(myNewCustomPermissionSetId * 1000));
        }

    })

});


