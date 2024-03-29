// Originally from https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts-upgradeable/master/test/introspection/SupportsInterface.behavior.js
import { expect } from "chai";
import { Contract } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import { ethers } from "hardhat";

export const INTERFACES: { [key: string]: string[] } = {};

export const CustomInterfaces: { [interfaceName: string]: string } = {};

// 165: Standard Interface Detection
register165Interface("ERC165", ["supportsInterface(bytes4)"], "0x01ffc9a7");

// 173: Contract Ownership Standard
register165Interface("ERC173", ["owner()", "transferOwnership(address)"], "0x7f5828d0");

// 721: Non-Fungible Token Standard
register165Interface(
  "ERC721",
  [
    "balanceOf(address)",
    "ownerOf(uint256)",
    "approve(address,uint256)",
    "getApproved(uint256)",
    "setApprovalForAll(address,bool)",
    "isApprovedForAll(address,address)",
    "transferFrom(address,address,uint256)",
    "safeTransferFrom(address,address,uint256)",
    "safeTransferFrom(address,address,uint256,bytes)",
  ],
  "0x80ac58cd"
);
register165Interface(
  "ERC721Enumerable",
  ["totalSupply()", "tokenOfOwnerByIndex(address,uint256)", "tokenByIndex(uint256)"],
  "0x780e9d63"
);
register165Interface("ERC721Metadata", ["name()", "symbol()", "tokenURI(uint256)"], "0x5b5e139f");
register165Interface("ERC721TokenReceiver", ["onERC721Received(address,address,uint256,bytes)"], "0x150b7a02");

// 1155: Multi Token Standard
register165Interface(
  "ERC1155",
  [
    "balanceOf(address,uint256)",
    "balanceOfBatch(address[],uint256[])",
    "setApprovalForAll(address,bool)",
    "isApprovedForAll(address,address)",
    "safeTransferFrom(address,address,uint256,uint256,bytes)",
    "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
  ],
  "0xd9b67a26"
);
register165Interface(
  "ERC1155TokenReceiver",
  [
    "onERC1155Received(address,address,uint256,uint256,bytes)",
    "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)",
  ],
  "0x4e2312e0"
);
register165Interface("ERC1155Metadata_URI", ["uri(uint256)"], "0x0e89341c");

// 2981: NFT Royalty Standard
register165Interface("ERC2981", ["royaltyInfo(uint256,uint256)"], "0x2a55205a");

// 4906: EIP-721 Metadata Update Extension
register165InterfaceNotDerivedFromHash(
  "ERC4906",
  // This EIP uses a the EIP number for the interfaceId since it only includes events
  "0x49064906"
);

// 4907: Rental NFT, an Extension of EIP-721
register165Interface(
  "ERC4907",
  ["setUser(uint256,address,uint64)", "userOf(uint256)", "userExpires(uint256)"],
  "0xad092b5c"
);

// 5006: Rental NFT, NFT User Extension
register165Interface(
  "ERC5006",
  [
    "usableBalanceOf(address,uint256)",
    "frozenBalanceOf(address,uint256)",
    "userRecordOf(uint256)",
    "createUserRecord(address,address,uint256,uint64,uint64)",
    "deleteUserRecord(uint256)",
  ],
  "0xc26d96cc"
);

export function register165InterfaceFromContract(
  interfaceName: string,
  contract: { interface: { functions: { [functionSig: string]: FunctionFragment } } },
  expectedInterfaceId?: string
): void {
  register165Interface(interfaceName, Object.keys(contract.interface.functions), expectedInterfaceId);
}

export function register165InterfaceFromFactory(
  interfaceName: string,
  contract: { createInterface(): { functions: { [functionSig: string]: FunctionFragment } } },
  expectedInterfaceId?: string
): void {
  register165Interface(interfaceName, Object.keys(contract.createInterface().functions), expectedInterfaceId);
}

export function register165Interface(interfaceName: string, functions: string[], expectedInterfaceId?: string): void {
  const existingInterface = INTERFACES[interfaceName];
  if (existingInterface) {
    expect(JSON.stringify(functions.sort())).to.eq(
      JSON.stringify(INTERFACES[interfaceName].sort()),
      `Interface ${interfaceName} already registered with different functions`
    );
  }
  if (expectedInterfaceId) {
    const interfaceId = makeInterfaceId(functions);
    expect(interfaceId).to.eq(expectedInterfaceId, `Interface ${interfaceName} has unexpected interface ID`);
  }
  INTERFACES[interfaceName] = functions;
}

