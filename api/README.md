# Background process

Welcome to the background process api directory!

The extensions entry point for the background script is found in `/src/background.js`. This is where the port communications with ui and contentscript are setup and the `main` api is initialized.

the actual main api code lives here in the api directory

## High level

The goal of this code base in both aesthetic and design is meant to be able to house multiple decentralized protocols including non financial ones and make them available to websites

## Mid level

To acomplish High level goals the background process is esetienlty a middle wear client serving it's own rpc api in page this is mostly just passing along requests made by dapps to nodes/service provider unless it is already know by the background process in which it will just use it's own cache system to respond. The reasoning around this is because the background process has a singular view of the network but can have multiple clients(web pages) requesting the same data this could be things like nonce, balnce, and block info etc, and it would be best to avoid hitting the acctual network multiple times in a block for information that has yet to change

The inpage api will also contain hooks for methods around signing and for subscriptions

`eth_sighnTransaction` should trigger a flow for user to approve the transaction if transaction is denied this should return/throw in the dapp otherwise a has is returned

The ui on the other hand will have access to a route style api with the addition of subcribing to paticular methods see api docs [here](./docs/ui-api.md)


## Low level/architecture:


#### coms.

The main form of communcation between scripts is through ports. Connections are recived via runtime.onConnect and iniated in the corespinding scrip. connections are handled in [../src/background.js](../src/background.js)

#### API

The [main class](./index.js) is the core composition of the "served api's" from the respective sub classes
The idea is that it's responsible for creating the sub classes and  the api served to the ui. Sub classes are specialzied tasks: network, transactions, most of these will then also contain protocall specific needs under the respective file or directory for example the network class has `./network/ethereum` this allows better orginization of network specific vs general app functionality.

#### Quick overview of directory organization

##### ./accounts
Anything the ui would consider an account item except for transaction history.

##### ./constants
  Keep constants here so that if necissary the ui can also grab them.

##### ./keys
  Isolated class not imported into the main class but passed through as an opts

##### ./lib
  Shared simple code

##### ./migrations
  Ran only in background.js only when pulling persisted data from storage

##### ./networks
  `provider`s organized by network. Responsible for network request hooks, managing endpoints and caching

##### ./transactions
 responsible for signing and sending transactions and getting transaction history.

#### still need to do:

- [ ] user-settings
- [ ] notifications
- [ ]