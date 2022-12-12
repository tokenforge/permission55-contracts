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

import addresses from '../addresses.json';
import {HardhatRuntimeEnvironment} from "hardhat/types";

console.log(addresses);

interface RolesToMint {
    [key: string]: Array<string>
}

export function determineRolesToMint(contractName: string, tags: Record<string, boolean>): RolesToMint {
    // @ts-ignore
    const roles = addresses.roles[contractName];

    let rolesToMint: RolesToMint = {};

    for(const tag of Object.keys(tags)) {
        // @ts-ignore
        for(const roleId of Object.keys(roles[tag])) {
            if(typeof rolesToMint[roleId] === "undefined") {
                rolesToMint[roleId] = []; 
            }
            rolesToMint[roleId] = [...new Set([ ...rolesToMint[roleId], ...roles[tag][roleId] ])];
        }

    }
    
    return rolesToMint;
}

export async function mintingRoles(hre: HardhatRuntimeEnvironment, contractName: string) {
    const { deployments, network, getNamedAccounts } = hre;
    const { execute, read, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const rolesToMint = determineRolesToMint(contractName, network.tags);
    
    for(const roleId of Object.keys(rolesToMint)) {

        for(const address of rolesToMint[roleId]) {

            let bal = await read(contractName, "balanceOf", address, roleId)
            if (bal.toNumber() == 0) {
                await execute(
                    contractName,
                    {from: deployer, log: true},
                    "createOrMint",
                    address,
                    roleId, 'ipfs://QmdTkLguthw5aofVxXY52EiKgAQQJDQv8mpBF6hk1Pf2Mg'
                );
            }
        }
    }
}
