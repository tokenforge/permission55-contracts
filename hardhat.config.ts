import { config as dotEnvConfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-deploy-tenderly";

dotEnvConfig();

import { HardhatUserConfig } from "hardhat/types";

import "solidity-coverage";
import "hardhat-gas-reporter";

import { node_url, accounts, addForkConfiguration } from "./utils/network";

// TODO: reenable solidity-coverage when it works
// import "solidity-coverage";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";


const config: HardhatUserConfig = {
    // defaultNetwork: "tokenForge",
    solidity: {
        compilers: [
            {
                version: "0.8.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
        ],
    },

    namedAccounts: {
        deployer: 7,
        admin: 0,
        backend: 1,
    },

    networks: addForkConfiguration({
        hardhat: {
            initialBaseFeePerGas: 0, // to fix : https://github.com/sc-forks/solidity-coverage/issues/652, see https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
        },
        localhost: {
            url: node_url("localhost"),
            accounts: accounts(),
            tags: ['dev', 'staging'],
        },
        staging: {
            url: node_url("rinkeby"),
            accounts: accounts("rinkeby"),
            tags: ['dev', 'staging'],
        },
        mumbai: {
            url: node_url("polygon-mumbai"),
            accounts: accounts("mumbai"),
            tags: ['dev', 'staging'],
        },
        matic: {
            url: node_url("polygon-matic"),
            accounts: accounts("matic"),
            tags: ['prod'],
        },
        goerli: {
            url: node_url("goerli"),
            accounts: accounts("goerli"),
            tags: ['dev', 'staging'],
        },
        tokenForge: {
            url: 'http://127.0.0.1:9650/ext/bc/FyzyE8KVGptYbbhEQn6AvByjsUZhVD6U3huodN2ELYwKLofgR/rpc',
            accounts: accounts("goerli"),
            chainId: 44556,
            tags: ['dev', 'staging'],
        },
        arbitrum_goerli: {
            url: node_url("ARBITRUM_GOERLI"),
            accounts: accounts("goerli"),
            gas: 2100000,
            gasPrice: 8000000000,
            tags: ['dev', 'staging'],
        },
        optimism_goerli: {
            url: node_url("OPTIMISM_GOERLI"),
            accounts: accounts("goerli"),
            gas: 2100000,
            gasPrice: 8000000000,
            tags: ['dev', 'staging'],
        },
        fuji: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            gasPrice: 225000000000,
            chainId: 43113,
            accounts: accounts("fuji"),
            tags: ['dev', 'staging'],
        },
        avalanche: {
            url: "https://api.avax.network/ext/bc/C/rpc",
            gasPrice: 225000000000,
            chainId: 43114,
            accounts: accounts("fuji"),
            tags: ['prod'],
        },
        // Moonbase Alpha network specification (MoonBeam)
        moonbase: {
            url: "https://rpc.api.moonbase.moonbeam.network",
            chainId: 1287, // 0x507 in hex,
            accounts: accounts("moonbeam"),
            tags: ['dev', 'staging'],
        },
    }),
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: ETHERSCAN_API_KEY,
    },

    paths: {
        sources: "./contracts",
        artifacts: "./artifacts",
        cache: "./cache",
    },

    /*gasReporter: {
        currency: 'EUR',
        gasPrice: 21,
        coinmarketcap: process.env.COINMARKETCAP_APIKEY,
    }*/

    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
    },
    mocha: {
        timeout: 0,
    },
    external: process.env.HARDHAT_FORK
        ? {
              deployments: {
                  // process.env.HARDHAT_FORK will specify the network that the fork is made from.
                  // these lines allow it to fetch the deployments from the network being forked from both for node and deploy task
                  hardhat: ["deployments/" + process.env.HARDHAT_FORK],
                  localhost: ["deployments/" + process.env.HARDHAT_FORK],
              },
          }
        : undefined,

    tenderly: {
        project: "template-ethereum-contracts",
        username: process.env.TENDERLY_USERNAME as string,
    },
};

export default config;
