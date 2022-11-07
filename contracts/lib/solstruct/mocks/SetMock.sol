// SPDX-License-Identifier: MIT

pragma solidity >0.5.0 <0.9.0;

import "../LibSet.uint256.sol";

contract SetMock {
    using LibSet_uint256 for LibSet_uint256.set;

    LibSet_uint256.set internal _data;

    function length() public view returns (uint256) {
        return _data.length();
    }

    function at(uint256 _index) public view returns (uint256) {
        return _data.at(_index);
    }

    function indexOf(uint256 _value) public view returns (uint256) {
        return _data.indexOf(_value);
    }

    function contains(uint256 _value) public view returns (bool) {
        return _data.contains(_value);
    }

    function content() public view returns (uint256[] memory) {
        return _data.content();
    }

    function add(uint256 _value) public returns (bool) {
        return _data.add(_value);
    }

    function remove(uint256 _value) public returns (bool) {
        return _data.remove(_value);
    }

    function clear() public returns (bool) {
        return _data.clear();
    }
}