export function register165InterfaceNotDerivedFromHash(interfaceName: string, interfaceId: string): void {
  if (CustomInterfaces[interfaceName]) {
    expect(CustomInterfaces[interfaceName]).to.eq(
      interfaceId,
      `Interface ${interfaceName} already registered with interface ID ${CustomInterfaces[interfaceName]}}`
    );
  }
  CustomInterfaces[interfaceName] = interfaceId;
}

export function get165InterfaceId(interfaceName: string): string {
  if (CustomInterfaces[interfaceName]) {
    return CustomInterfaces[interfaceName];
  }
  const functions = INTERFACES[interfaceName];
  if (!functions) {
    throw new Error(`Interface ${interfaceName} not registered`);
  }
  return makeInterfaceId(functions);
}

export async function shouldSupport165Interfaces(
  contract: Contract,
  interfaces: string | string[],
  supportedButNotRegistered = false
): Promise<void> {
  let INTERFACE_IDS: { [interfaceName: string]: string } | undefined;
  ({ INTERFACE_IDS, interfaces } = getInterfaceNames(interfaces));

  if (!interfaces.includes("ERC165") && !supportedButNotRegistered) {
    // ERC165 is always required
    interfaces.unshift("ERC165");
  }

  for (const interfaceName of interfaces) {
    const interfaceId = INTERFACE_IDS[interfaceName];
    if (!interfaceId) {
      throw new Error(`Unknown interface "${interfaceName}"`);
    }
    expect(await contract.estimateGas.supportsInterface(interfaceId)).to.be.lte(
      32000,
      `${interfaceName} (${interfaceId}) uses more than 32k gas`
    );
    expect(await contract.supportsInterface(interfaceId)).to.equal(
      !supportedButNotRegistered,
      (supportedButNotRegistered ? "Unexpectedly claims support" : "Does not claim support") +
        ` for "${interfaceName}" (${interfaceId})`
    );

    if (!Object.values(CustomInterfaces).includes(interfaceId)) {
      for (const fnName of INTERFACES[interfaceName]) {
        expect(contract.functions[fnName]).not.to.eq(
          null,
          `${fnName} has to be implemented for ${interfaceName} (${interfaceId})`
        );
      }
    }
  }
}

/**
 * Confirms that the given contract does not declare support for the interfaces provided.
 */
export async function shouldNotSupport165Interfaces(contract: Contract, interfaces: string | string[]) {
  let INTERFACE_IDS: { [interfaceName: string]: string } | undefined;
  ({ INTERFACE_IDS, interfaces } = getInterfaceNames(interfaces));

  for (const interfaceName of interfaces) {
    const interfaceId = INTERFACE_IDS[interfaceName];
    if (!interfaceId) {
      throw new Error(`Unknown interface "${interfaceName}"`);
    }

    expect(await contract.supportsInterface(interfaceId)).to.be.false;
  }
}

function getInterfaceNames(interfaces: string | string[]) {
  const INTERFACE_IDS: { [interfaceName: string]: string } = {};
  for (const interfaceName of Object.getOwnPropertyNames(CustomInterfaces)) {
    INTERFACE_IDS[interfaceName] = CustomInterfaces[interfaceName];
  }
  for (const interfaceName of Object.getOwnPropertyNames(INTERFACES)) {
    const interfaceId = makeInterfaceId(INTERFACES[interfaceName]);
    if (Object.values(INTERFACE_IDS).includes(interfaceId)) {
      throw new Error(`Interface ${interfaceName} has the same interface ID as another interface`);
    }
    INTERFACE_IDS[interfaceName] = interfaceId;
  }

  if (typeof interfaces === "string") {
    // If checking a single interface, wrap it in an array
    interfaces = [interfaces];
  }
  return { INTERFACE_IDS, interfaces };
}

function makeInterfaceId(functionSignatures: string[]): string {
  const INTERFACE_ID_LENGTH = 4;

  const interfaceIdBuffer = functionSignatures
    .map((signature) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)))
    .map(
      (h) => Buffer.from(h.substring(2), "hex").slice(0, 4) // bytes4()
    )
    .reduce((memo, bytes) => {
      for (let i = 0; i < INTERFACE_ID_LENGTH; i++) {
        memo[i] = memo[i] ^ bytes[i]; // xor
      }
      return memo;
    }, Buffer.alloc(INTERFACE_ID_LENGTH));

  return `0x${interfaceIdBuffer.toString("hex")}`;
}
