/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_inventory.js — Warehouse stock list (Tier 4 design-mode build).
 *
 * In production: replace MOCK_ITEMS with N/search on inventoryitem +
 * N/query for stock-level rollups per warehouse.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './inventory.html' }).getContents();

    const warehouses = [
      { value: 'WH_BKK', label: 'Bangkok HQ' },
      { value: 'WH_CRI', label: 'Chiang Rai DC' },
      { value: 'WH_HKT', label: 'Phuket Branch' },
    ];
    const categories = [
      { value: 'IT',       label: 'IT equipment' },
      { value: 'OFFICE',   label: 'Office supplies' },
      { value: 'FURN',     label: 'Furniture' },
      { value: 'SPARE',    label: 'Spare parts' },
      { value: 'PACKING',  label: 'Packing materials' },
    ];

    const data = {
      warehouses,
      categories,
      statuses: [
        { value: 'In stock',     label: 'In stock' },
        { value: 'Low stock',    label: 'Low stock' },
        { value: 'Out of stock', label: 'Out of stock' },
      ],
      items: [
        { id: 'IT-1001', sku: 'LAP-DELL-14', name: 'Dell Latitude 14"',   category: 'IT',      categoryLabel: 'IT equipment',   warehouse: 'WH_BKK', warehouseLabel: 'Bangkok HQ',     qty: 12, reorder: 5,  cost: 35000 },
        { id: 'IT-1002', sku: 'MON-LG-27',   name: 'LG 27" 4K monitor',   category: 'IT',      categoryLabel: 'IT equipment',   warehouse: 'WH_BKK', warehouseLabel: 'Bangkok HQ',     qty: 4,  reorder: 6,  cost: 12000 },
        { id: 'IT-1003', sku: 'KB-LOG-MX',   name: 'Logitech MX Keys',    category: 'IT',      categoryLabel: 'IT equipment',   warehouse: 'WH_BKK', warehouseLabel: 'Bangkok HQ',     qty: 0,  reorder: 5,  cost: 4500 },
        { id: 'IT-1004', sku: 'DOCK-USBC',   name: 'USB-C dock',          category: 'IT',      categoryLabel: 'IT equipment',   warehouse: 'WH_CRI', warehouseLabel: 'Chiang Rai DC',  qty: 25, reorder: 10, cost: 2900 },
        { id: 'OF-2001', sku: 'PAP-A4-80',   name: 'A4 paper 80gsm',      category: 'OFFICE',  categoryLabel: 'Office supplies', warehouse: 'WH_BKK', warehouseLabel: 'Bangkok HQ',     qty: 180, reorder: 50, cost: 120 },
        { id: 'OF-2002', sku: 'PEN-BIC-BL',  name: 'Bic ballpoint blue',  category: 'OFFICE',  categoryLabel: 'Office supplies', warehouse: 'WH_BKK', warehouseLabel: 'Bangkok HQ',     qty: 3,  reorder: 24, cost: 8 },
        { id: 'OF-2003', sku: 'TON-HP-26X',  name: 'HP 26X toner',        category: 'OFFICE',  categoryLabel: 'Office supplies', warehouse: 'WH_HKT', warehouseLabel: 'Phuket Branch',  qty: 6,  reorder: 4,  cost: 3800 },
        { id: 'FN-3001', sku: 'CHR-ERG-01',  name: 'Ergonomic chair',     category: 'FURN',    categoryLabel: 'Furniture',      warehouse: 'WH_CRI', warehouseLabel: 'Chiang Rai DC',  qty: 8,  reorder: 3,  cost: 9500 },
        { id: 'FN-3002', sku: 'DSK-STD-160', name: 'Standing desk 160cm', category: 'FURN',    categoryLabel: 'Furniture',      warehouse: 'WH_BKK', warehouseLabel: 'Bangkok HQ',     qty: 2,  reorder: 2,  cost: 14500 },
        { id: 'SP-4001', sku: 'BAT-CR2032',  name: 'Battery CR2032',      category: 'SPARE',   categoryLabel: 'Spare parts',    warehouse: 'WH_BKK', warehouseLabel: 'Bangkok HQ',     qty: 240, reorder: 100, cost: 12 },
        { id: 'SP-4002', sku: 'CAB-HDMI-2M', name: 'HDMI cable 2m',       category: 'SPARE',   categoryLabel: 'Spare parts',    warehouse: 'WH_HKT', warehouseLabel: 'Phuket Branch',  qty: 0,  reorder: 12, cost: 180 },
        { id: 'PK-5001', sku: 'BOX-COR-S',   name: 'Corrugated box S',    category: 'PACKING', categoryLabel: 'Packing materials', warehouse: 'WH_CRI', warehouseLabel: 'Chiang Rai DC', qty: 1200, reorder: 500, cost: 6 },
        { id: 'PK-5002', sku: 'TAP-PAC-50',  name: 'Packing tape 50mm',   category: 'PACKING', categoryLabel: 'Packing materials', warehouse: 'WH_BKK', warehouseLabel: 'Bangkok HQ',    qty: 18,  reorder: 30,  cost: 35 },
      ],
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_inventory&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  'Inventory',
      active: 'inventory',
      data,
      body,
    }));
  },

}));
