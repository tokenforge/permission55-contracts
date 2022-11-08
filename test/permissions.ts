import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import {deployPermissions, setupSigners, setupSignersEx} from "./lib/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("Permissions55", () => {

    async function setupPermissionsLocally() {
        const { axel, ben, chantal } = await setupSigners();
        const { permissions } = await loadFixture(deployPermissions);

        await permissions.create(axel.address, 2, "https://axel");
        await permissions.mint(ben.address, 2);
        await permissions.mint(chantal.address, 2);
        await permissions.create(ben.address, 3, "https://ben");
        await permissions.mint(chantal.address, 3);

        return { permissions };
    }


    it("Counter 1", async () => {
        const { permissions } = await loadFixture(deployPermissions);

        await permissions.incCounter();
        expect(await permissions.getCounter()).to.eq(1);
    });

    it("Counter 2", async () => {
        const { permissions } = await loadFixture(deployPermissions);

        await permissions.incCounter();
        expect(await permissions.getCounter()).to.eq(1);
    });

    it("Deployer will have all rights", async () => {
        const { deployer } = await setupSigners();
        const { permissions } = await loadFixture(deployPermissions);

        expect(await permissions.isAdmin(deployer.address, 0)).to.be.true;
        expect(await permissions.isAdmin(deployer.address, 1)).to.be.true;
        expect(await permissions.isAdmin(deployer.address, 2)).to.be.true;
    });

    it("will check roles specifically", async () => {
        const { axel, ben, deployer } = await setupSigners();
        const { permissions } = await loadFixture(deployPermissions);

        const TOKEN_ROLE_ADMIN = await permissions.TOKEN_ROLE_ADMIN();
        const TOKEN_ROLE_DEPLOYER = await permissions.TOKEN_ROLE_DEPLOYER();
        const TOKEN_ROLE_WHITELIST_ADMIN = await permissions.TOKEN_ROLE_WHITELIST_ADMIN();
        const TOKEN_ROLE_BLACKLIST_ADMIN = await permissions.TOKEN_ROLE_BLACKLIST_ADMIN();
        const TOKEN_ROLE_MINTER = await permissions.TOKEN_ROLE_MINTER();
        const TOKEN_ROLE_TRANSFERER = await permissions.TOKEN_ROLE_TRANSFERER();
        const TOKEN_ROLE_OPERATOR = await permissions.TOKEN_ROLE_OPERATOR();
        const TOKEN_ROLE_IS_WHITELISTED = await permissions.TOKEN_ROLE_IS_WHITELISTED();
        const TOKEN_ROLE_IS_BLACKLISTED = await permissions.TOKEN_ROLE_IS_BLACKLISTED();

        interface DataRec {
            mintId: BigNumber;
            account: SignerWithAddress;
            success: boolean;
            requiredId: BigNumber;
        }

        await permissions.create(axel.address, TOKEN_ROLE_WHITELIST_ADMIN, "https://blacklist.token-forge.io");
        await permissions.create(ben.address, TOKEN_ROLE_BLACKLIST_ADMIN, "https://blacklist.token-forge.io");

        const tokenIds: Array<DataRec> = [
            { mintId: TOKEN_ROLE_ADMIN, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN },
            { mintId: TOKEN_ROLE_ADMIN, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN }, // because it is an admin already, we don't care
            { mintId: TOKEN_ROLE_DEPLOYER, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN },
            { mintId: TOKEN_ROLE_DEPLOYER, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN }, // because it is an admin already, we don't care
            { mintId: TOKEN_ROLE_OPERATOR, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN }, // because it is an admin already, we don't care
            { mintId: TOKEN_ROLE_TRANSFERER, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN }, // because it is an admin already, we don't care
            { mintId: TOKEN_ROLE_MINTER, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN }, // because it is an admin already, we don't care
            { mintId: TOKEN_ROLE_WHITELIST_ADMIN, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN },
            { mintId: TOKEN_ROLE_IS_WHITELISTED, account: axel, success: true, requiredId: TOKEN_ROLE_WHITELIST_ADMIN },
            { mintId: TOKEN_ROLE_IS_WHITELISTED, account: ben, success: false, requiredId: TOKEN_ROLE_WHITELIST_ADMIN },
            { mintId: TOKEN_ROLE_IS_WHITELISTED, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN },

            {
                mintId: TOKEN_ROLE_IS_BLACKLISTED,
                account: axel,
                success: false,
                requiredId: TOKEN_ROLE_BLACKLIST_ADMIN,
            },
            { mintId: TOKEN_ROLE_IS_BLACKLISTED, account: ben, success: true, requiredId: TOKEN_ROLE_BLACKLIST_ADMIN },
            { mintId: TOKEN_ROLE_IS_BLACKLISTED, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN },
        ];

        for (const test of tokenIds) {
            // let k: "a" | "b" | "c"
            const { mintId, success, account, requiredId: requiredTokenId } = test;

            const [_success, _requiredId] = await permissions.checkMintingPermissions(
                account.address,
                mintId.toNumber()
            );
            
            expect(_success).to.eq(success);
            expect(_requiredId).to.eq(requiredTokenId);
        }
    });

    it("Deployer will be allowed to register permission sets although it is not ROLE_DEPLOYER but ROLE_ADMIN", async () => {
        const { permissions } = await loadFixture(deployPermissions);

        await expect(permissions.registerPermissionSet("test"))
            .to.emit(permissions, "PermissionSetAdded")
            .withArgs(1, "test");
    });

    it("It wont be allowed to register permission sets as non-deployer", async () => {
        const { axel } = await setupSigners();
        const { permissions } = await loadFixture(deployPermissions);

        const permissionsAsAxel = permissions.connect(axel);
        await expect(permissionsAsAxel.registerPermissionSet("test")).to.be.revertedWith(
            `Permission55: Admin or Deployer roles required`
        );
    });

    it("It wont be allowed to remove permission sets as non-deployer", async () => {
        const { axel } = await setupSigners();
        const { permissions } = await loadFixture(deployPermissions);

        await permissions.registerPermissionSet("test");

        const permissionsAsAxel = permissions.connect(axel);
        await expect(permissionsAsAxel.removePermissionSet(1)).to.be.revertedWith(
            `Permission55: Admin or Deployer roles required`
        );
    });

    it("Will give me a list of specific Role-token holders", async () => {
        const { axel, ben, chantal, deployer } = await setupSigners();
        const { permissions } = await deployPermissions();

        await permissions.create(axel.address, 2, "https://tokens/2");
        await permissions.mint(ben.address, 2);
        await permissions.mint(chantal.address, 2);

        await permissions.create(chantal.address, 3, "https://tokens/3");

        // Deployer got an ADMIN token initially (Token #1)
        const holdersFor1 = await permissions.ownersOf(1);
        expect(holdersFor1).to.eql([deployer.address]);

        // Axel, Ben and Chantal hold Token #2
        const holdersFor2 = await permissions.ownersOf(2);
        expect(holdersFor2).to.eql([axel.address, ben.address, chantal.address]);

        // Only Ben & Chantal holds Token #3
        const holdersFor3 = await permissions.ownersOf(3);
        expect(holdersFor3).to.eql([chantal.address]);
    });

    it("Creation of token will emit the right events", async () => {
        const { axel, ben, chantal, deployer, minter1 } = await setupSigners();
        const { permissions } = await deployPermissions();

        await expect(permissions.create(minter1.address, await permissions.TOKEN_ROLE_MINTER(), "https://whitelisted"))
            .to.emit(permissions, "TransferSingle")
            .withArgs(
                deployer.address,
                ethers.constants.AddressZero,
                minter1.address,
                await permissions.TOKEN_ROLE_MINTER(),
                1
            );

        // Whitelisting share holders: Axel, Ben, Chantal
        await expect(
            permissions.create(axel.address, await permissions.TOKEN_ROLE_IS_WHITELISTED(), "https://is_whitelisted")
        )
            .to.emit(permissions, "TransferSingle")
            .withArgs(
                deployer.address,
                ethers.constants.AddressZero,
                axel.address,
                await permissions.TOKEN_ROLE_IS_WHITELISTED(),
                1
            );

        await expect(await permissions.mint(ben.address, await permissions.TOKEN_ROLE_IS_WHITELISTED()))
            .to.emit(permissions, "TransferSingle")
            .withArgs(
                deployer.address,
                ethers.constants.AddressZero,
                ben.address,
                await permissions.TOKEN_ROLE_IS_WHITELISTED(),
                1
            );

        await expect(await permissions.mint(chantal.address, await permissions.TOKEN_ROLE_IS_WHITELISTED()))
            .to.emit(permissions, "TransferSingle")
            .withArgs(
                deployer.address,
                ethers.constants.AddressZero,
                chantal.address,
                await permissions.TOKEN_ROLE_IS_WHITELISTED(),
                1
            );
    });
    
    it('CreateOrMint will work properly', async() => {
        const signers = await setupSignersEx();
        const { permissions } = await deployPermissions();

        // First call: create
        await expect(permissions.createOrMint(signers.axel.address, await permissions.TOKEN_ROLE_MINTER(), "https://axel-initial-minter"))
            .to.emit(permissions, "TransferSingle")
            .withArgs(
                signers.deployer.address, // Operator
                ethers.constants.AddressZero, // 0x000000000
                signers.axel.address, // Axel
                await permissions.TOKEN_ROLE_MINTER(),
                1
            );

        // Second call: mint
        await expect(permissions.createOrMint(signers.ben.address, await permissions.TOKEN_ROLE_MINTER(), ""))
            .to.emit(permissions, "TransferSingle")
            .withArgs(
                signers.deployer.address, // Operator
                ethers.constants.AddressZero, // 0x000000000
                signers.ben.address, // Axel
                await permissions.TOKEN_ROLE_MINTER(),
                1
            );

        expect(await permissions.uri(await permissions.TOKEN_ROLE_MINTER())).to.eq("https://axel-initial-minter")
    })
    
    it('Souldbound: Permission tokens can not be transfered to someone else', async () => {
        const signers = await setupSignersEx();
        const { permissions } = await loadFixture(setupPermissionsLocally);
        
        // Axel contains Token-ID #2
        await expect(await permissions.balanceOf(signers.axel.address, 2)).to.eq(1); 
        
        // Deployer is not allowed to transfer Axels token to Ben
        await expect(permissions.safeTransferFrom(signers.axel.address, signers.ben.address, 2, 1, '0x')).to.be.revertedWith('ERC1155: caller is not token owner nor approved');

        // Axel is also not allowed to transfer its own tokens to Ben
        const axelAsSigner = permissions.connect(signers.axel);
        await expect(axelAsSigner.safeTransferFrom(signers.axel.address, signers.ben.address, 2, 1, '0x')).to.be.revertedWith('Permissions55: Transfer is not allowed');
    })
    
    describe('Should handle Custom Minter role perfectly', async() => {

        async function setupPermissionsLocally() {
            const { axel, ben, chantal } = await setupSigners();
            const { permissions } = await loadFixture(deployPermissions);

            // Axel becomes global Whitelist-Admin
            await permissions.create(axel.address, await permissions.TOKEN_ROLE_WHITELIST_ADMIN(), "https://whitelist-admin");
            
            // Ben becomes Whitelist-Admin ONLY for PermissionSetID 1
            await permissions.create(ben.address, (await permissions.TOKEN_ROLE_WHITELIST_ADMIN()).add(1000), "https://whitelist-admin");

            return { permissions };
        }


        it('Axel is allowed to mint IS_WHITELISTED with CustomerPermissionSetId', async() => {
            const signers = await setupSignersEx();
            const { permissions } = await loadFixture(setupPermissionsLocally);
            
            const isWhiteListedCustomSet = (await permissions.TOKEN_ROLE_IS_WHITELISTED()).add(1000);
            
            const axelAsSigner = permissions.connect(signers.axel);
            
            await expect(axelAsSigner.create(signers.chantal.address, isWhiteListedCustomSet, 'https://is-whitelisted' ))
                .to.emit(permissions, 'TransferSingle')
                .withArgs(signers.axel.address, ethers.constants.AddressZero, signers.chantal.address, isWhiteListedCustomSet, 1)
        })

        it('Ben is allowed to mint IS_WHITELISTED with CustomerPermissionSetId', async() => {
            const signers = await setupSignersEx();
            const { permissions } = await loadFixture(setupPermissionsLocally);

            const isWhiteListedCustomSet = (await permissions.TOKEN_ROLE_IS_WHITELISTED()).add(1000);

            const benAsSigner = permissions.connect(signers.ben);
            await expect(benAsSigner.create(signers.chantal.address, isWhiteListedCustomSet, 'https://is-whitelisted'))
                .to.emit(permissions, 'TransferSingle')
                .withArgs(signers.ben.address, ethers.constants.AddressZero, signers.chantal.address, isWhiteListedCustomSet, 1)
        })

        it('Ben is NOT allowed to mint global IS_WHITELISTED', async() => {
            const signers = await setupSignersEx();
            const { permissions } = await loadFixture(setupPermissionsLocally);

            const isWhiteListedGlobal = (await permissions.TOKEN_ROLE_IS_WHITELISTED());

            const benAsSigner = permissions.connect(signers.ben);
            await expect(benAsSigner.create(signers.chantal.address, isWhiteListedGlobal, 'https://is-whitelisted'))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole');
        })
        
        it('Chantal is NOT allowed to mint IS_WHITELISTED with CustomerPermissionSetId', async() => {
            const signers = await setupSignersEx();
            const { permissions } = await loadFixture(setupPermissionsLocally);

            const isWhiteListedCustomSet = (await permissions.TOKEN_ROLE_IS_WHITELISTED()).add(1000);

            const chantalAsSigner = permissions.connect(signers.chantal);
            await expect(chantalAsSigner.create(signers.chantal.address, isWhiteListedCustomSet, 'https://is-whitelisted'))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole');
        })
        
        
    })
    
    describe("Token Holders can burn their tokens", async () => {
        it("Burn 1: Token Holders will also be automatically updated after tokens has been burned", async () => {
            const { axel, ben, chantal } = await setupSigners();
            const { permissions } = await setupPermissionsLocally();

            // Axel holds now Token 2
            expect(await permissions.balanceOf(axel.address, 2)).to.eq(1);

            // Axel burns his token (Token #2)
            await permissions.connect(axel).burn(axel.address, 2, 1);
            expect(await permissions.balanceOf(axel.address, 2)).to.eq(0);

            // Only Ben and Chantal, but NOT Axel, hold Token #2 now
            const holdersFor2 = [...(await permissions.ownersOf(2))];
            expect(holdersFor2.sort()).to.eql([ben.address, chantal.address].sort());

            // Chantal burns her token (Token #2)
            await permissions.connect(chantal).burn(chantal.address, 2, 1);

            // Only Ben holds Token #2 now
            const holdersFor2b = await permissions.ownersOf(2);
            expect(holdersFor2b).to.eql([ben.address]);

            // Only Ben & Chantal holds Token #3
            const holdersFor3 = await permissions.ownersOf(3);
            expect(holdersFor3).to.eql([ben.address, chantal.address]);
        });

        it("Burn variant 2: Token Holders will also be automatically updated after tokens has been burned", async () => {
            const { axel, ben, chantal } = await setupSigners();
            const { permissions } = await setupPermissionsLocally();

            // Axel burns his token (Token #2)
            await permissions.connect(axel).burn(axel.address, 2, 1);

            // Ben burns his token (Token #2)
            await permissions.connect(ben).burn(ben.address, 2, 1);

            // Only Chantal still holds Token #2 now
            const holdersFor2b = await permissions.ownersOf(2);
            expect(holdersFor2b).to.eql([chantal.address]);

            // Only Ben & Chantal holds Token #3
            const holdersFor3 = await permissions.ownersOf(3);
            expect(holdersFor3).to.eql([ben.address, chantal.address]);

            // Chantal burns her token (Token #2)
            await permissions.connect(chantal).burn(chantal.address, 2, 1);
            const holdersFor2c = await permissions.ownersOf(2);
            expect(holdersFor2c).to.eql([]);
        });

        it('Axel gives Allowance to Chantal to burn his token', async () => {
            const { axel, ben, chantal } = await setupSigners();
            const { permissions } = await setupPermissionsLocally();
            
            // Axel gives Chantal Approval for all his token 
            await (permissions.connect(axel)).setApprovalForAll(chantal.address, true);
            
            // Chantal burns Axels token (Token #2)
            await (permissions.connect(chantal)).burn(axel.address, 2, 1);
            expect(await permissions.balanceOf(axel.address, 2)).to.eq(0);

            // Only Ben & Chantal still holds Token #2 now 
            const holdersFor2 = [...await permissions.ownersOf(2)];
            expect(holdersFor2.sort()).to.eql([ben.address, chantal.address].sort());
        });
    });
});
