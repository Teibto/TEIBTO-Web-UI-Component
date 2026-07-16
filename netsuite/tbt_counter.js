/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 * @since 2026-07-16
 *
 * tbt_counter.js — persistent document-number counter (#49), shared by
 * bill_receipt_lib and expense_lib. One customrecord_tbt_doc_counter row per
 * prefix (name = prefix, e.g. "BR-2569-"); the field stores the last number
 * ISSUED and is never decremented, so deleting a document record can never
 * cause its number to be reused (the old COUNT(*)-based nextTranId did).
 *
 * Concurrency note: read-increment-write is not atomic — two truly
 * simultaneous saves could still race, the same exposure the COUNT approach
 * had. Acceptable at RESTlet volume; swap for a NetSuite numbering plugin if
 * gap-free/contention-proof numbering is ever required.
 */
define(['N/record', 'N/query'], (record, query) => {

  const REC = 'customrecord_tbt_doc_counter';
  const F_LAST = 'custrecord_tbt_ctr_last';

  /**
   * Next number for a prefix. `seed()` runs only when the counter row does
   * not exist yet (first use per prefix) and must return the highest number
   * already issued under that prefix (0 if none) — that migrates accounts
   * with pre-counter records without renumbering anything.
   */
  function next(prefix, seed) {
    const rs = query.runSuiteQL({
      query: `SELECT id, ${F_LAST} AS last FROM ${REC} WHERE name = ?`,
      params: [prefix],
    }).asMappedResults();

    let n;
    if (rs.length) {
      n = Number(rs[0].last || 0) + 1;
      record.submitFields({ type: REC, id: rs[0].id, values: { [F_LAST]: n } });
    } else {
      n = (seed ? Number(seed()) || 0 : 0) + 1;
      const r = record.create({ type: REC });
      r.setValue('name', prefix);
      r.setValue(F_LAST, n);
      r.save();
    }
    return n;
  }

  return { next };
});
