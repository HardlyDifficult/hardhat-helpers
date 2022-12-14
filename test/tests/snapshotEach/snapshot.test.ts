import { expect } from "chai";

import { snapshotEach } from "../../../src";
import { mock } from "../../helpers";

describe("snapshotEach / snapshot", () => {
  it("Deployed & has a default value", async () => {
    expect(await mock.number()).to.equal(0);
  });

  it("Deployed & has a default value", async () => {
    expect(await mock.number()).to.equal(0);
  });

  describe("Nest 1", () => {
    const value = 1;
    let setCounter = 0;

    snapshotEach(async () => {
      await mock.setNumber(value);
      expect(++setCounter).to.eq(1);
    });

    it(`Value is ${value}`, async () => {
      expect(await mock.number()).to.equal(value);
    });

    it(`Value is ${value}`, async () => {
      expect(await mock.number()).to.equal(value);
    });

    describe("Nest 2", () => {
      const value = 2;

      snapshotEach(async () => {
        await mock.setNumber(value);
      });

      it(`Value is ${value}`, async () => {
        expect(await mock.number()).to.equal(value);
      });

      it(`Value is ${value}`, async () => {
        expect(await mock.number()).to.equal(value);
      });

      describe("Nest 3", () => {
        const value = 3;

        snapshotEach(async () => {
          await mock.setNumber(value);
        });

        it(`Value is ${value}`, async () => {
          expect(await mock.number()).to.equal(value);
        });

        it(`Value is ${value}`, async () => {
          expect(await mock.number()).to.equal(value);
        });
      });

      describe("No-op nest", () => {
        snapshotEach(async () => {
          // No-op
        });

        it(`Value is ${value}`, async () => {
          expect(await mock.number()).to.equal(value);
        });

        it(`Value is ${value}`, async () => {
          expect(await mock.number()).to.equal(value);
        });
      });

      describe("BeforeEach snap", () => {
        const value = 99;

        beforeEach(async () => {
          await mock.setNumber(value);
        });

        it(`Value is ${value}`, async () => {
          expect(await mock.number()).to.equal(value);
        });

        it(`Value is ${value}`, async () => {
          expect(await mock.number()).to.equal(value);
        });
      });

      it(`Value is ${value}`, async () => {
        expect(await mock.number()).to.equal(value);
      });

      it(`Value is ${value}`, async () => {
        expect(await mock.number()).to.equal(value);
      });
    });

    describe("Nest 4", () => {
      const value = 4;

      snapshotEach(async () => {
        await mock.setNumber(value);
      });

      it(`Value is ${value}`, async () => {
        expect(await mock.number()).to.equal(value);
      });

      it(`Value is ${value}`, async () => {
        expect(await mock.number()).to.equal(value);
      });
    });
  });

  describe("Nest 5", () => {
    const value = 5;

    snapshotEach(async () => {
      await mock.setNumber(value);
    });

    it(`Value is ${value}`, async () => {
      expect(await mock.number()).to.equal(value);
    });

    it(`Value is ${value}`, async () => {
      expect(await mock.number()).to.equal(value);
    });
  });
});
