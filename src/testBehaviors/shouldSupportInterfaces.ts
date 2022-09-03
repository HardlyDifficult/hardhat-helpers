// Originally from https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts-upgradeable/master/test/introspection/SupportsInterface.behavior.js
import { expect } from "chai";
import { ethers } from "hardhat";

const INTERFACES: { [key: string]: string[] } = {
  ERC165: ["supportsInterface(bytes4)"],
  ERC721: [
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
  ERC721Enumerable: ["totalSupply()", "tokenOfOwnerByIndex(address,uint256)", "tokenByIndex(uint256)"],
  ERC721Metadata: ["name()", "symbol()", "tokenURI(uint256)"],
  ERC1155: [
    "balanceOf(address,uint256)",
    "balanceOfBatch(address[],uint256[])",
    "setApprovalForAll(address,bool)",
    "isApprovedForAll(address,address)",
    "safeTransferFrom(address,address,uint256,uint256,bytes)",
    "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
  ],
  ERC1155Receiver: [
    "onERC1155Received(address,address,uint256,uint256,bytes)",
    "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)",
  ],
  ERC2981: ["royaltyInfo(uint256,uint256)"],
};

export const INTERFACE_IDS: {[key: string]: string} = {};
for (const k of Object.getOwnPropertyNames(INTERFACES)) {
  INTERFACE_IDS[k] = makeInterfaceId(INTERFACES[k]);
}

export function shouldSupportInterfaces(
  interfaces: string | string[],
  supportedButNotRegistered = false
): void {
  if(typeof interfaces === "string") {
    // If checking a single interface, wrap it in an array
    interfaces = [interfaces];
  }

  if (!interfaces.includes("ERC165")) {
    // ERC165 is always required
    interfaces.unshift("ERC165");
  }

  describe("Contract interface", function () {
    beforeEach(function () {
      this.contractUnderTest = this.mock || this.token || this.holder || this.nft || this.contract;
    });

    for (const interfaceName of interfaces) {
      const interfaceId = INTERFACE_IDS[interfaceName];
      describe(interfaceName, function () {
        describe("ERC165's supportsInterface(bytes4)", function () {
          it("uses less than 32k gas [skip-on-coverage]", async function () {
            expect(await this.contractUnderTest.estimateGas.supportsInterface(interfaceId)).to.be.lte(32000);
          });

          it(
            (supportedButNotRegistered ? "does not claim support" : "claims support") +
              ` for ${interfaceName} (${interfaceId})`,
            async function () {
              if (supportedButNotRegistered) {
                expect(await this.contractUnderTest.supportsInterface(interfaceId)).to.equal(false);
              } else {
                expect(await this.contractUnderTest.supportsInterface(interfaceId)).to.equal(true);
              }
            }
          );
        });

        for (const fnName of INTERFACES[interfaceName]) {
          describe(fnName, function () {
            it("has to be implemented", function () {
              expect(this.contractUnderTest.functions[fnName]).to.be.not.null;
            });
          });
        }
      });
    }
  });
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
  return "test";
}
