// SPDX-License-Identifier: MIT

pragma solidity >0.5.0 <0.9.0;

import "../LibMap.uint256.string.sol";

contract MapMock {
    using LibMap_uint256_string for LibMap_uint256_string.map;

    LibMap_uint256_string.map internal _data;

    function length() public view returns (uint256) {
        return _data.length();
    }

    function tryGet(uint256 _key) public view returns (bool, string memory) {
        return _data.tryGet(_key);
    }

    function get(uint256 _key) public view returns (string memory) {
        return _data.get(_key);
    }

    function keyAt(uint256 _index) public view returns (uint256) {
        return _data.keyAt(_index);
    }

    function at(uint256 _index) public view returns (uint256, string memory) {
        return _data.at(_index);
    }

    function indexOf(uint256 _key) public view returns (uint256) {
        return _data.indexOf(_key);
    }

    function contains(uint256 _key) public view returns (bool) {
        return _data.contains(_key);
    }

    function keys() public view returns (uint256[] memory) {
        return _data.keys();
    }

    function set(uint256 _key, string memory _value) public returns (bool) {
        return _data.set(_key, _value);
    }

    function del(uint256 _key) public returns (bool) {
        return _data.del(_key);
    }

    function clear() public returns (bool) {
        return _data.clear();
    }
}
