import {ethers} from 'hardhat';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import { Permissions55, Permissions55__factory} from "../typechain";
import {BigNumber} from 'ethers';
import {deployPermissions, setupSigners} from "./lib/fixtures";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";

chai.use(chaiAsPromised);
const {expect} = chai;


describe('Permissions55', () => {

    it('Counter 1', async() => {
        const {deployer, chantal} = await setupSigners();
        const {permissions} = await loadFixture(deployPermissions);

        await permissions.incCounter();
        expect(await permissions.getCounter()).to.eq(1);
    })

    it('Counter 2', async() => {
        const {deployer, chantal} = await setupSigners();
        const {permissions} = await loadFixture(deployPermissions);

        await permissions.incCounter();
        expect(await permissions.getCounter()).to.eq(1);
    })

    it('Deployer will have all rights', async() => {
        const {deployer, chantal} = await setupSigners();
        const {permissions} = await loadFixture(deployPermissions);
        
        expect(await permissions.isAdmin(deployer.address)).to.be.true;
        expect(await permissions.isBlackListAdmin(deployer.address)).to.be.true;
        expect(await permissions.isWhiteListAdmin(deployer.address)).to.be.true;

        // should still be FALSE:
        expect(await permissions.isWhitelisted(deployer.address)).to.be.false;
        expect(await permissions.isBlacklisted(deployer.address)).to.be.false;
    })

    it('will check roles specifically', async () => {
        const {axel, ben, chantal, deployer, minter1, minter2} = await setupSigners();
        const {permissions} = await loadFixture(deployPermissions);

        const TOKEN_ROLE_ADMIN = await permissions.TOKEN_ROLE_ADMIN();
        const TOKEN_ROLE_DEPLOYER = await permissions.TOKEN_ROLE_DEPLOYER();
        const TOKEN_ROLE_WHITELIST_ADMIN = await permissions.TOKEN_ROLE_WHITELIST_ADMIN();
        const TOKEN_ROLE_BLACKLIST_ADMIN = await permissions.TOKEN_ROLE_BLACKLIST_ADMIN();
        const TOKEN_ROLE_MINTER = await permissions.TOKEN_ROLE_MINTER();
        const TOKEN_ROLE_TRANSFERER = await permissions.TOKEN_ROLE_TRANSFERER();
        const TOKEN_ROLE_IS_WHITELISTED = await permissions.TOKEN_ROLE_IS_WHITELISTED();
        const TOKEN_ROLE_IS_BLACKLISTED = await permissions.TOKEN_ROLE_IS_BLACKLISTED();

        interface DataRec {
            mintId: BigNumber,
            account: SignerWithAddress,
            success: boolean,
            requiredId: BigNumber,
        }

        await permissions.create(axel.address, TOKEN_ROLE_WHITELIST_ADMIN, 'https://blacklist.token-forge.io');
        await permissions.create(ben.address, TOKEN_ROLE_BLACKLIST_ADMIN, 'https://blacklist.token-forge.io');
        
        const DONT_CARE = BigNumber.from(0)  // it is an admin already, we don't care
        
        const tokenIds: Array<DataRec> = [
            {mintId: TOKEN_ROLE_ADMIN, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN},
            {mintId: TOKEN_ROLE_ADMIN, account: deployer, success: true, requiredId: DONT_CARE},  // because it is an admin already, we don't care
            {mintId: TOKEN_ROLE_DEPLOYER, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN},
            {mintId: TOKEN_ROLE_DEPLOYER, account: deployer, success: true, requiredId: DONT_CARE}, // because it is an admin already, we don't care 
            {mintId: TOKEN_ROLE_WHITELIST_ADMIN, account: axel, success: false, requiredId: TOKEN_ROLE_ADMIN},
            {mintId: TOKEN_ROLE_IS_WHITELISTED, account: axel, success: true, requiredId: TOKEN_ROLE_WHITELIST_ADMIN},
            {mintId: TOKEN_ROLE_IS_WHITELISTED, account: ben, success: false, requiredId: TOKEN_ROLE_WHITELIST_ADMIN},
            {mintId: TOKEN_ROLE_IS_WHITELISTED, account: deployer, success: true, requiredId: DONT_CARE},

            {mintId: TOKEN_ROLE_IS_BLACKLISTED, account: axel, success: false, requiredId: TOKEN_ROLE_BLACKLIST_ADMIN},
            {mintId: TOKEN_ROLE_IS_BLACKLISTED, account: ben, success: true, requiredId: TOKEN_ROLE_BLACKLIST_ADMIN},
            {mintId: TOKEN_ROLE_IS_BLACKLISTED, account: deployer, success: true, requiredId: DONT_CARE},
        ]
        
        for (const test of tokenIds) {  // let k: "a" | "b" | "c"
            const {mintId, success, account, requiredId: requiredTokenId} = test;
            
            const [_success, _requiredId ] = await permissions.checkMintingPermissions(account.address, mintId.toNumber())

            expect(_success).to.eq(success);
            expect(_requiredId).to.eq(requiredTokenId);
        }
    })

    it('Deployer will be allowed to register permission sets although it is not ROLE_DEPLOYER but ROLE_ADMIN', async() => {
        const {permissions} = await loadFixture(deployPermissions);

        await expect(permissions.registerPermissionSet('test'))
            .to.emit(permissions, 'PermissionSetAdded')
            .withArgs(1, 'test');
    })

    it('It wont be allowed to register permission sets as non-deployer', async() => {
        const {axel, ben, chantal, deployer, minter1, minter2} = await setupSigners();
        const {permissions} = await loadFixture(deployPermissions);

        const permissionsAsAxel = permissions.connect(axel);
        await expect(permissionsAsAxel.registerPermissionSet('test'))
            .to.be.rejectedWith(`AccessControl: account ${axel.address.toLowerCase()} is missing role 0x02`);
    })

    it('It wont be allowed to remove permission sets as non-deployer', async() => {
        const {axel, ben, chantal, deployer, minter1, minter2} = await setupSigners();
        const {permissions} = await loadFixture(deployPermissions);

        await permissions.registerPermissionSet('test')
        
        const permissionsAsAxel = permissions.connect(axel);
        await expect(permissionsAsAxel.removePermissionSet(1))
            .to.be.rejectedWith(`AccessControl: account ${axel.address.toLowerCase()} is missing role 0x02`);
    })
    
    it('Will give me a list of specific Role-token holders', async () => {
        const {axel, ben, chantal, deployer, minter1, minter2} = await setupSigners();
        const {permissions} = await deployPermissions();

        await permissions.create(axel.address, 2, 'https://tokens/2');
        await permissions.mint(ben.address, 2);
        await permissions.mint(chantal.address, 2);

        await permissions.create(chantal.address, 3, 'https://tokens/3');

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
    
    describe('Token Holders can burn their tokens', async() => {
        
        async function setupPermissionsLocally() {
            const {axel, ben, chantal, deployer, minter1, minter2} = await setupSigners();
            const {permissions} = await loadFixture(deployPermissions);
            
            await permissions.create(axel.address, 2, 'https://axel');
            await permissions.mint(ben.address, 2);
            await permissions.mint(chantal.address, 2);
            await permissions.create(ben.address, 3, 'https://ben');
            await permissions.mint(chantal.address, 3);
            
            return { permissions };
        }
    
        it('Token Holders will also be automatically updated after tokens has been burned', async () => {
            const {axel, ben, chantal, deployer, minter1, minter2} = await setupSigners();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            // Axel holds now Token 2
            expect(await permissions.balanceOf(axel.address, 2)).to.eq(1);

            // Axel burns his token (Token #2)
            await (permissions.connect(axel)).burn(axel.address, 2, 1);
            expect(await permissions.balanceOf(axel.address, 2)).to.eq(0);

            // Only Ben and Chantal, but NOT Axel, hold Token #2 now 
            const holdersFor2 = [...await permissions.ownersOf(2)];
            expect(holdersFor2.sort() ).to.eql([ben.address, chantal.address].sort());

            // Chantal burns her token (Token #2)
            await (permissions.connect(chantal)).burn(chantal.address, 2, 1);

            // Only Ben holds Token #2 now 
            const holdersFor2b = await permissions.ownersOf(2);
            expect(holdersFor2b).to.eql([ben.address]);

            // Only Ben & Chantal holds Token #3 
            const holdersFor3 = await permissions.ownersOf(3);
            expect(holdersFor3).to.eql([ben.address, chantal.address]);
        });
    
        it(' variant 2: Token Holders will also be automatically updated after tokens has been burned', async () => {
            const {axel, ben, chantal, deployer, minter1, minter2} = await setupSigners();
            const {permissions} = await loadFixture(setupPermissionsLocally);

            console.log('A1');
            
            // Axel burns his token (Token #2)
            await (permissions.connect(axel)).burn(axel.address, 2, 1);

            console.log('A2');
            // Ben burns his token (Token #2)
            await (permissions.connect(ben)).burn(ben.address, 2, 1);

            console.log('A3');
            // Only Chantal still holds Token #2 now 
            const holdersFor2b = await permissions.ownersOf(2);
            expect(holdersFor2b).to.eql([chantal.address]);

            console.log('A4');
            // Only Ben & Chantal holds Token #3 
            const holdersFor3 = await permissions.ownersOf(3);
            expect(holdersFor3).to.eql([ben.address, chantal.address]);

            console.log('A5');
            // Chantal burns her token (Token #2)
            await (permissions.connect(chantal)).burn(chantal.address, 2, 1);
            const holdersFor2c = await permissions.ownersOf(2);
            expect(holdersFor2c).to.eql([]);

            console.log('A6');
        });

        /*it(' Axel gives Allowance to Chantal to burn his token', async () => {
            // Axel gives Chantal Approval for all his token 
            await (permissions.connect(axel)).setApprovalForAll(chantal.address, true);
            
            // Chantal burns Axels token (Token #2)
            await (permissions.connect(chantal)).burn(axel.address, 2, 1);
            expect(await permissions.balanceOf(axel.address, 2)).to.eq(0);

            // Only Ben & Chantal still holds Token #2 now 
            const holdersFor2 = [...await permissions.ownersOf(2)];
            expect(holdersFor2.sort()).to.eql([ben.address, chantal.address].sort());
        });*/
        
    })
    
});


