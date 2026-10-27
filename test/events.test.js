const assert = require('node:assert/strict');
const { test } = require('node:test');
const { parseNftMintEvents } = require('../dist/events');
const mint = { standard: 'nep171', version: '1.0.0', event: 'nft_mint', data: [{ owner_id: 'alice.near', token_ids: ['1'] }] };
const log = (event) => `EVENT_JSON:${JSON.stringify(event)}`;

test('mixed receipt logs retain only valid NFT mint events', () => {
  assert.deepEqual(parseNftMintEvents([
    'unstructured log', 'EVENT_JSON:invalid', log(null), log(7),
    log({ ...mint, standard: 'nep141' }), log({ ...mint, event: 'nft_transfer' }),
    log({ ...mint, data: null }), log({ ...mint, data: [null] }), log(mint),
  ]), [mint]);
});
