import { startStream, types } from 'near-lake-framework';

const lakeConfig: types.LakeConfig = {
  s3BucketName: "near-lake-data-mainnet",
  s3RegionName: "eu-central-1",
  startBlockHeight: 66264389,
};

// Interface to capture data about an event
// Arguments
// * `standard`: name of standard, e.g. nep171
// * `version`: e.g. 1.0.0
// * `event`: type of the event, e.g. nft_mint
// * `data`: associate event data. Strictly typed for each set {standard, version, event} inside corresponding NEP
interface EventLogData {
  standard: string,
  version: string,
  event: string,
  data?: unknown,
};

interface ParasEventLogData {
  token_ids: string[],
};

interface MintbaseEventLogData {
  memo: string,
}

async function handleStreamerMessage(
  streamerMessage: types.StreamerMessage
): Promise<void> {
  const relevantOutcomes = streamerMessage
    .shards
    .flatMap(shard => shard.receiptExecutionOutcomes)
    .filter(outcome =>
      outcome.executionOutcome.outcome.logs
        .filter(log => log.startsWith("EVENT_JSON:")).length
    )
    .map(outcome => ({
      receipt: {
        id: outcome.receipt.receiptId,
        receiverId: outcome.receipt.receiverId,
        predecessorId: outcome.receipt.predecessorId,
      },
      status: outcome.executionOutcome.outcome.status,
      logs: outcome.executionOutcome.outcome.logs.reduce(
        (events: EventLogData[], log: string): EventLogData[] => {
          const probablyEvent = log.split("EVENT_JSON:")[1]
          try {
            const event: EventLogData = JSON.parse(probablyEvent)
            events.push(event)
          } catch (e) {
            // pass
          }
          return events
        }, []
       )
    }))
    .filter(relevantOutcome =>
      relevantOutcome.logs.filter(
        log =>  log.standard === "nep171" && log.event === "nft_mint"
      ).length
    )
    .map(relevantOutcome => {
      return {
        ...relevantOutcome,
        links: relevantOutcome.logs.map(event => {
          if (relevantOutcome.receipt.receiverId.includes(".paras")) {
            return (event.data as ParasEventLogData[]).map(data =>
              data.token_ids.map(
                tokenId => `https://paras.id/token/${relevantOutcome.receipt.receiverId}::${tokenId.split(":")[0]}/${tokenId}`
              ).flat()
            ).flat()
          } else if (relevantOutcome.receipt.receiverId.includes(".mintbase")) {
            return (event.data as MintbaseEventLogData[]).map(data => {
              const memo = JSON.parse(data.memo)
              return `https://mintbase.io/thing/${memo["meta_id"]}:${relevantOutcome.receipt.receiverId}`
            })
          } else {
            return []
          }
        }).flat()
      }
    })
  relevantOutcomes.length && console.dir(relevantOutcomes, { depth: 10 })
}

(async () => {
  await startStream(lakeConfig, handleStreamerMessage);
})();
