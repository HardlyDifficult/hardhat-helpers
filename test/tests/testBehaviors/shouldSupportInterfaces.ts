import { ethers } from "hardhat";
import { shouldSupportInterfaces, snapshotEach } from "../../../src";
import { BasicERC721, BasicERC721__factory } from "../../typechain";

describe("testBehaviors / shouldSupportInterfaces", () => {
  let erc721: BasicERC721;

  snapshotEach(async function () {
    const [deployer] = await ethers.getSigners();
    erc721 = await new BasicERC721__factory(deployer).deploy();
    this.contract = erc721;
  });

  shouldSupportInterfaces("ERC721");
});
