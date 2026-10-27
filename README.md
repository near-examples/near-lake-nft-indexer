# near-lake-nft-indexer

This is the source for the [NFT indexer tutorial](https://docs.near.org/data-infrastructure/tutorials/nft-indexer).

> **Historical replay example:** the public NEAR Lake S3 buckets stopped receiving new blocks on March 24, 2026. This example reads existing data; it does not follow new network activity. For live indexing, see the [current indexing options](https://docs.near.org/data-infrastructure/indexers).

Use Node.js 22.22.2+ and configure AWS credentials with permission to read the Lake bucket. Run `npm ci`, `npm run check`, then `npm start` to replay historical blocks from `START_BLOCK_HEIGHT` (default `66264389`).

This is an indexer built on top of [near-lake-framework-js](https://github.com/near/near-lake-framework-js).

It watches for the `nft_mint` following [Event Format](https://nomicon.io/Standards/EventsFormat) and prints to the relevant data to the terminal:
- [Receipt](https://near-indexers.io/docs/data-flow-and-structures/structures/receipt) ID where the mint has happened
- Account name of the owner
- Marketplace
- Links to the minted NFTs on the Marketplace

Example output:

```
We caught freshly minted NFTs!
[
  {
    receiptId: '2y5XzzL1EEAxgq8EW3es2r1dLLkcecC6pDFHR12osCGk',
    marketplace: 'Paras',
    createdOn: 2022-05-24T09:35:57.831Z,
    nfts: [
      {
        owner: 'dccc.near',
        links: [ 'https://paras.id/token/x.paras.near::398089/398089:17' ]
      }
    ]
  }
]
We caught freshly minted NFTs!
[
  {
    receiptId: 'BAVZ92XdbkAPX4DkqW5gjCvrhLX6kGq8nD8HkhQFVt5q',
    marketplace: 'Mintbase',
    createdOn: 2022-05-24T09:36:00.411Z,
    nfts: [
      {
        owner: 'chiming.near',
        links: [
          'https://mintbase.io/thing/HOTcn6LTo3qTq8bUbB7VwA1GfSDYx2fYOqvP0L_N5Es:vnartistsdao.mintbase1.near'
        ]
      }
    ]
  }
]
```
