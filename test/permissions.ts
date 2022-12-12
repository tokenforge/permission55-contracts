// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io
/**
 * @dev Learn more about this on https://token-forge.io
 

 _______    _              ______                   
|__   __|  | |            |  ____|                  
   | | ___ | | _____ _ __ | |__ ___  _ __ __ _  ___ 
   | |/ _ \| |/ / _ \ '_ \|  __/ _ \| '__/ _` |/ _ \
   | | (_) |   <  __/ | | | | | (_) | | | (_| |  __/
   |_|\___/|_|\_\___|_| |_|_|  \___/|_|  \__, |\___|
                                          __/ |     
                                         |___/      

 */

import {ethers} from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {BigNumber} from "ethers";
import {deployPermissions, setupSigners, setupSignersEx} from "./lib/fixtures";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";

chai.use(chaiAsPromised);
const {expect} = chai;

describe("Permissions55", () => {

    async function setupPermissionsLocally() {
        const {axel, ben, chantal, minter1, minter2, whitelister} = await setupSigners();
        const {permissions} = await loadFixture(deployPermissions);

        await permissions.create(axel.address, await permissions.TOKEN_ROLE_DEPLOYER(), "https://deployer");
        await permissions.mint(ben.address, await permissions.TOKEN_ROLE_DEPLOYER());
        await permissions.mint(chantal.address, await permissions.TOKEN_ROLE_DEPLOYER());
        await permissions.create(ben.address, await permissions.TOKEN_ROLE_WHITELIST_ADMIN(), "https://whitelist-admin");
        await permissions.mint(chantal.address, await permissions.TOKEN_ROLE_WHITELIST_ADMIN());
        await permissions.create(minter1.address, await permissions.TOKEN_ROLE_MINTER(), "https://minter");
        await permissions.mint(minter2.address, await permissions.TOKEN_ROLE_MINTER());

        await permissions.mint(whitelister.address, await permissions.TOKEN_ROLE_WHITELIST_ADMIN());


        return {permissions};
    }

    describe('general checks', async () => {

        it("Counter 1", async () => {
            const {permissions} = await loadFixture(deployPermissions);

            await permissions.incCounter();
            expect(await permissions.getCounter()).to.eq(1);
        });

        it("Counter 2", async () => {
            const {permissions} = await loadFixture(deployPermissions);

            await permissions.incCounter();
            expect(await permissions.getCounter()).to.eq(1);
        });

        it("Deployer will have all rights", async () => {
            const {deployer} = await setupSigners();
            const {permissions} = await loadFixture(deployPermissions);

            expect(await permissions.isAdmin(deployer.address, 0)).to.be.true;
            expect(await permissions.isAdmin(deployer.address, 1)).to.be.true;
            expect(await permissions.isAdmin(deployer.address, 2)).to.be.true;
        });

        it("will check roles specifically", async () => {
            const {axel, ben, deployer} = await setupSigners();
            const {permissions} = await loadFixture(deployPermissions);

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
                {mintId: TOKEN_ROLE_ADMIN, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN},
                {mintId: TOKEN_ROLE_ADMIN, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN}, // because it is an admin already, we don't care
                {mintId: TOKEN_ROLE_DEPLOYER, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN},
                {mintId: TOKEN_ROLE_DEPLOYER, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN}, // because it is an admin already, we don't care
                {mintId: TOKEN_ROLE_OPERATOR, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN}, // because it is an admin already, we don't care
                {mintId: TOKEN_ROLE_TRANSFERER, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN}, // because it is an admin already, we don't care

                {mintId: TOKEN_ROLE_TRANSFERER, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN},
                {mintId: TOKEN_ROLE_OPERATOR, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN},

                {mintId: TOKEN_ROLE_MINTER, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN}, // because it is an admin already, we don't care
                {mintId: TOKEN_ROLE_MINTER, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN},

                {mintId: TOKEN_ROLE_BLACKLIST_ADMIN, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN},

                {mintId: TOKEN_ROLE_WHITELIST_ADMIN, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN},
                {
                    mintId: TOKEN_ROLE_IS_WHITELISTED,
                    account: axel,
                    success: true,
                    requiredId: TOKEN_ROLE_WHITELIST_ADMIN
                },
                {
                    mintId: TOKEN_ROLE_IS_WHITELISTED,
                    account: ben,
                    success: false,
                    requiredId: TOKEN_ROLE_WHITELIST_ADMIN
                },
                {mintId: TOKEN_ROLE_IS_WHITELISTED, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN},

                {
                    mintId: TOKEN_ROLE_IS_BLACKLISTED,
                    account: axel,
                    success: false,
                    requiredId: TOKEN_ROLE_BLACKLIST_ADMIN,
                },
                {
                    mintId: TOKEN_ROLE_IS_BLACKLISTED,
                    account: ben,
                    success: true,
                    requiredId: TOKEN_ROLE_BLACKLIST_ADMIN
                },
                {mintId: TOKEN_ROLE_IS_BLACKLISTED, account: deployer, success: true, requiredId: TOKEN_ROLE_ADMIN},
                {
                    mintId: TOKEN_ROLE_IS_BLACKLISTED,
                    account: axel,
                    success: false,
                    requiredId: TOKEN_ROLE_BLACKLIST_ADMIN
                },
                {
                    mintId: TOKEN_ROLE_IS_BLACKLISTED,
                    account: ben,
                    success: true,
                    requiredId: TOKEN_ROLE_BLACKLIST_ADMIN
                },

            ];

            for (const test of tokenIds) {
                // let k: "a" | "b" | "c"
                const {mintId, success, account, requiredId: requiredTokenId} = test;

                const [_success, _requiredId] = await permissions.checkMintingPermissions(
                    account.address,
                    mintId.toNumber()
                );

                expect(_success).to.eq(success);
                expect(_requiredId).to.eq(requiredTokenId);
            }
        });

    })

    describe('Basic role based functionality', async () => {

        it("Deployer will be allowed to register permission sets although it is not ROLE_DEPLOYER but ROLE_ADMIN", async () => {
            const {permissions} = await loadFixture(deployPermissions);

            await expect(permissions.registerPermissionSet("test"))
                .to.emit(permissions, "PermissionSetAdded")
                .withArgs(1, "test");
        });

        it("It wont be allowed to register permission sets as non-deployer", async () => {
            const {axel} = await setupSigners();
            const {permissions} = await loadFixture(deployPermissions);

            const permissionsAsAxel = permissions.connect(axel);
            await expect(permissionsAsAxel.registerPermissionSet("test"))
                .to.be.revertedWithCustomError(permissions, 'ErrAdminOrDeployerRolesRequired')
                .withArgs(axel.address)
            ;
        });

        it("It wont be allowed to remove permission sets as non-deployer", async () => {
            const {axel} = await setupSigners();
            const {permissions} = await loadFixture(deployPermissions);

            await permissions.registerPermissionSet("test");

            const permissionsAsAxel = permissions.connect(axel);
            await expect(permissionsAsAxel.removePermissionSet(1))
                .to.be.revertedWithCustomError(permissions, 'ErrAdminOrDeployerRolesRequired')
                .withArgs(axel.address)
            ;
        });

        it("Will give me a list of specific Role-token holders", async () => {
            const {axel, ben, chantal, deployer} = await setupSigners();
            const {permissions} = await deployPermissions();

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

    })

    describe('create and mint', async () => {

        it("Creation of token will emit the right events", async () => {
            const {axel, ben, chantal, deployer} = await setupSigners();
            const {permissions} = await deployPermissions();

            await expect(permissions.create(axel.address, await permissions.TOKEN_ROLE_MINTER(), "https://whitelisted"))
                .to.emit(permissions, "TransferSingle")
                .withArgs(
                    deployer.address,
                    ethers.constants.AddressZero,
                    axel.address,
                    await permissions.TOKEN_ROLE_MINTER(),
                    1
                );

            // Whitelisting shareholders: Axel, Ben, Chantal
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


        it('CreateOrMint will work properly', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await deployPermissions();

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

        it('reverts if attacker will execute createOeMint', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await deployPermissions();

            // First call: create
            const asFraudster = permissions.connect(signers.fraudster)
            await expect(asFraudster.createOrMint(signers.axel.address, await permissions.TOKEN_ROLE_MINTER(), "https://axel-initial-minter"))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole')
                .withArgs(signers.fraudster.address, await permissions.TOKEN_ROLE_MINTER(), await permissions.TOKEN_ROLE_ADMIN())
            ;
        })

        it('reverts if attacker will execute createOeMint with arbitrary token ID', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await deployPermissions();

            // First call: create
            const asFraudster = permissions.connect(signers.fraudster)
            await expect(asFraudster.createOrMint(signers.axel.address, 123, "https://axel-initial-minter"))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole')
                .withArgs(signers.fraudster.address, 123, 1)
            ;
        })

        it('allows admin to execute createOeMint with arbitrary token ID', async () => {
            const {axel} = await setupSignersEx();
            const {permissions, deployer} = await deployPermissions();

            await expect(permissions.createOrMint(axel.address, 123, "https://axel-initial-minter"))
                .to.emit(permissions, 'TransferSingle')
                .withArgs(deployer.address, ethers.constants.AddressZero, axel.address, 123, 1)

            ;
        })

        it('reverts when the same token will be minted twice', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await deployPermissions();

            // First call: create
            await permissions.create(signers.axel.address, await permissions.TOKEN_ROLE_MINTER(), "https://axel-initial-minter")

            // Second call
            await expect(permissions.mint(signers.axel.address, await permissions.TOKEN_ROLE_MINTER()))
                .to.be.revertedWithCustomError(permissions, 'ErrTokenAlreadyExists')
                .withArgs(signers.axel.address, await permissions.TOKEN_ROLE_MINTER())
            ;
        })

        it('reverts when the same token will be created twice', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await deployPermissions();

            // First call: create
            await permissions.create(signers.axel.address, await permissions.TOKEN_ROLE_MINTER(), "https://axel-initial-minter")

            // Second call
            await expect(permissions.create(signers.axel.address, await permissions.TOKEN_ROLE_MINTER(), 'second://'))
                .to.be.revertedWithCustomError(permissions, 'ErrTokenAlreadyCreated')
                .withArgs(await permissions.TOKEN_ROLE_MINTER())
            ;
        })

        it('reverts when non-existing token will be minted', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await deployPermissions();

            await expect(permissions.mint(signers.axel.address, await permissions.TOKEN_ROLE_MINTER()))
                .to.be.revertedWithCustomError(permissions, 'ErrTokenNotCreatedYet')
                .withArgs(await permissions.TOKEN_ROLE_MINTER())
            ;
        })

        it('reverts when non-minter will mint a token', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await deployPermissions();

            // Preparation
            await permissions.create(signers.axel.address, await permissions.TOKEN_ROLE_MINTER(), "https://axel-initial-minter")

            // Minting as fraudster
            const asFraudster = permissions.connect(signers.fraudster);
            await expect(asFraudster.mint(signers.fraudster.address, await permissions.TOKEN_ROLE_MINTER()))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole')
                .withArgs(signers.fraudster.address, await permissions.TOKEN_ROLE_MINTER(), await permissions.TOKEN_ROLE_ADMIN())
            ;
        })

        it('Soul-bound: Permission tokens can not be transferred to someone else', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            // Axel contains Token-ID #2
            await expect(await permissions.balanceOf(signers.axel.address, 2)).to.eq(1);

            // Deployer is not allowed to transfer Axels token to Ben
            await expect(permissions.safeTransferFrom(signers.axel.address, signers.ben.address, 2, 1, '0x'))
                .to.be.revertedWith('ERC1155: caller is not token owner nor approved');

            // Axel is also not allowed to transfer its own tokens to Ben
            const axelAsSigner = permissions.connect(signers.axel);
            await expect(axelAsSigner.safeTransferFrom(signers.axel.address, signers.ben.address, 2, 1, '0x'))
                .to.be.revertedWithCustomError(permissions, 'ErrTransferNotAllowed');
        })

        it('enumerates token members correctly', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            await expect(await permissions.getTokenMemberCount(await permissions.TOKEN_ROLE_ADMIN())).to.eq(1);
            await expect(await permissions.getTokenMemberCount(await permissions.TOKEN_ROLE_DEPLOYER())).to.eq(3);
            await expect(await permissions.getTokenMemberCount(await permissions.TOKEN_ROLE_MINTER())).to.eq(2);

            await expect(permissions.getTokenMember(await permissions.TOKEN_ROLE_ADMIN(), 0)).to.be.revertedWithPanic();
            await expect(await permissions.getTokenMember(await permissions.TOKEN_ROLE_ADMIN(), 1)).to.eq(signers.deployer.address);
            await expect(permissions.getTokenMember(await permissions.TOKEN_ROLE_ADMIN(), 2)).to.be.revertedWithPanic();

            await expect(permissions.getTokenMember(await permissions.TOKEN_ROLE_DEPLOYER(), 0)).to.be.revertedWithPanic();
            await expect(await permissions.getTokenMember(await permissions.TOKEN_ROLE_DEPLOYER(), 1)).to.eq(signers.axel.address);
            await expect(await permissions.getTokenMember(await permissions.TOKEN_ROLE_DEPLOYER(), 2)).to.eq(signers.ben.address);
            await expect(await permissions.getTokenMember(await permissions.TOKEN_ROLE_DEPLOYER(), 3)).to.eq(signers.chantal.address);
            await expect(permissions.getTokenMember(await permissions.TOKEN_ROLE_DEPLOYER(), 4)).to.be.revertedWithPanic();

            await expect(permissions.getTokenMember(await permissions.TOKEN_ROLE_MINTER(), 0)).to.be.revertedWithPanic();
            await expect(await permissions.getTokenMember(await permissions.TOKEN_ROLE_MINTER(), 1)).to.eq(signers.minter1.address);
            await expect(await permissions.getTokenMember(await permissions.TOKEN_ROLE_MINTER(), 2)).to.eq(signers.minter2.address);
            await expect(permissions.getTokenMember(await permissions.TOKEN_ROLE_MINTER(), 3)).to.be.revertedWithPanic();
        })

    })

    describe('Should handle Custom Minter role perfectly', async () => {

        async function setupPermissionsLocally() {
            const {axel, ben, chantal} = await setupSigners();
            const {permissions} = await loadFixture(deployPermissions);

            // Axel becomes global Whitelist-Admin
            await permissions.create(axel.address, await permissions.TOKEN_ROLE_WHITELIST_ADMIN(), "https://whitelist-admin");

            // Ben becomes Whitelist-Admin ONLY for PermissionSetID 1
            await permissions.create(ben.address, (await permissions.TOKEN_ROLE_WHITELIST_ADMIN()).add(1000), "https://whitelist-admin/1");

            // Chantal becomes Blacklist-Admin ONLY for PermissionSetID 2
            await permissions.create(chantal.address, (await permissions.TOKEN_ROLE_BLACKLIST_ADMIN()).add(2000), "https://whitelist-admin/2");

            return {permissions};
        }


        it('Axel is allowed to mint IS_WHITELISTED with CustomerPermissionSetId', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            const isWhiteListedCustomSet = (await permissions.TOKEN_ROLE_IS_WHITELISTED()).add(1000);

            const axelAsSigner = permissions.connect(signers.axel);

            await expect(axelAsSigner.create(signers.chantal.address, isWhiteListedCustomSet, 'https://is-whitelisted'))
                .to.emit(permissions, 'TransferSingle')
                .withArgs(signers.axel.address, ethers.constants.AddressZero, signers.chantal.address, isWhiteListedCustomSet, 1)
        })

        it('Ben is allowed to mint IS_WHITELISTED with CustomerPermissionSetId', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            const isWhiteListedCustomSet = (await permissions.TOKEN_ROLE_IS_WHITELISTED()).add(1000);

            const benAsSigner = permissions.connect(signers.ben);
            await expect(benAsSigner.create(signers.chantal.address, isWhiteListedCustomSet, 'https://is-whitelisted'))
                .to.emit(permissions, 'TransferSingle')
                .withArgs(signers.ben.address, ethers.constants.AddressZero, signers.chantal.address, isWhiteListedCustomSet, 1)
        })

        it('Chantal is allowed to mint IS_BLACKLISTED with CustomerPermissionSetId=2', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            const isBlackListedCustomSet = (await permissions.TOKEN_ROLE_IS_BLACKLISTED()).add(2000);

            const chantalAsSigner = permissions.connect(signers.chantal);
            await expect(chantalAsSigner.create(signers.ben.address, isBlackListedCustomSet, 'https://is-blacklisted'))
                .to.emit(permissions, 'TransferSingle')
                .withArgs(signers.chantal.address, ethers.constants.AddressZero, signers.ben.address, isBlackListedCustomSet, 1)
        })

        it('Chantal is NOT allowed to mint IS_BLACKLISTED with CustomerPermissionSetId=1', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            const isBlackListedCustomSet = (await permissions.TOKEN_ROLE_IS_BLACKLISTED()).add(1000);

            const chantalAsSigner = permissions.connect(signers.chantal);
            await expect(chantalAsSigner.create(signers.ben.address, isBlackListedCustomSet, 'https://is-blacklisted'))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole')
                .withArgs(signers.chantal.address, isBlackListedCustomSet, await permissions.TOKEN_ROLE_BLACKLIST_ADMIN())
        })

        it('Chantal is NOT allowed to mint IS_BLACKLISTED within global permission-set', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            const isBlackListedCustomSet = await permissions.TOKEN_ROLE_IS_BLACKLISTED();

            const chantalAsSigner = permissions.connect(signers.chantal);
            await expect(chantalAsSigner.create(signers.ben.address, isBlackListedCustomSet, 'https://is-blacklisted'))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole')
                .withArgs(signers.chantal.address, isBlackListedCustomSet, await permissions.TOKEN_ROLE_BLACKLIST_ADMIN())
        })


        it('Ben is NOT allowed to mint global IS_WHITELISTED', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            const isWhiteListedGlobal = (await permissions.TOKEN_ROLE_IS_WHITELISTED());

            const benAsSigner = permissions.connect(signers.ben);
            await expect(benAsSigner.create(signers.chantal.address, isWhiteListedGlobal, 'https://is-whitelisted'))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole');
        })

        it('Chantal is NOT allowed to mint IS_WHITELISTED with CustomerPermissionSetId', async () => {
            const signers = await setupSignersEx();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            const isWhiteListedCustomSet = (await permissions.TOKEN_ROLE_IS_WHITELISTED()).add(1000);

            const chantalAsSigner = permissions.connect(signers.chantal);
            await expect(chantalAsSigner.create(signers.chantal.address, isWhiteListedCustomSet, 'https://is-whitelisted'))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole');
        })
    })

    describe("Token Holders can burn their tokens", async () => {
        it("Burn 1: Token Holders will also be automatically updated after tokens has been burned", async () => {
            const {axel, ben, chantal, whitelister} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

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
            expect(holdersFor3).to.eql([ben.address, chantal.address, whitelister.address]);
        });

        it("Burn variant 2: Token Holders will also be automatically updated after tokens has been burned", async () => {
            const {axel, ben, chantal, whitelister} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            // Axel burns his token (Token #2)
            await permissions.connect(axel).burn(axel.address, 2, 1);

            // Ben burns his token (Token #2)
            await permissions.connect(ben).burn(ben.address, 2, 1);

            // Only Chantal still holds Token #2 now
            const holdersFor2b = await permissions.ownersOf(2);
            expect(holdersFor2b).to.eql([chantal.address]);

            // Only Ben & Chantal holds Token #3
            const holdersFor3 = await permissions.ownersOf(3);
            expect(holdersFor3).to.eql([ben.address, chantal.address, whitelister.address]);

            // Chantal burns her token (Token #2)
            await permissions.connect(chantal).burn(chantal.address, 2, 1);
            const holdersFor2c = await permissions.ownersOf(2);
            expect(holdersFor2c).to.eql([]);
        });

        it('Axel gives Allowance to Chantal to burn his token', async () => {
            const {axel, ben, chantal} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

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

    describe('Setup of PermissionSets work properly', async () => {

        it('addPermissionSet and removePermissionSet work smoothly hand in hand', async () => {
            const {permissions} = await setupPermissionsLocally();

            await expect(permissions.addPermissionSet(123, "Custom123"))
                .to.emit(permissions, 'PermissionSetAdded')
                .withArgs(123, 'Custom123')

            await expect(permissions.removePermissionSet(123))
                .to.emit(permissions, 'PermissionSetRemoved')
                .withArgs(123)
        })

        it('registerPermissionSet will handle IDs automatically', async () => {
            const {permissions} = await setupPermissionsLocally();

            await expect(permissions.registerPermissionSet("MyCustomSet"))
                .to.emit(permissions, 'PermissionSetAdded')
                .withArgs(1, 'MyCustomSet')

            await expect(permissions.removePermissionSet(1))
                .to.emit(permissions, 'PermissionSetRemoved')
                .withArgs(1)
        })

        it('can not remove an unregistered set', async () => {
            const {permissions} = await setupPermissionsLocally();

            await expect(permissions.removePermissionSet(1))
                .to.be.revertedWithCustomError(permissions, 'ErrPermissionSetIsNotExisting')
                .withArgs(1)
        })

        it('reverts when the same permission set will added twice', async () => {
            const {permissions} = await setupPermissionsLocally();

            await permissions.addPermissionSet(123, "Custom123")

            await expect(permissions.addPermissionSet(123, "Custom123"))
                .to.be.revertedWithCustomError(permissions, 'ErrPermissionSetAlreadyExists')
                .withArgs(123)
        })

        it('reverts when the same permission set will registered twice', async () => {
            const {permissions} = await setupPermissionsLocally();

            await permissions.registerPermissionSet("Paris")

            await expect(permissions.registerPermissionSet("Paris"))
                .to.be.revertedWithCustomError(permissions, 'ErrPermissionSetWithSameNameAlreadyExists')
                .withArgs('Paris')
        })

        it('allows Deployer-Role to add permissions', async () => {
            const {chantal} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            const permissionsAsChantal = permissions.connect(chantal);
            await expect(permissionsAsChantal.addPermissionSet(123, "Custom123"))
                .to.emit(permissionsAsChantal, 'PermissionSetAdded')
                .withArgs(123, 'Custom123')
        })

        it('reverts when Non-Deployer-Role tries to add permissions', async () => {
            const {fraudster} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            const permissionsAsFraudster = permissions.connect(fraudster);

            await expect(permissionsAsFraudster.addPermissionSet(123, "Custom123"))
                .to.be.revertedWithCustomError(permissions, 'ErrAdminOrDeployerRolesRequired')
                .withArgs(fraudster.address)
        })
    })

    describe('Admin Roles', async () => {

        async function setupPermissionsLocallyWithCustomPermissionSet() {
            const {axel} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            await permissions.addPermissionSet(1, "MySet");

            // Axel becomes admin for permission set #1 
            await permissions.createOrMint(axel.address, 1001, 'custom://');

            return {permissions};
        }

        it('roles for this section has been setup correctly', async () => {
            const {deployer, axel, fraudster} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            // Deployer is Admin
            await expect(await permissions.balanceOf(deployer.address, await permissions.TOKEN_ROLE_ADMIN())).to.eq(1);

            // Axel is NOT admin
            await expect(await permissions.balanceOf(axel.address, await permissions.TOKEN_ROLE_ADMIN())).to.eq(0);
            // Fraudster is NOT admin
            await expect(await permissions.balanceOf(fraudster.address, await permissions.TOKEN_ROLE_ADMIN())).to.eq(0);
        })

        it('will detect isAdmin for default permission-set correctly', async () => {
            const {deployer, axel, fraudster} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            await expect(await permissions.isAdmin(deployer.address, 0)).to.be.true;

            await expect(await permissions.isAdmin(axel.address, 0)).to.be.false;
            await expect(await permissions.isAdmin(fraudster.address, 0)).to.be.false;
        })

        it('will detect for custom permission set correctly', async () => {
            const {deployer, axel, ben, fraudster} = await setupSigners();
            const {permissions} = await setupPermissionsLocallyWithCustomPermissionSet();

            await expect(await permissions.isAdmin(deployer.address, 1)).to.be.true;

            // Axel is Admin for PermissionSet 1
            await expect(await permissions.isAdmin(axel.address, 1)).to.be.true;
            // but not for #0
            await expect(await permissions.isAdmin(axel.address, 0)).to.be.false;

            // Ben is not
            await expect(await permissions.isAdmin(ben.address, 1)).to.be.false;

            // Fraudster is not
            await expect(await permissions.isAdmin(fraudster.address, 1)).to.be.false;
        })

        it('will allow overwrite tokenUris correctly for admins', async () => {
            const {deployer} = await setupSigners();
            const {permissions} = await setupPermissionsLocallyWithCustomPermissionSet();

            const permissionsAsAdmin = permissions.connect(deployer);
            await expect(permissionsAsAdmin.setTokenUri(await permissions.TOKEN_ROLE_ADMIN(), 'new://uri'))
                .to.emit(permissions, 'TokenUriChanged')
                .withArgs(await permissions.TOKEN_ROLE_ADMIN(), 'https://admin-token-uri', 'new://uri')
        })

        it('will not allow overwrite tokenUris for non-admins', async () => {
            const {axel} = await setupSigners();
            const {permissions} = await setupPermissionsLocallyWithCustomPermissionSet();

            const permissionsAsAxel = permissions.connect(axel);
            await expect(permissionsAsAxel.setTokenUri(await permissions.TOKEN_ROLE_ADMIN(), 'new://uri'))
                .to.be.revertedWithCustomError(permissions, 'ErrAdminRoleRequired')
                .withArgs(axel.address, 0)
            ;
        })

        it('will allow Axel to overwrite tokenUris for the custom-permission-set based ADMIN-token', async () => {
            const {axel} = await setupSigners();
            const {permissions} = await setupPermissionsLocallyWithCustomPermissionSet();

            const customPermissionSetAdmin = (await permissions.TOKEN_ROLE_ADMIN()).add(1000);
            const permissionsAsAxel = permissions.connect(axel);

            await expect(permissionsAsAxel.setTokenUri(customPermissionSetAdmin, 'new://uri'))
                .to.emit(permissions, 'TokenUriChanged')
                .withArgs(customPermissionSetAdmin, 'custom://', 'new://uri')
        })

        it('reverts when non-admins tty to execute burnAs', async () => {
            const {axel, fraudster} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            const asFraudster = permissions.connect(fraudster)
            await expect(asFraudster.burnAs(axel.address, await permissions.TOKEN_ROLE_IS_WHITELISTED()))
                .to.be.revertedWithCustomError(permissions, 'ErrAdminRoleRequired')
                .withArgs(fraudster.address, 0)
            ;
        })

        it('allows custom-permission-set-admins to execute burnAs even in custom permission set', async () => {
            const {axel, ben} = await setupSigners();
            const {permissions} = await setupPermissionsLocallyWithCustomPermissionSet();

            const asAxel = permissions.connect(axel)

            const customIsWhiteListed = (await permissions.TOKEN_ROLE_IS_WHITELISTED()).add(1000);
            await asAxel.create(ben.address, customIsWhiteListed, 'custom://is-whitelisted')

            await expect(asAxel.burnAs(ben.address, customIsWhiteListed))
                .to.emit(permissions, 'TransferSingle')
                .withArgs(axel.address, ben.address, ethers.constants.AddressZero, customIsWhiteListed, 1);
        })

        it('reverts when custom-permission-set-admins wants to execute burnAs in another custom permission set', async () => {
            const {axel, ben} = await setupSigners();
            const {permissions} = await setupPermissionsLocallyWithCustomPermissionSet();

            const asAxel = permissions.connect(axel)

            // for a permission set 2
            const customIsWhiteListed = (await permissions.TOKEN_ROLE_IS_WHITELISTED()).add(2000);

            await expect(asAxel.burnAs(ben.address, customIsWhiteListed))
                .to.be.revertedWithCustomError(permissions, 'ErrAdminRoleRequired')
                .withArgs(axel.address, 2)
            ;
        })

    });

    describe('BatchOne minting', async () => {

        it('reverts when batch-minting is happening on non existing token-ids', async () => {
            const {axel} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            await expect(permissions.mintOneBatch([axel.address], await permissions.TOKEN_ROLE_TRANSFERER()))
                .to.be.revertedWithCustomError(permissions, 'ErrTokenNotCreatedYet')
                .withArgs(await permissions.TOKEN_ROLE_TRANSFERER())
        })

        it('reverts when batch-minting is happening from someone missing required permissions', async () => {
            const {axel, fraudster} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            const asFraudster = permissions.connect(fraudster)

            await expect(asFraudster.mintOneBatch([axel.address], await permissions.TOKEN_ROLE_IS_WHITELISTED()))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole')
                .withArgs(fraudster.address, await permissions.TOKEN_ROLE_IS_WHITELISTED(), await permissions.TOKEN_ROLE_WHITELIST_ADMIN())
        })

        it('mints batches of existing tokens properly', async () => {
            const {axel, ben, chantal, whitelister, unknown} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            // Create the token for whitelisting
            await permissions.create(unknown.address, await permissions.TOKEN_ROLE_IS_WHITELISTED(), 'whitelisted://');

            const asWhitelister = permissions.connect(whitelister)

            await expect(asWhitelister.mintOneBatch([axel.address, ben.address, chantal.address], await permissions.TOKEN_ROLE_IS_WHITELISTED()))
                .to.emit(permissions, 'TransferSingle')
                .withArgs(
                    whitelister.address,
                    ethers.constants.AddressZero,
                    axel.address,
                    await permissions.TOKEN_ROLE_IS_WHITELISTED(),
                    1
                )
                .to.emit(permissions, 'TransferSingle')
                .withArgs(
                    whitelister.address,
                    ethers.constants.AddressZero,
                    ben.address,
                    await permissions.TOKEN_ROLE_IS_WHITELISTED(),
                    1
                )
                .to.emit(permissions, 'TransferSingle')
                .withArgs(
                    whitelister.address,
                    ethers.constants.AddressZero,
                    chantal.address,
                    await permissions.TOKEN_ROLE_IS_WHITELISTED(),
                    1
                )
            ;
        })
    })

    describe('General Batch minting', async () => {

        it('reverts when batch-minting is happening on non existing token-ids', async () => {
            const {axel} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            await expect(permissions.mintBatch([axel.address], [await permissions.TOKEN_ROLE_TRANSFERER()]))
                .to.be.revertedWithCustomError(permissions, 'ErrTokenNotCreatedYet')
                .withArgs(await permissions.TOKEN_ROLE_TRANSFERER())
        })

        it('reverts when batch-minting with wrong argument-lengths will be passed', async () => {
            const {axel, ben} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            await expect(permissions.mintBatch([axel.address, ben.address], [await permissions.TOKEN_ROLE_IS_WHITELISTED()]))
                .to.be.revertedWithCustomError(permissions, 'ErrParametersLengthMismatch')
        })

        it('reverts when batch-minting with wrong argument-lengths will be passed II', async () => {
            const {axel} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            await expect(permissions.mintBatch([axel.address], [await permissions.TOKEN_ROLE_IS_WHITELISTED(), await permissions.TOKEN_ROLE_IS_WHITELISTED()]))
                .to.be.revertedWithCustomError(permissions, 'ErrParametersLengthMismatch')
        })

        it('reverts when batch-minting through fraudster is happening on non-existing token-ids', async () => {
            const {axel, fraudster} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            const asFraudster = permissions.connect(fraudster)

            await expect(asFraudster.mintBatch([axel.address], [await permissions.TOKEN_ROLE_IS_WHITELISTED()]))
                .to.be.revertedWithCustomError(permissions, 'ErrTokenNotCreatedYet')
                .withArgs(await permissions.TOKEN_ROLE_IS_WHITELISTED())
        })

        it('reverts when batch-minting is happening from someone missing required permissions', async () => {
            const {axel, fraudster} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            const asFraudster = permissions.connect(fraudster)

            await permissions.create(axel.address, await permissions.TOKEN_ROLE_IS_WHITELISTED(), 'whitelisted://')

            await expect(asFraudster.mintBatch([axel.address], [await permissions.TOKEN_ROLE_IS_WHITELISTED()]))
                .to.be.revertedWithCustomError(permissions, 'ErrMissingRole')
                .withArgs(fraudster.address, await permissions.TOKEN_ROLE_IS_WHITELISTED(), await permissions.TOKEN_ROLE_WHITELIST_ADMIN())
        })

        it('mints batches of existing tokens properly', async () => {
            const {axel, ben, chantal, whitelister, unknown} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            // Create the tokens that are not created yet
            await permissions.create(unknown.address, await permissions.TOKEN_ROLE_IS_WHITELISTED(), 'whitelisted://');
            await permissions.create(unknown.address, await permissions.TOKEN_ROLE_TRANSFERER(), 'transferor://');

            const asWhitelister = permissions.connect(whitelister)

            // Whitelister becomes also isWHitelisted
            await permissions.mint(whitelister.address, await permissions.TOKEN_ROLE_IS_WHITELISTED())

            // But whitelister is not allowed to mint MINTER tokens: thus it will fail
            await expect(asWhitelister.mintBatch([axel.address, ben.address, chantal.address],
                [await permissions.TOKEN_ROLE_IS_WHITELISTED(),
                    await permissions.TOKEN_ROLE_MINTER(),
                    await permissions.TOKEN_ROLE_TRANSFERER()]))
                .to.revertedWithCustomError(permissions, 'ErrMissingRole')
                // for MINTER_ROLE, the ADMIN_ROLE is required. Whitelister misses that:
                .withArgs(whitelister.address, await permissions.TOKEN_ROLE_MINTER(), await permissions.TOKEN_ROLE_ADMIN())
            ;
        })

        it('mints batches of existing tokens properly', async () => {
            const {axel, ben, chantal, whitelister, unknown} = await setupSigners();
            const {permissions} = await setupPermissionsLocally();

            // Create the tokens that are not created yet
            await permissions.create(unknown.address, await permissions.TOKEN_ROLE_IS_WHITELISTED(), 'whitelisted://');
            await permissions.create(unknown.address, await permissions.TOKEN_ROLE_TRANSFERER(), 'transferor://');

            const asWhitelister = permissions.connect(whitelister)
            // Whitelister becomes Admin
            await permissions.mint(whitelister.address, await permissions.TOKEN_ROLE_ADMIN())

            await expect(asWhitelister.mintBatch([axel.address, ben.address, chantal.address],
                [await permissions.TOKEN_ROLE_IS_WHITELISTED(),
                    await permissions.TOKEN_ROLE_MINTER(),
                    await permissions.TOKEN_ROLE_TRANSFERER()]))
                .to.emit(permissions, 'TransferSingle')
                .withArgs(
                    whitelister.address,
                    ethers.constants.AddressZero,
                    axel.address,
                    await permissions.TOKEN_ROLE_IS_WHITELISTED(),
                    1
                )
                .to.emit(permissions, 'TransferSingle')
                .withArgs(
                    whitelister.address,
                    ethers.constants.AddressZero,
                    ben.address,
                    await permissions.TOKEN_ROLE_MINTER(),
                    1
                )
                .to.emit(permissions, 'TransferSingle')
                .withArgs(
                    whitelister.address,
                    ethers.constants.AddressZero,
                    chantal.address,
                    await permissions.TOKEN_ROLE_TRANSFERER(),
                    1
                )
            ;
        })

    })

})
