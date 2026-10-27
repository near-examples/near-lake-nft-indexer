import { startStream, types } from 'near-lake-framework';
import { parseNftMintEvents } from './events';

const lakeConfig: types.LakeConfig = {
  s3BucketName: "near-lake-data-mainnet",
  s3RegionName: "eu-central-1",
  startBlockHeight: Number(process.env.START_BLOCK_HEIGHT ?? 66264389),
};

interface ParasEventLogData {
  owner_id: string,
  token_ids: string[],
};

interface MintbaseEventLogData {
  owner_id: string,
  memo: string,
}

async function handleStreamerMessage(
  streamerMessage: types.StreamerMessage
): Promise<void> {
  const createdOn = new Date(streamerMessage.block.header.timestamp / 1000000)
  const relevantOutcomes = streamerMessage
    .shards
    .flatMap(shard => shard.receiptExecutionOutcomes)
    .map(outcome => ({
      receipt: {
        id: outcome.receipt.receiptId,
        receiverId: outcome.receipt.receiverId,
      },
      events: parseNftMintEvents(outcome.executionOutcome.outcome.logs),
    }))
    .filter(relevantOutcome => relevantOutcome.events.length > 0)


  let output = []
  for (let relevantOutcome of relevantOutcomes) {
    let marketplace = "Unknown"
    let nfts = []
    if (relevantOutcome.receipt.receiverId.endsWith(".paras.near")) {
      marketplace = "Paras"
      nfts = relevantOutcome.events.flatMap(event => {
        return (event.data as ParasEventLogData[])
          .map(eventData => ({
            owner: eventData.owner_id,
            links: eventData.token_ids.map(
              tokenId => `https://paras.id/token/${relevantOutcome.receipt.receiverId}::${tokenId.split(":")[0]}/${tokenId}`
            )
           })
        )
      })
    } else if (relevantOutcome.receipt.receiverId.match(/\.mintbase\d+\.near$/)) {
      marketplace = "Mintbase"
      nfts = relevantOutcome.events.flatMap(event => {
        return (event.data as MintbaseEventLogData[])
          .map(eventData => {
          let memo: { meta_id?: string } = {};
          try { memo = JSON.parse(eventData.memo) ?? {}; } catch { /* Memo is optional. */ }
          return {
            owner: eventData.owner_id,
            links: typeof memo.meta_id === "string" ? [`https://mintbase.io/thing/${memo.meta_id}:${relevantOutcome.receipt.receiverId}`] : []
          }
        })
      })
    } else {
      nfts = relevantOutcome.events.flatMap(event => event.data)
    }
    output.push({
      receiptId: relevantOutcome.receipt.id,
      marketplace,
      createdOn,
      nfts,
    })

  }
  if (output.length) {
    console.log(`We caught freshly minted NFTs!`)
    console.dir(output, { depth: 5 })
  }
}

(async () => {
  if (!Number.isSafeInteger(lakeConfig.startBlockHeight) || lakeConfig.startBlockHeight < 0) {
    throw new Error('START_BLOCK_HEIGHT must be a non-negative safe integer');
  }
  console.log('Replaying historical NEAR Lake data; public buckets do not receive new blocks.');
  await startStream(lakeConfig, handleStreamerMessage);
})().catch((error) => { console.error(error); process.exitCode = 1; });
