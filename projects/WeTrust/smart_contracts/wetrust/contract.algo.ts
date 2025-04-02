import { Contract, BoxMap, Account, Txn, Application, Asset, abimethod, Global } from "@algorandfoundation/algorand-typescript";

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

  /**
   * method to add trusted applications, trusted ASAs and trusted peers to your list
   * @param {Application[]} apps - list of trusted applications to add; leave empty if not adding any
   * @param {Asset[]} assets - list of trusted ASAs to add; leave empty if not adding any
   * @param {Account[]} peers - list of trusted peers to add; leave empty if not adding any
   */

  add(apps: Application[], assets: Asset[], peers: Account[]): void {
    if (!this.trustedApp(Txn.sender).exists) {
      this.trustedApp(Txn.sender).value = [];
    }
    if (!this.trustedASA(Txn.sender).exists) {
      this.trustedASA(Txn.sender).value = [];
    }
    if (!this.adjacencyList(Txn.sender).exists) {
      this.adjacencyList(Txn.sender).value = [];
    }

    // can you pass an empty array to the function?
    if (apps.length !== 0) {
      let trustedAppList = this.trustedApp(Txn.sender).value;
      this.trustedApp(Txn.sender).value = trustedAppList;
      trustedAppList = [...trustedAppList, ...apps];
    }

    if (assets.length !== 0) {
      let trustedASAlist = this.trustedASA(Txn.sender).value;
      trustedASAlist = [...trustedASAlist, ...assets];
      this.trustedASA(Txn.sender).value = trustedASAlist;
    }

    if (peers.length !== 0) {
      let adjacencyList = this.adjacencyList(Txn.sender).value;
      adjacencyList = [...adjacencyList, ...peers];
      this.adjacencyList(Txn.sender).value = adjacencyList;
    }
  }

  remove(app: Application, asset: Asset, peer: Account): void {
    if (app !== Application(0)) {
      const appList = this.trustedApp(Txn.sender).value;
      let newAppList: Application[] = [];
      for (let i = 0; i < appList.length; i += 1) {
        if (appList[i] !== app) {
          newAppList.push(appList[i]);
        }
      }
      this.trustedApp(Txn.sender).value = newAppList;
    }
    if (asset !== Asset(0)) {
      const assetList = this.trustedASA(Txn.sender).value;
      let newAssetList: Asset[] = [];
      for (let i = 0; i < assetList.length; i += 1) {
        if (assetList[i] !== asset) {
          newAssetList.push(assetList[i]);
        }
      }
      this.trustedASA(Txn.sender).value = newAssetList;
    }
    if (peer !== Global.zeroAddress) {
      const peerList = this.adjacencyList(Txn.sender).value;
      let newPeerList: Account[] = [];
      for (let i = 0; i < peerList.length; i += 1) {
        if (peerList[i] !== peer) {
          newPeerList.push(peerList[i]);
        }
      }
      this.adjacencyList(Txn.sender).value = newPeerList;
    }
  }

  //////////////

  @abimethod({ readonly: true })
  getTrustedApp(account: Account): Application[] {
    return this.trustedApp(account).value;
  }

  @abimethod({ readonly: true })
  getTrustedASA(account: Account): Asset[] {
    return this.trustedASA(account).value;
  }

  @abimethod({ readonly: true })
  getAdjacencyList(account: Account): Account[] {
    return this.adjacencyList(account).value;
  }
}
