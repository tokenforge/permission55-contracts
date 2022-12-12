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

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { PermissionSetMock, PermissionSetMock__factory } from "../typechain";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { setupSignersEx } from "./lib/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("PermissionSet", () => {
    async function deployPermissionSetMock(): Promise<{ permissionSet: PermissionSetMock }> {
        const signers = await setupSignersEx();

        const permissionSetFactory = (await ethers.getContractFactory(
            "PermissionSetMock",
            signers.deployer
        )) as PermissionSetMock__factory;
        const permissionSet = await permissionSetFactory.deploy();
        await permissionSet.deployed();

        return { permissionSet };
    }

    it("non existing permissions will be handled accurately", async () => {
        const { permissionSet } = await loadFixture(deployPermissionSetMock);
        await expect(permissionSet.permissionSet(1)).to.be.rejectedWith("LibMap_uint256_string: key not found");
    });

    it("cant remove a permissionSet that does not exist yet", async () => {
        const { permissionSet } = await loadFixture(deployPermissionSetMock);
        await expect(permissionSet.removePermissionSet(123))
            .to.be.revertedWithCustomError(permissionSet, "ErrPermissionSetIsNotExisting")
            .withArgs(123);
    });

    it("when no permissions exists at all...", async () => {
        const { permissionSet } = await loadFixture(deployPermissionSetMock);
        expect(await permissionSet.permissionSetIds()).to.eql([]);
        expect(await permissionSet.permissionSets()).to.eql([[], []]);
    });

    it("permissions can be added successfully", async () => {
        const { permissionSet } = await loadFixture(deployPermissionSetMock);
        await expect(permissionSet.addPermissionSet(1, "Hallo"))
            .to.emit(permissionSet, "PermissionSetAdded")
            .withArgs(1, "Hallo");

        expect(await permissionSet.permissionSet(1)).to.eq("Hallo");

        expect(await permissionSet.permissionSets()).to.eql([[BigNumber.from(1)], ["Hallo"]]);

        expect(await permissionSet.permissionSetIds()).to.eql([BigNumber.from(1)]);
    });

    it("permissions can be removed successfully", async () => {
        const { permissionSet } = await loadFixture(deployPermissionSetMock);

        await expect(permissionSet.addPermissionSet(1, "Hallo"));
        await expect(permissionSet.addPermissionSet(2, "Second"));

        expect(await permissionSet.permissionSet(2)).to.eq("Second");
        expect(await permissionSet.permissionSets()).to.eql([
            [BigNumber.from(1), BigNumber.from(2)],
            ["Hallo", "Second"],
        ]);

        expect(await permissionSet.permissionSetIds()).to.eql([BigNumber.from(1), BigNumber.from(2)]);

        await expect(permissionSet.removePermissionSet(2))
            .to.emit(permissionSet, "PermissionSetRemoved")
            .withArgs(BigNumber.from(2));

        expect(await permissionSet.permissionSetIds()).to.eql([BigNumber.from(1)]);
        expect(await permissionSet.permissionSets()).to.eql([[BigNumber.from(1)], ["Hallo"]]);
    });

    it("permissions can be registered successfully with Auto-ID", async () => {
        const { permissionSet } = await loadFixture(deployPermissionSetMock);

        await expect(await permissionSet.nextPermissionSetId()).to.eq(1);

        await expect(permissionSet.registerPermissionSet("CustomSet1"))
            .to.emit(permissionSet, "PermissionSetAdded")
            .withArgs(1, "CustomSet1");

        await expect(await permissionSet.nextPermissionSetId()).to.eq(2);
        
        expect(await permissionSet.permissionSet(1)).to.eq("CustomSet1");

        expect(await permissionSet.permissionSets()).to.eql([[BigNumber.from(1)], ["CustomSet1"]]);

        expect(await permissionSet.permissionSetIds()).to.eql([BigNumber.from(1)]);
    });
});
