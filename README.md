# near-lake-nft-indexer

This is a source code for the tutorial "Building an NFT indexer" https://near-indexers.io/tutorials/lake/nft-indexer

This is an indexer built on top of [near-lake-framework-js](https://github.com/near/near-lake-framework-js).

It watches for the `nft_mint` following [Event Format](https://nomicon.io/Standards/EventsFormat) and prints to the relevant data to the terminal:
- Some `receipt` data of the [Receipt](https://near-indexers.io/docs/data-flow-and-structures/structures/receipt) where the mint has happened
- [Execution status](https://near-indexers.io/docs/data-flow-and-structures/structures/execution_outcome#executionstatusview)
- [Events](https://nomicon.io/Standards/EventsFormat) itself

And additionally:
- Links to the NFT marketplace where you can see the minted token

Example output:

```
[
  {
    receipt: {
      id: '4RswuUv9mK7amJjgCPKX71W6eAa81g1z3in7xrF6SfbB',
      receiverId: 'x.paras.near',
      predecessorId: 'chubbless.near'
    },
    status: { SuccessValue: 'IjM5ODA0MzoxIg==' },
    logs: [
      {
        standard: 'nep171',
        version: '1.0.0',
        event: 'nft_mint',
        data: [ { owner_id: 'chubbless.near', token_ids: [ '398043:1' ] } ]
      }
    ],
    links: [ 'https://paras.id/token/x.paras.near::398043/398043:1' ]
  }
]
[
  {
    receipt: {
      id: '7ayNpevmRBCgetns2q1j4L4R7qmB5dDYguYjxc7VijAW',
      receiverId: 'vnartistsdao.mintbase1.near',
      predecessorId: 'fcliver.near'
    },
    status: { SuccessValue: '' },
    logs: [
      {
        standard: 'nep171',
        version: '1.0.0',
        event: 'nft_mint',
        data: [
          {
            owner_id: 'fcliver.near',
            token_ids: [ '202' ],
            memo: '{"royalty":{"split_between":{"vn-artists-dao.near":{"numerator":10000}},"percentage":{"numerator":1500}},"split_owners":null,"meta_id":"70eES-icwSw9iPIkUluMHOV055pKTTgQgTiXtwy3Xus","meta_extra":null,"minter":"fcliver.near"}'
          }
        ]
      }
    ],
    links: [
      'https://mintbase.io/thing/70eES-icwSw9iPIkUluMHOV055pKTTgQgTiXtwy3Xus:vnartistsdao.mintbase1.near'
    ]
  }
]
```
