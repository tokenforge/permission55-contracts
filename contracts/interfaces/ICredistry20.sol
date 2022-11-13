// SPDX-License-Identifier: UNLICENSED
// (C) by TokenForge GmbH, Berlin
// Author: Hagen Hübel, hagen@token-forge.io

pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IPropertiesAware.sol";

interface ISPVContract is IERC20, IPropertiesAware {
    function mint(address to, uint256 amount) external;

    function version() external pure returns (uint256);
}
