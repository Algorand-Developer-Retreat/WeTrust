import {
  Contract,
  BoxMap,
  Account,
  uint64,
  bytes,
  Txn,
  MutableArray,
  Application,
  Asset,
  abimethod,
} from "@algorandfoundation/algorand-typescript";

export class Wetrust extends Contract {
  /**
   * Set up Box Storage for:
   * - 'trusted application';
   * - 'trusted ASA';
   * - 'merkle tree root' || 'list of inner circle trusted peers';
   */

  trustedApp = BoxMap<Account, Application[]>({ keyPrefix: "trusted_app" });

  trustedASA = BoxMap<Account, Asset[]>({ keyPrefix: "trusted_asa" });

  adjacencyList = BoxMap<Account, Account[]>({ keyPrefix: "adjacency_list" }); // this or use a dynamic array as adjacency list.

  addTrustedApp(appToAdd: Application): void {
    if (!this.trustedApp(Txn.sender).exists) {
      this.trustedApp(Txn.sender).value = [];
    }
    let trustedAppList = this.trustedApp(Txn.sender).value;
    trustedAppList = [...trustedAppList, appToAdd];
  }

  addTrustedASA(asaToAdd: Asset): void {
    if (!this.trustedASA(Txn.sender).exists) {
      this.trustedASA(Txn.sender).value = [];
    }
    let trustedASAlist = this.trustedASA(Txn.sender).value;
    trustedASAlist = [...trustedASAlist, asaToAdd];
  }

  removeApp(appToRemove: Application): void {
    const trustedAppList = this.trustedApp(Txn.sender).value;
    let newTrustedAppList: Application[] = [];
    for (let i = 0; i < trustedAppList.length; i++) {
      if (trustedAppList[i] !== appToRemove) {
        newTrustedAppList = [...newTrustedAppList, trustedAppList[i]];
      }
    }
    this.trustedApp(Txn.sender).value = newTrustedAppList;
  }

  removeASA(asaToRemove: Asset): void {
    const trustedASAlist = this.trustedASA(Txn.sender).value;
    let newTrustedASAlist: Asset[] = [];
    for (let i = 0; i < trustedASAlist.length; i++) {
      if (trustedASAlist[i] !== asaToRemove) {
        newTrustedASAlist = [...newTrustedASAlist, trustedASAlist[i]];
      }
    }
    this.trustedASA(Txn.sender).value = newTrustedASAlist;
  }

  @abimethod({ readonly: true })
  getTrustedApp(account: Account): Application[] {
    return this.trustedApp(account).value;
  }

  @abimethod({ readonly: true })
  getTrustedASA(account: Account): Asset[] {
    return this.trustedASA(account).value;
  }
}
