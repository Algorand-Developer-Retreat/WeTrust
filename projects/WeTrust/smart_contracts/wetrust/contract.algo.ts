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
import { UintN64 } from "@algorandfoundation/algorand-typescript/arc4";

const COST_PER_BYTE: uint64 = 400;
const COST_PER_BOX: uint64 = 2500;
const MAX_BOX_SIZE: uint64 = 4096;

export class Wetrust extends Contract {
  trustedApp = BoxMap<Account, arc4.DynamicArray<arc4.UintN64>>({ keyPrefix: "trusted_app" });

  trustedASA = BoxMap<Account, arc4.DynamicArray<arc4.UintN64>>({ keyPrefix: "trusted_asa" });

  adjacencyList = BoxMap<Account, arc4.DynamicArray<arc4.Address>>({ keyPrefix: "adjacency_list" }); // this or use a dynamic array as adjacency list.

  init(payMbr: gtxn.PaymentTxn): void {
    assertMatch(payMbr, {
      receiver: Global.currentApplicationAddress,
      amount: { greaterThanEq: 104500 },
    });
  }

  /**
   * method to add trusted Applications, trusted ASAs and trusted peers to your list
   * @param {arc4.UintN64[]} app - list of trusted Applications to add; leave empty if not adding any
   * @param {arc4.UintN64[]} asset - list of trusted ASAs to add; leave empty if not adding any
   * @param {arc4.Address[]} peer - list of trusted peers to add; leave empty if not adding any
   */
  add(app: arc4.UintN64, asset: arc4.UintN64, peer: arc4.Address): void {
    if (!this.trustedApp(Txn.sender).exists) {
      this.trustedApp(Txn.sender).value = new arc4.DynamicArray<arc4.UintN64>();
    }
    if (!this.trustedASA(Txn.sender).exists) {
      this.trustedASA(Txn.sender).value = new arc4.DynamicArray<arc4.UintN64>();
    }
    if (!this.adjacencyList(Txn.sender).exists) {
      this.adjacencyList(Txn.sender).value = new arc4.DynamicArray<arc4.Address>();
    }

    if (app !== new UintN64(0)) {
      let trustedAppList = this.trustedApp(Txn.sender).value.copy();
      for (let j: uint64 = 0; j < trustedAppList.length; j += 1) {
        const app = trustedAppList[j];
        trustedAppList.push(app);
      }
      this.trustedApp(Txn.sender).value = trustedAppList.copy();
    }

    if (asset !== new UintN64(0)) {
      let trustedASAlist = this.trustedASA(Txn.sender).value.copy();
      for (let j: uint64 = 0; j < trustedASAlist.length; j += 1) {
        const asset = trustedASAlist[j];
        trustedASAlist.push(asset);
      }
      this.trustedASA(Txn.sender).value = trustedASAlist.copy();
    }

    if (peer !== new arc4.Address(Global.zeroAddress)) {
      let adjacencyList = this.adjacencyList(Txn.sender).value.copy();
      for (let j: uint64 = 0; j < adjacencyList.length; j += 1) {
        const peer = adjacencyList[j];
        adjacencyList.push(peer);
      }
      this.adjacencyList(Txn.sender).value = adjacencyList.copy();
    }
  }

  remove(app: arc4.UintN64, asset: arc4.UintN64, peer: arc4.Address): void {
    if (app !== new arc4.UintN64(0)) {
      const appList = this.trustedApp(Txn.sender).value.copy();
      let newList = new arc4.DynamicArray<UintN64>();
      for (let i: uint64 = 0; i < appList.length; i += 1) {
        if (appList[i] !== app) {
          newList.push(appList[i]);
        }
      }
      this.trustedApp(Txn.sender).value = newList.copy();
    }
    if (asset !== new arc4.UintN64(0)) {
      const assetList = this.trustedASA(Txn.sender).value.copy();
      let newList = new arc4.DynamicArray<UintN64>();
      for (let i: uint64 = 0; i < assetList.length; i += 1) {
        if (assetList[i] !== asset) {
          newList.push(assetList[i]);
        }
      }
      this.trustedASA(Txn.sender).value = newList.copy();
    }
    if (peer !== new arc4.Address(Global.zeroAddress)) {
      const peerList = this.adjacencyList(Txn.sender).value.copy();
      let newList = new arc4.DynamicArray<arc4.Address>();
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
  getTrustedApp(account: Account): arc4.DynamicArray<arc4.UintN64> {
    return this.trustedApp(account).value;
  }

  @abimethod({ readonly: true })
  getTrustedASA(account: Account): arc4.DynamicArray<arc4.UintN64> {
    return this.trustedASA(account).value;
  }

  @abimethod({ readonly: true })
  getAdjacencyList(account: Account): arc4.DynamicArray<arc4.Address> {
    return this.adjacencyList(account).value;
  }
}
