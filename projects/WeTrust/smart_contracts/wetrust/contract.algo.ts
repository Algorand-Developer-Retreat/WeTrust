import {
  Contract,
  BoxMap,
  Account,
  Txn,
  abimethod,
  Global,
  uint64,
  arc4,
  assertMatch,
  gtxn,
} from "@algorandfoundation/algorand-typescript";
import { UintN64, Address, DynamicArray } from "@algorandfoundation/algorand-typescript/arc4";

const COST_PER_BYTE: uint64 = 400;
const COST_PER_BOX: uint64 = 2500;
const MAX_BOX_SIZE: uint64 = 1024;
const UINT64_BYTES_SIZE: uint64 = 8;
const ADDRESS_BYTES_SIZE: uint64 = 32;

export class Wetrust extends Contract {
  trustedApp = BoxMap<Account, DynamicArray<UintN64>>({ keyPrefix: "trusted_app" });

  trustedASA = BoxMap<Account, DynamicArray<UintN64>>({ keyPrefix: "trusted_asa" });

  adjacencyList = BoxMap<Account, DynamicArray<Address>>({ keyPrefix: "adjacency_list" }); // this or use a dynamic array as adjacency list.

  init(payMbr: gtxn.PaymentTxn): void {
    const mbrToCover: uint64 = this.getBoxMbr(UINT64_BYTES_SIZE) + this.getBoxMbr(UINT64_BYTES_SIZE) + this.getBoxMbr(ADDRESS_BYTES_SIZE);
    assertMatch(payMbr, {
      receiver: Global.currentApplicationAddress,
      amount: { greaterThanEq: mbrToCover },
    });
    this.trustedApp(Txn.sender).value = new DynamicArray<UintN64>();
    this.trustedASA(Txn.sender).value = new DynamicArray<UintN64>();
    this.adjacencyList(Txn.sender).value = new DynamicArray<Address>();
  }

  /**
   * method to add trusted Applications, trusted ASAs and trusted peers to your list
   * @param {UintN64} app - list of trusted Applications to add; leave empty if not adding any
   * @param {UintN64} asset - list of trusted ASAs to add; leave empty if not adding any
   * @param {Address} peer - list of trusted peers to add; leave empty if not adding any
   */
  add(app: UintN64, asset: UintN64, peer: Address): void {
    if (app !== new UintN64(0)) {
      assertMatch(this.trustedApp(Txn.sender), { exists: true }, "trustedAppList should exist, call init first");
      let trustedAppList = this.trustedApp(Txn.sender).value.copy();
      assertMatch(
        trustedAppList,
        {
          length: { lessThanEq: this.getMaxLength(UINT64_BYTES_SIZE) },
        },
        "max number of App reached"
      );
      for (let j: uint64 = 0; j < trustedAppList.length; j += 1) {
        const app = trustedAppList[j];
        trustedAppList.push(app);
      }
      this.trustedApp(Txn.sender).value = trustedAppList.copy();
    }

    if (asset !== new UintN64(0)) {
      assertMatch(this.trustedASA(Txn.sender), { exists: true }, "trustedASAlist should exist, call init first");
      let trustedASAlist = this.trustedASA(Txn.sender).value.copy();
      assertMatch(trustedASAlist, {
        length: { lessThanEq: this.getMaxLength(UINT64_BYTES_SIZE) },
      });
      for (let j: uint64 = 0; j < trustedASAlist.length; j += 1) {
        const asset = trustedASAlist[j];
        trustedASAlist.push(asset);
      }
      this.trustedASA(Txn.sender).value = trustedASAlist.copy();
    }

    if (peer !== new Address(Global.zeroAddress)) {
      assertMatch(this.adjacencyList(Txn.sender), { exists: true }, "adjacencyList should exist, call init first");
      let adjacencyList = this.adjacencyList(Txn.sender).value.copy();
      assertMatch(adjacencyList, {
        length: { lessThanEq: this.getMaxLength(ADDRESS_BYTES_SIZE) },
      });
      for (let j: uint64 = 0; j < adjacencyList.length; j += 1) {
        const peer = adjacencyList[j];
        adjacencyList.push(peer);
      }
      this.adjacencyList(Txn.sender).value = adjacencyList.copy();
    }
  }

  remove(app: UintN64, asset: UintN64, peer: Address): void {
    if (app !== new UintN64(0)) {
      const appList = this.trustedApp(Txn.sender).value.copy();
      let newList = new DynamicArray<UintN64>();
      for (let i: uint64 = 0; i < appList.length; i += 1) {
        if (appList[i] !== app) {
          newList.push(appList[i]);
        }
      }
      this.trustedApp(Txn.sender).value = newList.copy();
    }
    if (asset !== new UintN64(0)) {
      const assetList = this.trustedASA(Txn.sender).value.copy();
      let newList = new DynamicArray<UintN64>();
      for (let i: uint64 = 0; i < assetList.length; i += 1) {
        if (assetList[i] !== asset) {
          newList.push(assetList[i]);
        }
      }
      this.trustedASA(Txn.sender).value = newList.copy();
    }
    if (peer !== new Address(Global.zeroAddress)) {
      const peerList = this.adjacencyList(Txn.sender).value.copy();
      let newList = new DynamicArray<Address>();
      for (let i: uint64 = 0; i < peerList.length; i += 1) {
        if (peerList[i] !== peer) {
          newList.push(peerList[i]);
        }
      }
      this.adjacencyList(Txn.sender).value = newList.copy();
    }
  }

  //////////////

  @abimethod({ readonly: true })
  getTrustedApp(account: Account): DynamicArray<UintN64> {
    return this.trustedApp(account).value;
  }

  @abimethod({ readonly: true })
  getTrustedASA(account: Account): DynamicArray<UintN64> {
    return this.trustedASA(account).value;
  }

  @abimethod({ readonly: true })
  getAdjacencyList(account: Account): DynamicArray<Address> {
    return this.adjacencyList(account).value;
  }

  //////////////

  private getBoxMbr(itemSize: uint64): uint64 {
    return COST_PER_BYTE * itemSize + COST_PER_BOX;
  }

  private getMaxLength(itemSize: uint64): uint64 {
    return MAX_BOX_SIZE / itemSize;
  }
}
