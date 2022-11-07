import { ContractReceipt, ethers, Event } from "ethers";
import { Result } from "@ethersproject/abi";

export function findEventArgsByNameFromReceipt(
    receipt: ContractReceipt,
    eventName: string,
    argName?: string
): null | Result | Array<any> | any {
    const events: Event[] | undefined = receipt.events?.filter((x: Event) => {
        return x.event == eventName;
    });

    const args: Result | undefined | any[] = events ? events[0]?.args : [];

    if (args !== undefined) {
        return argName ? args[argName] : args;
    } else {
        return null;
    }
}

export function keccak256FromString(s: string): string {
    return ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string"], [s]));
}
