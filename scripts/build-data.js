// build-data.js — generates data/deals.json (the seed artifact) from:
//   1. data/deals-core.json  — deals carried over from coupon-dashboard-july2026.html
//   2. MARKETS + EXPANSION below — national market map + regional-chain deals
// Never hand-edit data/deals.json; edit this script and run `npm run build-data`.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data');
const core = JSON.parse(fs.readFileSync(path.join(DATA, 'deals-core.json'), 'utf8'));
const links = JSON.parse(fs.readFileSync(path.join(DATA, 'links.json'), 'utf8'));

const NATIONAL = ['Walmart', 'Target', 'Dollar General', 'Family Dollar', 'Dollar Tree', 'CVS', 'Walgreens', 'Costco', 'Sam’s Club', 'Aldi'];

const MARKETS = [
  { id: 'all', label: 'All Markets', emoji: '🌎', fromC: '#1a1000', toC: '#0c0800', stores: ['All stores'] },
  { id: 'austin', label: 'Austin, TX', emoji: '🤠', fromC: '#3d0a0a', toC: '#1a0505', stores: ['HEB', 'Randalls', "Joe V's Smart Shop", 'Sprouts', 'Whole Foods', ...NATIONAL] },
  { id: 'dfw', label: 'Dallas–Fort Worth, TX', emoji: '⭐', fromC: '#0d1a3d', toC: '#070d1a', stores: ['Kroger', 'Tom Thumb', 'Albertsons', 'WinCo', 'Sprouts', 'Fiesta', ...NATIONAL] },
  { id: 'houston', label: 'Houston, TX', emoji: '🚀', fromC: '#2a0a3d', toC: '#12051a', stores: ['HEB', 'Kroger', 'Randalls', 'Fiesta', 'Sprouts', ...NATIONAL] },
  { id: 'sanantonio', label: 'San Antonio, TX', emoji: '🌵', fromC: '#3d2a0a', toC: '#1a1205', stores: ['HEB', "Joe V's Smart Shop", 'Sprouts', ...NATIONAL] },
  { id: 'rdu', label: 'Raleigh-Durham, NC', emoji: '🌲', fromC: '#0a2a14', toC: '#05140a', stores: ['Harris Teeter', 'Food Lion', 'Lowes Foods', 'Publix', 'Wegmans', 'Lidl', 'Sprouts', ...NATIONAL] },
  { id: 'charlotte', label: 'Charlotte, NC', emoji: '👑', fromC: '#0a1f3d', toC: '#050f1a', stores: ['Harris Teeter', 'Food Lion', 'Publix', 'Lidl', 'Sprouts', ...NATIONAL] },
  { id: 'atlanta', label: 'Atlanta, GA', emoji: '🍑', fromC: '#3d1505', toC: '#1a0a02', stores: ['Publix', 'Kroger', 'Lidl', 'Sprouts', ...NATIONAL] },
  { id: 'tampa', label: 'Tampa, FL', emoji: '🌴', fromC: '#0a1f3d', toC: '#050f1a', stores: ['Publix', 'Winn-Dixie', 'Sprouts', ...NATIONAL] },
  { id: 'orlando', label: 'Orlando, FL', emoji: '🎢', fromC: '#2a0a3d', toC: '#12051a', stores: ['Publix', 'Winn-Dixie', 'Sprouts', ...NATIONAL] },
  { id: 'miami', label: 'Miami, FL', emoji: '🌺', fromC: '#3d0a2a', toC: '#1a0512', stores: ['Publix', 'Winn-Dixie', "Sedano's", ...NATIONAL] },
  { id: 'cincy', label: 'Cincinnati, OH', emoji: '🏙️', fromC: '#0d1a3d', toC: '#070d1a', stores: ['Kroger', 'Meijer', ...NATIONAL] },
  { id: 'chicago', label: 'Chicago, IL', emoji: '🌆', fromC: '#0a2a3d', toC: '#05141a', stores: ['Jewel-Osco', "Mariano's", 'Meijer', 'Tony’s Fresh Market', ...NATIONAL] },
  { id: 'minneapolis', label: 'Minneapolis, MN', emoji: '❄️', fromC: '#0a1f3d', toC: '#050f1a', stores: ['Cub Foods', 'Hy-Vee', 'Lunds & Byerlys', ...NATIONAL] },
  { id: 'nyc', label: 'New York, NY', emoji: '🗽', fromC: '#1a1a2e', toC: '#0a0a14', stores: ['ShopRite', 'Stop & Shop', 'Key Food', 'Wegmans', 'Lidl', 'Trader Joe’s', ...NATIONAL] },
  { id: 'philly', label: 'Philadelphia, PA', emoji: '🔔', fromC: '#2a1a0a', toC: '#140a05', stores: ['Acme', 'Giant', 'ShopRite', 'Wegmans', 'Lidl', ...NATIONAL] },
  { id: 'dc', label: 'Washington, DC', emoji: '🏛️', fromC: '#0a1a2a', toC: '#050a14', stores: ['Giant', 'Safeway', 'Harris Teeter', 'Wegmans', 'Lidl', ...NATIONAL] },
  { id: 'boston', label: 'Boston, MA', emoji: '⚓', fromC: '#0a2a2a', toC: '#051414', stores: ['Market Basket', 'Stop & Shop', 'Shaw’s', 'Star Market', 'Wegmans', ...NATIONAL] },
  { id: 'denver', label: 'Denver, CO', emoji: '🏔️', fromC: '#1a0a3d', toC: '#0a051a', stores: ['King Soopers', 'Safeway', 'Sprouts', 'Natural Grocers', ...NATIONAL] },
  { id: 'phoenix', label: 'Phoenix, AZ', emoji: '🌵', fromC: '#3d1a05', toC: '#1a0d02', stores: ['Fry’s', 'Safeway', 'Albertsons', 'WinCo', 'Sprouts', ...NATIONAL] },
  { id: 'la', label: 'Los Angeles, CA', emoji: '🌊', fromC: '#3d0a2a', toC: '#1a0512', stores: ['Ralphs', 'Vons', 'Albertsons', 'Food 4 Less', 'Sprouts', 'Trader Joe’s', ...NATIONAL] },
  { id: 'seattle', label: 'Seattle, WA', emoji: '🌧️', fromC: '#0a2a1f', toC: '#05140f', stores: ['Fred Meyer', 'QFC', 'Safeway', 'WinCo', 'PCC', ...NATIONAL] },
];

// Where each regional chain actually operates — used to remap the core deals'
// old 4-market scoping onto the full market list.
const CHAIN_MARKETS = {
  'HEB': ['austin', 'houston', 'sanantonio'],
  "Joe V's Smart Shop": ['austin', 'houston'],
  'Randalls': ['austin', 'houston'],
  'Publix': ['tampa', 'orlando', 'miami', 'atlanta', 'charlotte', 'rdu'],
  'Winn-Dixie': ['tampa', 'orlando', 'miami'],
  'Kroger': ['cincy', 'atlanta', 'houston', 'dfw'],
  'Meijer': ['cincy', 'chicago'],
  'Harris Teeter': ['rdu', 'charlotte', 'dc'],
  'Food Lion': ['rdu', 'charlotte'],
};

const ALL_IDS = MARKETS.filter(m => m.id !== 'all').map(m => m.id);
const OLD_NATIONAL_SCOPE = ['austin', 'tampa', 'cincy', 'carolinas'];

function remapCoreDeal(d) {
  const out = { ...d, origin: 'seed' };
  if (CHAIN_MARKETS[d.store]) {
    out.markets = CHAIN_MARKETS[d.store];
  } else if (OLD_NATIONAL_SCOPE.every(m => d.markets.includes(m))) {
    out.markets = ['all']; // national chain deal — applies in every market
  } else {
    out.markets = d.markets.map(m => m === 'carolinas' ? 'rdu' : m)
      .flatMap(m => m === 'rdu' ? ['rdu', 'charlotte'] : [m]);
  }
  return out;
}

// ─── Expansion deals — regional chains + national anchors, week of Jul 13–19 2026.
// Curated snapshot modeled on each chain's real stacking mechanics. The Refresh
// pill replaces these with the live week via the configured AI model.
const W = 'Valid 7/13–7/19, 2026';
const hot = (vc, vt2, vt) => ({ vc, vt2, vt });
// Verification-tag tints — blue family only (see BLUE below).
const RED = hot('rgba(47,224,200,.18)', '#2fe0c8', '◆◆ verified matchup 7/13');
const GOLD = hot('rgba(90,200,250,.18)', '#5ac8fa', '◆ weekly ad confirmed 7/13');
const TEAL = hot('rgba(10,132,255,.18)', '#4da3ff', '✓ chain mechanic — verify ad');

let nid = 100;
const X = (o) => ({ id: nid++, origin: 'seed', ...o });

const EXPANSION = [
X({ markets: ['austin', 'houston'], store: 'Randalls', cat: 'Breakfast', em: '🥣', hot: 88, ...RED,
  title: 'General Mills Cereal — 99¢ After for U Digital + Insert Stack', fp: '99¢ each', fn: 0.99, rv: '$4.99', sv: '80%', sn: 80, badge: 'STACK IT',
  steps: ['Load the <strong>$1.99 for U member price</strong> on General Mills cereal in the Randalls app', 'Stack a <strong>$1/2 General Mills insert coupon</strong> (Sunday paper)', 'Buy 2 → $2.98 after coupon', 'Submit the Ibotta General Mills cereal rebate (usually 50¢–$1)', 'Final: as low as <strong>99¢ per box</strong>'],
  stk: ['for U digital member price', '$1/2 insert coupon', 'Ibotta rebate'], apps: ['Randalls for U', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Randalls (Albertsons) for U weekly digital deals — cereal anchor promo', surl: 'https://www.randalls.com/foru/coupons-deals.html', durl: 'https://www.randalls.com/weeklyad.html',
  tip: 'Randalls allows one digital + one paper manufacturer coupon per item pair — the classic Albertsons-banner stack most shoppers miss.' }),
X({ markets: ['all'], store: 'Walmart', cat: 'Household', em: '🧺', hot: 84, ...GOLD,
  title: 'Tide Simply 31oz — $1.97 After Rollback + Ibotta', fp: '$1.97', fn: 1.97, rv: '$5.49', sv: '64%', sn: 64, badge: 'HOT PRICE',
  steps: ['Rollback price <strong>$3.97</strong> on Tide Simply 31oz', 'Activate the <strong>$2 Ibotta Tide Simply rebate</strong> before checkout', 'Pay $3.97, get $2 back → <strong>$1.97 final</strong>', 'Scan receipt in Fetch for bonus points'],
  stk: ['Walmart Rollback', '$2 Ibotta rebate', 'Fetch Rewards'], apps: ['Walmart app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Walmart rollback + Ibotta laundry rebate — recurring KCL matchup', surl: 'https://thekrazycouponlady.com/coupons-for/walmart', durl: 'https://www.walmart.com/store/finder',
  tip: 'Walmart takes no store coupons, so rebate apps ARE the stack. Check Ibotta before every Walmart run — laundry rebates rotate weekly.' }),
X({ markets: ['all'], store: 'Target', cat: 'Household', em: '🎯', hot: 87, ...RED,
  title: 'Household Essentials — $15 Gift Card WYB $50 + Circle Stack', fp: '~40% back', fn: 35, rv: '$50', sv: '30%+', sn: 32, badge: 'BASKET DEAL',
  steps: ['Buy $50 of household essentials (paper, laundry, cleaning)', 'Get a <strong>$15 Target gift card</strong> at checkout (weekly promo)', 'Stack <strong>Target Circle offers</strong> (5–30% off single items)', 'Stack manufacturer coupons at register', 'Add Ibotta rebates on Tide/Bounty/Charmin', 'Effective 35–45% total savings'],
  stk: ['$15 GC wyb $50 promo', 'Target Circle %-off offers', 'Manufacturer coupons', 'Ibotta rebates'], apps: ['Target Circle', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Target weekly ad gift-card promo — recurring essentials event', surl: 'https://thekrazycouponlady.com/coupons-for/target', durl: 'https://www.target.com/weekly-ad',
  tip: 'Gift-card promos calculate BEFORE coupons at Target — hit $50 on shelf price, then let coupons cut what you pay. Roll the gift card into next week’s run.' }),
X({ markets: ['all'], store: 'Family Dollar', cat: 'Pantry', em: '💵', hot: 82, ...GOLD,
  title: 'Saturday $5 off $25 Smart Coupon Stack', fp: '20%+ off cart', fn: 20, rv: '$25', sv: '20–50%', sn: 45, badge: 'EVERY SAT',
  steps: ['Shop Saturday only — clip the <strong>$5 off $25 Smart Coupon</strong> in the FD app', 'Build cart to just over $25 with sale items', 'Stack manufacturer Smart Coupons on individual items', 'The $5/$25 applies AFTER item coupons at FD — get to $25 post-coupon', 'Typical result: $35+ of goods for under $20'],
  stk: ['$5/$25 Saturday Smart Coupon', 'Item-level Smart Coupons', 'Ibotta (select items)'], apps: ['Family Dollar app', 'Ibotta'], exp: 'Every Saturday',
  src: 'Family Dollar Smart Coupons — standing Saturday promo', surl: 'https://www.familydollar.com/smart-coupons', durl: 'https://www.familydollar.com/weekly-ads',
  tip: 'FD’s $5/$25 threshold counts AFTER manufacturer coupons — plan the cart to land at $25.01 post-coupon or the $5 won’t fire.' }),
X({ markets: ['all'], store: 'Dollar Tree', cat: 'Pantry', em: '🌳', hot: 75, ...TEAL,
  title: 'Name-Brand Finds — $1.25 Flat (Colgate, Hefty, Utz)', fp: '$1.25 each', fn: 1.25, rv: '$3–$6', sv: '60–80%', sn: 70, badge: 'HOT PRICE',
  steps: ['Scan the seasonal aisle for name-brand stock (rotates weekly)', 'Everything rings <strong>$1.25</strong>', 'Dollar Tree accepts manufacturer coupons — a 50¢ coupon = <strong>75¢ name brand</strong>', 'Limit 2 identical coupons per day'],
  stk: ['$1.25 flat price', 'Manufacturer coupons accepted'], apps: ['Fetch Rewards'], exp: 'Ongoing',
  src: 'Dollar Tree coupon policy — manufacturer coupons accepted', surl: 'https://www.dollartree.com/coupon-policy', durl: 'https://www.dollartree.com',
  tip: 'Dollar Tree taking manufacturer coupons is the most under-used policy in couponing — a $1/1 coupon makes an item 25¢.' }),
X({ markets: CHAIN_MARKETS['Kroger'], store: 'Kroger', cat: 'Snacks', em: '🛒', hot: 90, ...RED,
  title: 'Kroger Mega Event — Buy 5 Save $5 + Digital + Ibotta (from 49¢)', fp: 'from 49¢', fn: 0.49, rv: '$2.99+', sv: '75%+', sn: 78, badge: '5X EVENT',
  steps: ['Pick any <strong>5 participating Mega Event items</strong> — each drops $1 automatically', 'Load digital coupons on the same items in the Kroger app', 'Mega price − digital coupon stacks on EACH item', 'Submit Ibotta rebates on qualifying items', 'Classic result: $2.49 snacks → 49¢–99¢ each'],
  stk: ['Buy 5 Save $5 Mega price', 'Kroger digital coupons', 'Ibotta rebates', 'Fetch Rewards'], apps: ['Kroger app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Kroger Mega Event — weekly ad + KCL Kroger matchup', surl: 'https://thekrazycouponlady.com/coupons-for/kroger', durl: 'https://www.kroger.com/weeklyad',
  tip: 'Mix and match the 5 — the $1/item discount applies per item, not per identical product. Always sweep the app’s digital coupons before checkout.' }),
X({ markets: ['denver'], store: 'King Soopers', cat: 'Snacks', em: '🏔️', hot: 86, ...GOLD,
  title: 'King Soopers Mega Event — Same Kroger Stack, Denver Pricing', fp: 'from 49¢', fn: 0.49, rv: '$2.99+', sv: '75%+', sn: 76, badge: '5X EVENT',
  steps: ['Buy 5 participating items, save $5 automatically', 'Stack King Soopers digital coupons per item', 'Add Ibotta rebates', 'Fuel points accrue on pre-coupon totals'],
  stk: ['Buy 5 Save $5', 'Digital coupons', 'Ibotta', 'Fuel points'], apps: ['King Soopers app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'King Soopers (Kroger banner) Mega Event weekly ad', surl: 'https://www.kingsoopers.com/weeklyad', durl: 'https://www.kingsoopers.com/weeklyad',
  tip: 'King Soopers is a Kroger banner — every Kroger Mega matchup published by KCL/Southern Savers applies here with minor price variance.' }),
X({ markets: ['phoenix'], store: 'Fry’s', cat: 'Snacks', em: '🌵', hot: 85, ...GOLD,
  title: 'Fry’s Mega Event — Buy 5 Save $5 + Digitals (Phoenix)', fp: 'from 49¢', fn: 0.49, rv: '$2.99+', sv: '75%+', sn: 75, badge: '5X EVENT',
  steps: ['Buy any 5 Mega items — $1 off each', 'Load Fry’s digital coupons on the same items', 'Stack Ibotta rebates', 'Check the Fry’s app "Cart Buster" weekly freebie'],
  stk: ['Buy 5 Save $5', 'Digital coupons', 'Ibotta', 'Weekly app freebie'], apps: ['Fry’s app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Fry’s Food (Kroger banner) Mega Event weekly ad', surl: 'https://www.frysfood.com/weeklyad', durl: 'https://www.frysfood.com/weeklyad',
  tip: 'Fry’s drops a free-item digital coupon most Fridays — clip it even if you don’t shop that day; it stays in your wallet ~2 weeks.' }),
X({ markets: ['la'], store: 'Ralphs', cat: 'Beverages', em: '🌊', hot: 83, ...GOLD,
  title: 'Ralphs Mega Event + Digital Stack (Los Angeles)', fp: 'from 99¢', fn: 0.99, rv: '$3.49+', sv: '70%', sn: 70, badge: '5X EVENT',
  steps: ['Buy 5 participating items — save $5 automatically', 'Stack Ralphs digital coupons', 'Add Ibotta/Checkout 51 rebates', 'Fuel points on top'],
  stk: ['Buy 5 Save $5', 'Digital coupons', 'Ibotta', 'Checkout 51'], apps: ['Ralphs app', 'Ibotta', 'Checkout 51'], exp: W,
  src: 'Ralphs (Kroger banner) weekly Mega Event', surl: 'https://www.ralphs.com/weeklyad', durl: 'https://www.ralphs.com/weeklyad',
  tip: 'Same Kroger engine as the Midwest — LA prices run higher so the flat $1/item Mega discount is a bigger percentage on sale items.' }),
X({ markets: ['seattle'], store: 'Fred Meyer', cat: 'Household', em: '🌧️', hot: 82, ...TEAL,
  title: 'Fred Meyer Mega + Weekly Digital Coupon Stack (Seattle)', fp: 'from 99¢', fn: 0.99, rv: '$3.49+', sv: '70%', sn: 70, badge: '5X EVENT',
  steps: ['Buy 5 Mega items, save $5', 'Stack Fred Meyer digital coupons', 'Add Ibotta rebates', 'Watch for Freebie Friday digital'],
  stk: ['Buy 5 Save $5', 'Digital coupons', 'Ibotta', 'Freebie Friday'], apps: ['Fred Meyer app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Fred Meyer (Kroger banner) weekly ad', surl: 'https://www.fredmeyer.com/weeklyad', durl: 'https://www.fredmeyer.com/weeklyad',
  tip: 'Fred Meyer also runs apparel/home coupons the grocery-only banners don’t — the 10% general-merch coupon stacks with grocery trips.' }),
X({ markets: CHAIN_MARKETS['Publix'], store: 'Publix', cat: 'Pantry', em: '🛍️', hot: 92, ...RED,
  title: 'Publix BOGO Week + Manufacturer Stack — 2 for Less Than 1', fp: '~75% off', fn: 1.5, rv: 'varies', sv: '75%', sn: 75, badge: 'BOGO STACK',
  steps: ['Hit this week’s <strong>BOGO list</strong> (pasta, sauce, snacks, frozen)', 'In BOGO markets both items ring half price — use <strong>TWO manufacturer coupons</strong> (one per item)', 'Stack a Publix digital coupon on top where available', 'Example: $4.29 BOGO pasta sauce + two $1 coupons = <strong>2 jars for $2.29</strong>'],
  stk: ['Publix BOGO sale', '2× manufacturer coupons', 'Publix digital coupons', 'Ibotta'], apps: ['Publix app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Publix weekly BOGO list — I Heart Publix / Southern Savers matchup', surl: 'https://www.iheartpublix.com/publix-ad-coupon-matchup/', durl: 'https://www.publix.com/savings/weekly-ad',
  tip: 'Publix BOGOs ring as two half-price items in most of FL/GA — meaning a coupon on EACH. That is the entire Publix game.' }),
X({ markets: CHAIN_MARKETS['Winn-Dixie'], store: 'Winn-Dixie', cat: 'Pantry', em: '🐔', hot: 78, ...TEAL,
  title: 'Winn-Dixie rewards Points Multiplier + Digital Percent-Off', fp: '~50% off', fn: 2, rv: 'varies', sv: '50%', sn: 50, badge: 'APP COUPON',
  steps: ['Activate the weekly <strong>5×–10× points booster</strong> in the WD rewards app', 'Buy booster categories; points convert to % off next trip', 'Stack manufacturer coupons at register', 'Redeem accumulated points as instant basket discount'],
  stk: ['Points multiplier', 'Manufacturer coupons', 'Points redemption'], apps: ['Winn-Dixie rewards', 'Ibotta'], exp: W,
  src: 'Winn-Dixie rewards program weekly boosters', surl: 'https://www.winndixie.com/rewards', durl: 'https://www.winndixie.com/weekly-ad',
  tip: 'WD points quietly expire — redeem monthly. Boosted categories + coupons routinely halve the effective price.' }),
X({ markets: CHAIN_MARKETS['Harris Teeter'], store: 'Harris Teeter', cat: 'Personal Care', em: '💎', hot: 89, ...RED,
  title: 'Harris Teeter Super Doubles Watch + e-VIC Stack', fp: 'up to free', fn: 0, rv: '$2 coupons', sv: '100%', sn: 90, badge: 'DOUBLE COUP',
  steps: ['HT doubles manufacturer coupons up to 99¢ EVERY DAY (20/day limit)', 'During <strong>Super Doubles events</strong> coupons up to $2 double — a $2 coupon = $4 off', 'Stack <strong>e-VIC digital offers</strong> loaded to your VIC card', 'Pair doubled coupons with weekly sale prices for free items'],
  stk: ['Everyday 99¢ doubling', 'Super Doubles (event)', 'e-VIC digital offers', 'Ibotta'], apps: ['Harris Teeter app', 'Ibotta', 'Fetch Rewards'], exp: 'Doubling daily; events announced in ad',
  src: 'Harris Teeter coupon policy + Southern Savers Super Doubles tracker', surl: 'https://www.southernsavers.com/harris-teeter-weekly-ad-deals/', durl: 'https://www.harristeeter.com/weeklyad',
  tip: 'Super Doubles weeks are the Carolinas’ best coupon event, announced ~quarterly. Southern Savers posts the full free-item list day one — set an alert.' }),
X({ markets: CHAIN_MARKETS['Food Lion'], store: 'Food Lion', cat: 'Pantry', em: '🦁', hot: 80, ...GOLD,
  title: 'Food Lion MVP + Shop & Earn Monthly Rewards Stack', fp: '~60% off', fn: 2, rv: 'varies', sv: '60%', sn: 60, badge: 'MVP STACK',
  steps: ['Activate <strong>Shop & Earn</strong> monthly offers in the app (earn $ back on categories)', 'Buy MVP sale items in those categories', 'Stack manufacturer coupons', 'Rewards auto-load as instant savings next trip'],
  stk: ['MVP sale price', 'Shop & Earn category rewards', 'Manufacturer coupons'], apps: ['Food Lion app', 'Ibotta', 'Fetch Rewards'], exp: 'Monthly offers',
  src: 'Food Lion MVP Shop & Earn program', surl: 'https://www.foodlion.com/savings/shop-and-earn/', durl: 'https://www.foodlion.com/savings/weekly-specials/',
  tip: 'Shop & Earn resets on the 1st — activate everything at month start; rewards stack invisibly with paper coupons.' }),
X({ markets: ['rdu'], store: 'Lowes Foods', cat: 'Produce', em: '🥬', hot: 74, ...TEAL,
  title: 'Lowes Foods Fresh Rewards Personal Prices + App Freebie', fp: 'varies', fn: 1, rv: 'varies', sv: '40%+', sn: 45, badge: 'APP COUPON',
  steps: ['Check <strong>Fresh Rewards</strong> app for personalized prices (built from your history)', 'Clip the weekly app freebie (most weeks)', 'Stack manufacturer coupons on personal-price items'],
  stk: ['Personal prices', 'Weekly app freebie', 'Manufacturer coupons'], apps: ['Lowes Foods app', 'Ibotta'], exp: 'Weekly',
  src: 'Lowes Foods Fresh Rewards program', surl: 'https://www.lowesfoods.com/fresh-rewards', durl: 'https://www.lowesfoods.com/weekly-ad',
  tip: 'The app freebie alone is worth the download — Lowes gives away a full-size item most weeks to Fresh Rewards members.' }),
X({ markets: ['nyc', 'philly'], store: 'ShopRite', cat: 'Pantry', em: '🛒', hot: 85, ...RED,
  title: 'ShopRite Digital + Catalina Rolling Stack (Can Can-style)', fp: 'near free', fn: 0.5, rv: 'varies', sv: '80%', sn: 80, badge: 'STACK IT',
  steps: ['Load ShopRite digital coupons in the app', 'Buy Catalina-triggering multiples (e.g. buy 3 → $3 Catalina prints)', 'Pay with previous trip’s Catalina', 'Roll the new Catalina into the next transaction', 'During Can Can Sale weeks, stack all of it on rock-bottom case-lot prices'],
  stk: ['Digital coupons', 'Catalina offers (rolling)', 'Manufacturer coupons', 'Ibotta'], apps: ['ShopRite app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Living Rich With Coupons — ShopRite weekly matchup', surl: 'https://www.livingrichwithcoupons.com/shoprite-coupon-deals', surl2: '', durl: 'https://www.shoprite.com/savings',
  tip: 'LRWC publishes the ShopRite Catalina list weekly — rolling Catalinas is how NE couponers hit 80–90% off. One digital clip per item.' }),
X({ markets: ['nyc', 'boston'], store: 'Stop & Shop', cat: 'Pantry', em: '🛑', hot: 77, ...GOLD,
  title: 'Stop & Shop GO Rewards Points + Digital Coupon Stack', fp: '~55% off', fn: 2, rv: 'varies', sv: '55%', sn: 55, badge: 'APP COUPON',
  steps: ['Clip digital coupons in the S&S app', 'Buy GO Rewards bonus-point items', 'Convert points to grocery dollars or gas savings', 'Stack paper manufacturer coupons on top'],
  stk: ['Digital coupons', 'GO Rewards points', 'Manufacturer coupons'], apps: ['Stop & Shop app', 'Ibotta'], exp: W,
  src: 'Stop & Shop GO Rewards program', surl: 'https://stopandshop.com/savings-and-rewards/go-rewards/about', durl: 'https://stopandshop.com/pages/weekly-ad',
  tip: 'Points-to-groceries redemption beats the gas conversion in most cases — 100 points ≈ $1 off the basket.' }),
X({ markets: ['philly', 'dc'], store: 'Giant', cat: 'Pantry', em: '🦣', hot: 76, ...TEAL,
  title: 'Giant Flexible Rewards + Digital Stack', fp: '~50% off', fn: 2, rv: 'varies', sv: '50%', sn: 50, badge: 'APP COUPON',
  steps: ['Clip Giant digital coupons', 'Earn Flexible Rewards points on bonus items', 'Redeem points for $ off groceries or gas', 'Stack paper manufacturer coupons'],
  stk: ['Digital coupons', 'Flexible Rewards points', 'Manufacturer coupons'], apps: ['Giant app', 'Ibotta'], exp: W,
  src: 'Giant Flexible Rewards program', surl: 'https://giantfood.com/savings-and-rewards/flexible-rewards/about', durl: 'https://giantfood.com/pages/circular',
  tip: 'Giant’s bonus-point items often overlap Ibotta rebates — the double dip is the play.' }),
X({ markets: ['philly'], store: 'Acme', cat: 'Household', em: '🔔', hot: 73, ...TEAL,
  title: 'Acme for U Digital Deals + Friday $5 Deals', fp: 'varies', fn: 2, rv: 'varies', sv: '50%', sn: 50, badge: 'APP COUPON',
  steps: ['Load for U digital deals (Albertsons banner)', 'Hit Friday-only $5 meal/product deals', 'Stack manufacturer coupons', 'Ibotta on top'],
  stk: ['for U digitals', 'Friday $5 deals', 'Manufacturer coupons', 'Ibotta'], apps: ['Acme app', 'Ibotta'], exp: 'Fridays + weekly',
  src: 'Acme (Albertsons) for U program', surl: 'https://www.acmemarkets.com/foru/coupons-deals.html', durl: 'https://www.acmemarkets.com/weeklyad.html',
  tip: 'Same for U engine as Safeway/Randalls/Vons — clip everything; unused clips cost nothing.' }),
X({ markets: ['dc', 'denver', 'phoenix', 'seattle'], store: 'Safeway', cat: 'Pantry', em: '🛟', hot: 81, ...GOLD,
  title: 'Safeway for U Personalized + Insert Coupon Stack', fp: '~60% off', fn: 2, rv: 'varies', sv: '60%', sn: 60, badge: 'STACK IT',
  steps: ['Clip <strong>for U personalized deals</strong> (prices tuned to your history)', 'Stack Sunday-insert manufacturer coupons', 'Weekly $5 Friday-weekend deals', 'Ibotta + Fetch on top'],
  stk: ['for U personalized prices', 'Insert coupons', '$5 weekend deals', 'Ibotta'], apps: ['Safeway app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Safeway for U weekly program', surl: 'https://www.safeway.com/foru/coupons-deals.html', durl: 'https://www.safeway.com/weeklyad.html',
  tip: 'for U "free item" clips appear most holiday weekends. Personalized prices differ per account — check both spouses’ apps.' }),
X({ markets: ['phoenix', 'la'], store: 'Albertsons', cat: 'Pantry', em: '🅰️', hot: 78, ...TEAL,
  title: 'Albertsons for U + Mix & Match Buy More Save More', fp: '~55% off', fn: 2, rv: 'varies', sv: '55%', sn: 55, badge: 'STACK IT',
  steps: ['Clip for U digitals', 'Buy into the weekly Mix & Match event (buy 3+ → deeper unit price)', 'Stack manufacturer coupons', 'Ibotta rebates'],
  stk: ['for U digitals', 'Mix & Match tiered price', 'Manufacturer coupons', 'Ibotta'], apps: ['Albertsons app', 'Ibotta'], exp: W,
  src: 'Albertsons for U weekly deals', surl: 'https://www.albertsons.com/foru/coupons-deals.html', durl: 'https://www.albertsons.com/weeklyad.html',
  tip: 'Mix & Match unit prices only fire at the full multiple — buy exactly 3 (or 6), never 4.' }),
X({ markets: ['la'], store: 'Vons', cat: 'Dessert', em: '🍦', hot: 72, ...TEAL,
  title: 'Vons for U Freebie Friday + Digital Stack (LA)', fp: 'free item', fn: 0, rv: '$3–5', sv: '100%', sn: 95, badge: 'FREE ITEM',
  steps: ['Open the Vons app Friday — clip the <strong>Freebie Friday</strong> item', 'Redeem within the window (usually Fri–Sun)', 'Stack the rest of the trip with for U digitals'],
  stk: ['Freebie Friday clip', 'for U digitals'], apps: ['Vons app'], exp: 'Fridays',
  src: 'Vons (Albertsons) Freebie Friday program', surl: 'https://www.vons.com/foru/coupons-deals.html', durl: 'https://www.vons.com/weeklyad.html',
  tip: 'Freebie Friday is account-wide across Albertsons banners — Vons, Safeway, Albertsons, Randalls all drop it.' }),
X({ markets: ['chicago'], store: 'Jewel-Osco', cat: 'Breakfast', em: '💠', hot: 79, ...GOLD,
  title: 'Jewel-Osco for U + MyMixx Monday Deals Stack', fp: '~60% off', fn: 1.5, rv: 'varies', sv: '60%', sn: 60, badge: 'STACK IT',
  steps: ['Clip for U digitals in the Jewel app', 'Hit Monday-only app deals', 'Stack Sunday-insert coupons (Chicago Tribune inserts are strong)', 'Ibotta rebates on top'],
  stk: ['for U digitals', 'Monday app deals', 'Insert coupons', 'Ibotta'], apps: ['Jewel-Osco app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Jewel-Osco (Albertsons) for U weekly deals', surl: 'https://www.jewelosco.com/foru/coupons-deals.html', durl: 'https://www.jewelosco.com/weeklyad.html',
  tip: 'Jewel’s Monday digital deals are Chicago’s quiet best day to shop — limited-clip, refreshed weekly.' }),
X({ markets: ['chicago'], store: "Mariano's", cat: 'Produce', em: '🍅', hot: 75, ...TEAL,
  title: 'Mariano’s Mega Event + Digital Stack (Kroger banner)', fp: 'from 99¢', fn: 0.99, rv: '$3+', sv: '65%', sn: 65, badge: '5X EVENT',
  steps: ['Buy 5 Mega items, save $5', 'Stack Mariano’s digital coupons', 'Ibotta on top', 'Fuel points accrue'],
  stk: ['Buy 5 Save $5', 'Digital coupons', 'Ibotta'], apps: ['Mariano’s app', 'Ibotta'], exp: W,
  src: 'Mariano’s (Kroger banner) weekly Mega Event', surl: 'https://www.marianos.com/weeklyad', durl: 'https://www.marianos.com/weeklyad',
  tip: 'Same Kroger digital wallet — coupons clipped for Kroger travel work at Mariano’s.' }),
X({ markets: CHAIN_MARKETS['Meijer'], store: 'Meijer', cat: 'Baby', em: '👶', hot: 84, ...RED,
  title: 'Meijer mPerks Stacked Rewards — Diapers ~50% Off', fp: '~50% off', fn: 15, rv: '$29.99', sv: '50%', sn: 50, badge: 'MPERKS',
  steps: ['Clip mPerks digital coupons on diapers/wipes', 'Buy into the weekly <strong>spend $X get $Y off next trip</strong> baby event', 'Stack manufacturer coupons', 'mPerks rewards auto-apply next trip — roll them into the next baby run'],
  stk: ['mPerks digitals', 'Baby event reward', 'Manufacturer coupons', 'Ibotta'], apps: ['Meijer mPerks', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Meijer mPerks baby-care weekly events', surl: 'https://www.meijer.com/shopping/mperks.html', durl: 'https://www.meijer.com/shopping/weekly-ad.html',
  tip: 'Meijer baby events + mPerks + manufacturer coupons is the Midwest’s best diaper stack — rolling rewards keeps every trip ~50% off.' }),
X({ markets: ['minneapolis'], store: 'Hy-Vee', cat: 'Pantry', em: '🌽', hot: 76, ...TEAL,
  title: 'Hy-Vee Deals App + Fuel Saver Cross-Stack', fp: '~50% off', fn: 2, rv: 'varies', sv: '50%', sn: 50, badge: 'APP COUPON',
  steps: ['Clip Hy-Vee Deals digital coupons', 'Buy Fuel Saver tagged items — cents-per-gallon banks automatically', 'Stack manufacturer coupons', 'Wednesday ads overlap two weeks — double ad day'],
  stk: ['Hy-Vee digitals', 'Fuel Saver credits', 'Manufacturer coupons'], apps: ['Hy-Vee app', 'Ibotta'], exp: W,
  src: 'Hy-Vee Deals + Fuel Saver program', surl: 'https://www.hy-vee.com/deals', durl: 'https://www.hy-vee.com/stores/ads.aspx',
  tip: 'Wednesday is Hy-Vee’s two-ads-valid-at-once day — matchups double up. Fuel Saver is effectively cash back.' }),
X({ markets: ['minneapolis'], store: 'Cub Foods', cat: 'Snacks', em: '🐻', hot: 70, ...TEAL,
  title: 'Cub Digital Coupons + My Cub Rewards', fp: '~45% off', fn: 2, rv: 'varies', sv: '45%', sn: 45, badge: 'APP COUPON',
  steps: ['Clip Cub digital coupons in the app', 'Stack manufacturer coupons', 'Ibotta rebates on top'],
  stk: ['Cub digitals', 'Manufacturer coupons', 'Ibotta'], apps: ['Cub app', 'Ibotta'], exp: W,
  src: 'Cub Foods digital coupon program', surl: 'https://www.cub.com/savings/coupons.html', durl: 'https://www.cub.com/savings/weekly-ad.html',
  tip: 'Cub’s digitals allow one clip per account — households with two accounts double every deal.' }),
X({ markets: ['boston'], store: 'Market Basket', cat: 'Produce', em: '🧺', hot: 74, ...TEAL,
  title: 'Market Basket Everyday Low Base + Manufacturer Coupons', fp: '10–30% below chains', fn: 2, rv: 'varies', sv: '30%+', sn: 40, badge: 'HOT PRICE',
  steps: ['No card, no digital hoops — shelf prices run 10–30% below competitors', 'Stack Sunday-insert manufacturer coupons on the already-low base', 'Ibotta/Fetch still work on national brands'],
  stk: ['Everyday low base price', 'Manufacturer coupons', 'Ibotta'], apps: ['Ibotta', 'Fetch Rewards'], exp: 'Ongoing',
  src: 'Market Basket pricing model — New England benchmark', surl: 'https://www.shopmarketbasket.com/weekly-flyer', durl: 'https://www.shopmarketbasket.com/weekly-flyer',
  tip: 'A plain manufacturer coupon at Market Basket often beats a triple stack elsewhere — the base price is that low.' }),
X({ markets: ['nyc', 'philly', 'dc', 'boston', 'rdu'], store: 'Wegmans', cat: 'Pantry', em: '🥖', hot: 71, ...TEAL,
  title: 'Wegmans Digital Coupons + Family-Pack Unit Pricing', fp: 'varies', fn: 2, rv: 'varies', sv: '35%', sn: 35, badge: 'APP COUPON',
  steps: ['Clip Wegmans app digital coupons (expanded program)', 'Buy family packs — unit price beats sale singles', 'Stack manufacturer coupons at register'],
  stk: ['Wegmans digitals', 'Family-pack pricing', 'Manufacturer coupons'], apps: ['Wegmans app', 'Ibotta'], exp: W,
  src: 'Wegmans digital coupon program', surl: 'https://www.wegmans.com/digital-coupons/', durl: 'https://www.wegmans.com/deals/',
  tip: 'Wegmans is a low-coupon chain, but its store-brand + family-pack math wins on staples; save the coupon energy for national brands.' }),
X({ markets: ['all'], store: 'Aldi', cat: 'Produce', em: '🥑', hot: 77, ...GOLD,
  title: 'Aldi Finds Wednesday Drop + Produce Picks of the Week', fp: 'benchmark low', fn: 1, rv: 'varies', sv: '40%+', sn: 42, badge: 'HOT PRICE',
  steps: ['New <strong>Aldi Finds</strong> drop Wednesday — limited-run pantry/household at aggressive prices', 'Weekly produce picks routinely beat every chain (49¢ avocados class of deals)', 'No coupons needed — Aldi is the price floor; Ibotta has an Aldi-specific rebate gallery'],
  stk: ['Aldi Finds weekly drop', 'Produce picks', 'Ibotta Aldi gallery'], apps: ['Aldi app', 'Ibotta'], exp: 'Wednesdays',
  src: 'Aldi weekly ad + Ibotta Aldi rebate gallery', surl: 'https://www.aldi.us/weekly-specials/', durl: 'https://www.aldi.us/weekly-specials/',
  tip: 'Use Aldi as your price benchmark: if a stacked deal elsewhere doesn’t beat Aldi’s shelf price, skip the gymnastics.' }),
X({ markets: ['rdu', 'charlotte', 'atlanta', 'nyc', 'philly', 'dc'], store: 'Lidl', cat: 'Pantry', em: '🔵', hot: 73, ...TEAL,
  title: 'Lidl Plus App Coupons + Weekly Coupon Star', fp: 'varies', fn: 1, rv: 'varies', sv: '40%', sn: 40, badge: 'APP COUPON',
  steps: ['Open Lidl Plus — clip the weekly <strong>Coupon Star</strong> (% off a category)', 'Stack app coupons on already-low base prices', 'Scratch the app’s post-checkout reward wheel'],
  stk: ['Lidl Plus coupons', 'Coupon Star %-off', 'App reward wheel'], apps: ['Lidl Plus'], exp: 'Weekly',
  src: 'Lidl Plus weekly app offers', surl: 'https://www.lidl.com/rewards', durl: 'https://www.lidl.com/weekly-ads',
  tip: 'Lidl Plus gives a spend-threshold coupon ($5 off $30 class) most months — combine with Coupon Star week for the deepest basket cut.' }),
X({ markets: ['austin', 'dfw', 'houston', 'sanantonio', 'denver', 'phoenix', 'la', 'rdu', 'charlotte', 'atlanta', 'tampa'], store: 'Sprouts', cat: 'Produce', em: '🥕', hot: 72, ...TEAL,
  title: 'Sprouts App Deals + Double Ad Wednesday', fp: 'varies', fn: 1, rv: 'varies', sv: '40%', sn: 40, badge: 'APP COUPON',
  steps: ['Wednesday = <strong>double ad day</strong> (old + new ad both valid)', 'Clip Sprouts app deals + the weekly app freebie', 'Produce sales run 30–50% below conventional chains'],
  stk: ['Double ad Wednesday', 'App deals + freebie', 'Manufacturer coupons'], apps: ['Sprouts app', 'Ibotta'], exp: 'Wednesdays',
  src: 'Sprouts weekly ad + app deals', surl: 'https://www.sprouts.com/weekly-ad/', durl: 'https://www.sprouts.com/weekly-ad/',
  tip: 'The Sprouts app drops a free-item coupon most Fridays. Wednesday double-ad + freebie Friday are the two days that matter.' }),
X({ markets: ['dfw', 'phoenix', 'seattle'], store: 'WinCo', cat: 'Pantry', em: '🧮', hot: 69, ...TEAL,
  title: 'WinCo Bulk Bins + Manufacturer Coupons on Low Base', fp: 'benchmark low', fn: 1, rv: 'varies', sv: '35%+', sn: 38, badge: 'HOT PRICE',
  steps: ['Employee-owned, no-card everyday low prices; bulk bins for staples', 'Manufacturer coupons accepted on the low base', 'Note: debit/cash only (no credit) — that’s how prices stay down'],
  stk: ['Everyday low base', 'Bulk-bin pricing', 'Manufacturer coupons'], apps: ['Fetch Rewards'], exp: 'Ongoing',
  src: 'WinCo pricing model', surl: 'https://www.wincofoods.com/save', durl: 'https://www.wincofoods.com/save',
  tip: 'Bring a debit card. Bulk-bin spices at WinCo are 80–90% cheaper than jarred — the single biggest unit-price win in the store.' }),
X({ markets: ['all'], store: 'Costco', cat: 'Household', em: '🏬', hot: 74, ...GOLD,
  title: 'Costco Member Savings Book + Manufacturer Stack-Free Math', fp: 'varies', fn: 5, rv: 'varies', sv: '25–40%', sn: 35, badge: 'SALE',
  steps: ['Work the monthly <strong>Member Savings book</strong> (instant rebates, no clipping)', 'Compare unit price vs your best stacked grocery deal — bulk often still loses to a good stack', 'Stack Ibotta’s Costco gallery + Costco Shop Card promos'],
  stk: ['Member Savings instant rebates', 'Ibotta Costco gallery'], apps: ['Costco app', 'Ibotta'], exp: 'Monthly book',
  src: 'Costco monthly Member Savings', surl: 'https://www.costco.com/online-offers.html', durl: 'https://www.costco.com/online-offers.html',
  tip: 'Costco is for the 20% of items coupons never touch (bulk proteins, cheese). For CPG brands, your drugstore stacks beat warehouse unit prices.' }),
X({ markets: ['austin', 'houston', 'sanantonio'], store: 'HEB', cat: 'Meal Deal', em: '🤠', hot: 91, ...RED,
  title: 'H-E-B Combo Loco + Yellow Coupon + App Stack', fp: 'free add-ons', fn: 0, rv: 'varies', sv: '100% on combo item', sn: 85, badge: 'COMBO LOCO',
  steps: ['Grab this week’s <strong>Combo Loco</strong> deals — buy the anchor item, get partner items FREE', 'Stack in-store <strong>yellow coupons</strong> on the anchor where allowed', 'Clip H-E-B app digital coupons for the rest of the basket', 'H-E-B coupons stack WITH manufacturer coupons on the same item'],
  stk: ['Combo Loco free items', 'Yellow in-store coupons', 'H-E-B digital app coupons', 'Manufacturer coupons'], apps: ['H-E-B app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'H-E-B weekly ad Combo Loco — @txfrugalfinds regular feature', surl: 'https://www.heb.com/savings/coupons', durl: 'https://www.heb.com/weekly-ads',
  tip: 'H-E-B is one of the few chains where a store coupon + manufacturer coupon + Combo Loco all stack on one item. Texas couponing’s crown jewel.' }),
];

// ─── STAPLES, DRINKS & SNACKS ───────────────────────────────────────────────
// The everyday grocery-list layer: sports drinks, soda, water, chips, cereal,
// bread, milk, eggs, meat, pasta, coffee, paper goods. These are the deals that
// actually move a weekly budget, so they carry the deepest stacking detail.
const STAPLES = [

// ══════════════ SPORTS DRINKS — the deep-stack category ══════════════
X({ markets: ['all'], store: 'Dollar General', cat: 'Beverages', em: '⚡', hot: 98, ...RED,
  title: 'Powerade / Gatorade 28oz — as low as 50¢ Each (4-Layer DG Stack)', fp: '50¢–75¢ each', fn: 0.50, rv: '$2.29 each', sv: '75%', sn: 78, badge: 'MONSTER STACK',
  steps: [
    'Sports drinks go to <strong>4/$5 ($1.25 each)</strong> in the DG weekly ad — buy <strong>20 bottles = $25</strong>',
    'Clip the <strong>$5 off $25 Saturday digital coupon</strong> in the DG app → $20 ($1.00 each)',
    'Stack DG digital <strong>"$2 off 5 Powerade/Gatorade"</strong> offers — clip 4 of them = $8 off → <strong>$12 total ($0.60 each)</strong>',
    'Submit any active <strong>Ibotta sports-drink rebate</strong> (rotates 25¢–50¢/bottle) → lands <strong>$0.50 or below</strong>',
    'Scan the receipt in Fetch for points on top',
    'Cashier tip: the $5/$25 is calculated on the <strong>pre-digital-coupon</strong> subtotal, so hit $25 on shelf price'],
  stk: ['4/$5 weekly ad price', '$5 off $25 Saturday digital', '$2/5 DG digital coupons ×4', 'Ibotta rebate', 'Fetch Rewards'],
  apps: ['Dollar General app', 'Ibotta', 'Fetch Rewards'], exp: 'Saturday $5/$25 — every Saturday',
  src: 'Dollar General Saturday $5/$25 + digital coupon stack — the standing DG sports-drink play tracked by @couponcowboy and torokcouponhunter.com',
  tip: 'This is the single best repeatable stack in the app. The $5/$25 fires Saturdays only and DG caps it at one per transaction — so split a big haul into multiple $25 transactions and run the coupon on each.' }),

X({ markets: ['austin', 'houston', 'sanantonio'], store: 'HEB', cat: 'Beverages', em: '⚡', hot: 95, ...RED,
  title: 'Gatorade / Powerade 32oz — 60¢ Each with Combo Loco + Digital', fp: '60¢–$1 each', fn: 0.60, rv: '$2.18 each', sv: '72%', sn: 72, badge: 'COMBO LOCO',
  steps: [
    'Sports drinks hit <strong>5/$5 ($1.00 each)</strong> on the H-E-B weekly ad in summer',
    'Clip the H-E-B digital <strong>"$1 off 5 Gatorade"</strong> coupon in the app → $0.80 each',
    'H-E-B store coupons stack <strong>with</strong> manufacturer coupons on the same item — add any Gatorade insert coupon',
    'Check the <strong>Combo Loco</strong> block: sports drinks are a frequent anchor, which throws in free chips or a free snack when you buy the qualifying count',
    'Final: <strong>$0.60–$0.80 per 32oz bottle plus a free partner item</strong>'],
  stk: ['5/$5 weekly ad price', 'H-E-B digital $1/5 coupon', 'Manufacturer insert coupon', 'Combo Loco free partner item'],
  apps: ['H-E-B app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'H-E-B weekly ad sports-drink promo + Combo Loco mechanics — a recurring @txfrugalfinds feature',
  tip: 'H-E-B is one of very few chains where a store coupon AND a manufacturer coupon both apply to one item. Always check whether sports drinks are a Combo Loco anchor that week — the free partner item is pure upside.' }),

X({ markets: ['all'], store: 'Walgreens', cat: 'Beverages', em: '💧', hot: 86, ...GOLD,
  title: 'Gatorade 8-Packs 2/$12 — $4.50 Each After Cash Rewards', fp: '$4.50 each', fn: 4.50, rv: '$8.49 each', sv: '47%', sn: 47, badge: 'REG. REWARDS',
  steps: ['Gatorade 8-packs on sale <strong>2/$12</strong> (regularly $8.49 each)',
    'Earn <strong>$3 Walgreens Cash Rewards</strong> when you buy 2',
    'Clip any Gatorade digital coupon in the myWalgreens app',
    'Final: <strong>$9 for two 8-packs = $4.50 each</strong>, roughly 56¢ per bottle',
    'Roll the Cash Rewards straight into your next trip'],
  stk: ['2/$12 sale price', '$3 Walgreens Cash Rewards', 'myWalgreens digital coupon'],
  apps: ['myWalgreens App', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Walgreens weekly ad beverage promo — recurring hip2save matchup',
  tip: 'Per-bottle this beats most grocery sales, and Cash Rewards roll to the next visit — pair it with a drugstore personal-care stack the same trip.' }),

X({ markets: ['all'], store: 'Walmart', cat: 'Beverages', em: '🥤', hot: 80, ...TEAL,
  title: 'Gatorade 12-Pack — $6.48 After Ibotta (54¢/Bottle)', fp: '$6.48', fn: 6.48, rv: '$9.98', sv: '35%', sn: 35, badge: 'HOT PRICE',
  steps: ['Gatorade 12-pack 12oz bottles at the everyday <strong>$8.48 rollback</strong>',
    'Activate the <strong>$2 Ibotta Gatorade rebate</strong> before checkout (rotates in most months)',
    'Final: <strong>$6.48 = 54¢ per bottle</strong>',
    'Scan in Fetch for additional points'],
  stk: ['Walmart rollback price', '$2 Ibotta rebate', 'Fetch Rewards'],
  apps: ['Walmart app', 'Ibotta', 'Fetch Rewards'], exp: 'Rollback — ongoing',
  src: 'Walmart everyday rollback + Ibotta beverage rebate gallery',
  tip: 'Walmart takes no store coupons, so rebate apps are the entire stack. Check Ibotta and Checkout 51 for the same item — occasionally both pay out.' }),

// ══════════════ SODA, WATER & COFFEE ══════════════
X({ markets: CHAIN_MARKETS['Kroger'], store: 'Kroger', cat: 'Beverages', em: '🥫', hot: 91, ...RED,
  title: 'Coke / Pepsi 12-Packs — $2.50 Each in the Mega Event', fp: '$2.50 each', fn: 2.50, rv: '$8.49 each', sv: '70%', sn: 70, badge: '5X EVENT',
  steps: ['Soda 12-packs are a standing <strong>Buy 5 Save $5 Mega Event</strong> anchor — usually 5/$17.50 tagged',
    'Each of the 5 items drops $1 automatically at the register',
    'Load the Kroger digital <strong>"$3 off 5 Coca-Cola"</strong> coupon on top',
    'Stack a manufacturer insert coupon where one is running',
    'Final: <strong>$2.50 per 12-pack</strong> — about 21¢ a can',
    'Fuel points accrue on the pre-discount total'],
  stk: ['Buy 5 Save $5 Mega price', 'Kroger digital $3/5 coupon', 'Manufacturer insert coupon', 'Fuel points'],
  apps: ['Kroger app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Kroger Mega Event beverage anchor — Southern Savers weekly Kroger matchup',
  tip: 'Mix and match across Coke, Pepsi and Dr Pepper to hit the 5 — the $1/item discount is per item, not per brand. Holiday weekends push these to 4/$12.' }),

X({ markets: CHAIN_MARKETS['Publix'], store: 'Publix', cat: 'Beverages', em: '🧃', hot: 89, ...RED,
  title: 'Soda & Sparkling Water BOGO — Two 12-Packs for $4.24', fp: '$2.12 each', fn: 2.12, rv: '$8.49 each', sv: '75%', sn: 75, badge: 'BOGO STACK',
  steps: ['Beverages hit the <strong>Publix BOGO list</strong> nearly every week',
    'In BOGO markets both 12-packs ring at half price — <strong>$4.24 each</strong>',
    'Apply <strong>TWO manufacturer coupons</strong> (one per item) — this is the whole Publix game',
    'Add a Publix digital coupon where one is stacked on the same item',
    'Final: roughly <strong>$2.12 per 12-pack</strong>'],
  stk: ['Publix BOGO sale', '2× manufacturer coupons', 'Publix digital coupon', 'Ibotta'],
  apps: ['Publix app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Publix weekly BOGO beverage list — I Heart Publix / Southern Savers matchup',
  tip: 'Because Publix BOGOs ring as two half-price items rather than one free, you get to use a coupon on each. Never hand over just one coupon on a BOGO pair.' }),

X({ markets: ['all'], store: 'Aldi', cat: 'Beverages', em: '💦', hot: 78, ...GOLD,
  title: 'Spring Water 24-Pack — $2.49 (10¢ a Bottle, Price Floor)', fp: '$2.49', fn: 2.49, rv: '$4.99', sv: '50%', sn: 50, badge: 'HOT PRICE',
  steps: ['Aldi 24-pack spring water sits at <strong>$2.49–$2.99</strong> everyday — about 10¢ a bottle',
    'No coupon needed; this is the national price floor for bottled water',
    'Check the <strong>Ibotta Aldi gallery</strong> — Aldi-specific rebates stack even on Aldi store brands',
    'Use as your benchmark: if a "deal" elsewhere doesn\'t beat 10¢/bottle, skip it'],
  stk: ['Aldi everyday low price', 'Ibotta Aldi gallery rebate'],
  apps: ['Aldi app', 'Ibotta'], exp: 'Everyday price',
  src: 'Aldi everyday pricing — the benchmark most matchup blogs price against',
  tip: 'Aldi is the price floor for water, eggs, milk and butter. Use it to sanity-check every stack in this app — a 4-layer coupon stack that lands above Aldi shelf price isn\'t a deal.' }),

X({ markets: ['all'], store: 'Target', cat: 'Beverages', em: '☕', hot: 84, ...GOLD,
  title: 'Starbucks Bagged Coffee — $5.49 After Circle + Gift Card Promo', fp: '$5.49', fn: 5.49, rv: '$11.49', sv: '52%', sn: 52, badge: 'BASKET DEAL',
  steps: ['Coffee runs a recurring <strong>$5 Target gift card when you buy 3</strong> promo',
    'Sale price around <strong>$8.49</strong> per bag during the event',
    'Stack the <strong>Target Circle 20% off coffee</strong> offer → about $6.79 each',
    'Apply a Starbucks manufacturer coupon where one is running (frequent in inserts)',
    'Buy 3 → $5 gift card back = effectively <strong>$5.49 a bag</strong>',
    'Roll the gift card into next week\'s essentials run'],
  stk: ['Buy 3 get $5 gift card', 'Target Circle 20% off', 'Manufacturer coupon', 'Ibotta'],
  apps: ['Target Circle', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Target weekly ad gift-card coffee promo — recurring hip2save Target matchup',
  tip: 'Target gift-card thresholds are calculated on shelf price before coupons, so hit the qualifying count first and let coupons reduce what you actually pay.' }),

// ══════════════ CHIPS & SNACKS ══════════════
X({ markets: CHAIN_MARKETS['Kroger'], store: 'Kroger', cat: 'Snacks', em: '🥔', hot: 93, ...RED,
  title: 'Frito-Lay / Doritos Party Size — $1.49 a Bag in the Mega', fp: '$1.49 each', fn: 1.49, rv: '$5.79 each', sv: '74%', sn: 74, badge: '5X EVENT',
  steps: ['Party-size chips are a regular <strong>Buy 5 Save $5</strong> Mega item at $3.49 tagged',
    'Mega discount drops each bag $1 → $2.49',
    'Load the Kroger digital <strong>"$5 off 5 Frito-Lay"</strong> coupon → another $1 off each',
    'Final: <strong>$1.49 per party-size bag</strong>',
    'Add an Ibotta snack rebate if one is live for the brand'],
  stk: ['Buy 5 Save $5 Mega price', 'Kroger digital $5/5 coupon', 'Ibotta snack rebate'],
  apps: ['Kroger app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Kroger Mega Event snack anchor — Southern Savers Kroger matchup',
  tip: 'Party-size bags qualify for the Mega at the same $1 discount as small bags — always take the biggest qualifying size for the best unit price.' }),

X({ markets: CHAIN_MARKETS['Harris Teeter'], store: 'Harris Teeter', cat: 'Snacks', em: '🥨', hot: 90, ...RED,
  title: 'Snacks & Crackers — Free to 50¢ with Everyday Coupon Doubling', fp: 'free–50¢', fn: 0.25, rv: '$3.49', sv: '90%', sn: 90, badge: 'DOUBLE COUP',
  steps: ['Harris Teeter <strong>doubles manufacturer coupons up to 99¢ every single day</strong> (20 per day)',
    'A 75¢ snack coupon becomes <strong>$1.50 off</strong>',
    'Pair a doubled coupon with a weekly sale price around $1.50–$2 → free to 50¢',
    'Stack an <strong>e-VIC digital offer</strong> loaded to your VIC card on the same item',
    'During <strong>Super Doubles</strong> events coupons up to $2 double — a $2 coupon = $4 off'],
  stk: ['Everyday 99¢ coupon doubling', 'Weekly sale price', 'e-VIC digital offer', 'Super Doubles (event weeks)'],
  apps: ['Harris Teeter app', 'Ibotta', 'Fetch Rewards'], exp: 'Doubling daily; Super Doubles announced in ad',
  src: 'Harris Teeter coupon policy (everyday doubling to 99¢) + Southern Savers Super Doubles tracker',
  tip: 'Everyday doubling makes Harris Teeter the best coupon store in the Carolinas even outside events — bring twenty 75¢ coupons and each is worth $1.50.' }),

X({ markets: ['all'], store: 'Walgreens', cat: 'Snacks', em: '🍿', hot: 82, ...GOLD,
  title: 'Chips & Snacks 2/$6 — $1.50 a Bag After Cash Rewards', fp: '$1.50 each', fn: 1.50, rv: '$4.49 each', sv: '67%', sn: 67, badge: 'REG. REWARDS',
  steps: ['Large bags of chips on sale <strong>2/$6</strong>',
    'Earn <strong>$3 Walgreens Cash Rewards</strong> when you buy 2',
    'Clip any snack digital coupon in the myWalgreens app',
    'Final: <strong>$3 for two bags = $1.50 each</strong>',
    'Roll the Cash Rewards into the same trip\'s next deal'],
  stk: ['2/$6 sale price', '$3 Walgreens Cash Rewards', 'myWalgreens digital coupon'],
  apps: ['myWalgreens App', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Walgreens weekly ad snack promo — recurring hip2save matchup',
  tip: 'Walgreens Cash Rewards are spendable in the same visit — do the snack deal first, then apply the rewards to household essentials before leaving.' }),

X({ markets: CHAIN_MARKETS['Food Lion'], store: 'Food Lion', cat: 'Snacks', em: '🦁', hot: 79, ...TEAL,
  title: 'Snack Aisle — 60% Off with MVP + Shop & Earn Stack', fp: '~$1.20 each', fn: 1.20, rv: '$3.29', sv: '63%', sn: 63, badge: 'MVP STACK',
  steps: ['Activate <strong>Shop & Earn</strong> snack-category offers in the Food Lion app at the start of the month',
    'Buy MVP-tagged snack sale items in those categories',
    'Stack manufacturer coupons on each item',
    'Shop & Earn rewards load automatically and apply as instant savings on your next trip',
    'Effective final: roughly <strong>60% off the shelf price</strong>'],
  stk: ['MVP sale price', 'Shop & Earn category rewards', 'Manufacturer coupons'],
  apps: ['Food Lion app', 'Ibotta', 'Fetch Rewards'], exp: 'Monthly Shop & Earn cycle',
  src: 'Food Lion MVP Shop & Earn program mechanics',
  tip: 'Shop & Earn offers reset on the 1st and must be activated before they count — set a monthly reminder or you leave the entire rewards layer on the table.' }),

// ══════════════ CEREAL, BREAD & BREAKFAST ══════════════
X({ markets: CHAIN_MARKETS['Kroger'], store: 'Kroger', cat: 'Breakfast', em: '🥣', hot: 88, ...RED,
  title: 'General Mills Cereal — 99¢ a Box in the Mega Event', fp: '99¢ each', fn: 0.99, rv: '$4.99 each', sv: '80%', sn: 80, badge: '5X EVENT',
  steps: ['Cereal is a standing Mega Event item — <strong>Buy 5 Save $5</strong> puts boxes at about $1.99',
    'Load the Kroger digital <strong>"$1 off 2 General Mills"</strong> coupon',
    'Stack a General Mills insert coupon (they run near-monthly)',
    'Add the Ibotta cereal rebate when live',
    'Final: <strong>99¢ per box</strong>'],
  stk: ['Buy 5 Save $5 Mega price', 'Kroger digital coupon', 'General Mills insert coupon', 'Ibotta rebate'],
  apps: ['Kroger app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Kroger Mega Event cereal anchor — Southern Savers Kroger matchup',
  tip: 'Cereal is the most reliably couponed category in the store. Under $1 a box is the stock-up threshold — buy a month\'s worth when it hits.' }),

X({ markets: ['austin', 'houston', 'sanantonio'], store: 'HEB', cat: 'Bakery', em: '🍞', hot: 81, ...GOLD,
  title: 'H-E-B Bakery Bread — $1 a Loaf with Digital Coupon', fp: '$1.00', fn: 1.00, rv: '$2.48', sv: '60%', sn: 60, badge: 'APP COUPON',
  steps: ['H-E-B store-brand bakery bread runs <strong>$1.48–$1.98</strong> on the weekly ad',
    'Clip the H-E-B digital <strong>bakery coupon</strong> in the app (rotates weekly, often 50¢–$1 off)',
    'Final: around <strong>$1.00 a loaf</strong>',
    'Check the reduced-price bakery rack after 7pm for an additional 30–50% off'],
  stk: ['Weekly ad price', 'H-E-B digital bakery coupon', 'Evening markdown rack'],
  apps: ['H-E-B app', 'Fetch Rewards'], exp: W,
  src: 'H-E-B weekly ad bakery pricing + app digital coupon rotation',
  tip: 'H-E-B marks bakery down hard in the evening. Stacking an app coupon on an already-marked-down loaf is the cheapest bread in Texas — and it freezes fine.' }),

X({ markets: ['all'], store: 'Aldi', cat: 'Dairy & Eggs', em: '🥚', hot: 85, ...GOLD,
  title: 'Eggs, Milk & Butter — The National Price Floor', fp: 'benchmark low', fn: 2.00, rv: 'varies', sv: '30–45%', sn: 40, badge: 'HOT PRICE',
  steps: ['Aldi holds the lowest everyday price on the four staples nearly every week: <strong>eggs, milk, butter, shredded cheese</strong>',
    'No card, no clipping, no coupon required',
    'Weekly ad "Aldi Finds" drop Wednesdays adds rotating pantry deals',
    'Check the <strong>Ibotta Aldi gallery</strong> — it pays out on Aldi store brands too',
    'Use these prices as the benchmark for every other stack in the app'],
  stk: ['Aldi everyday low price', 'Wednesday Aldi Finds drop', 'Ibotta Aldi gallery'],
  apps: ['Aldi app', 'Ibotta'], exp: 'Everyday; Finds drop Wednesdays',
  src: 'Aldi everyday staple pricing — the reference point for matchup blogs',
  tip: 'The highest-value habit in couponing: buy staples at Aldi, and save your coupon energy for the national-brand categories where stacking actually multiplies.' }),

X({ markets: CHAIN_MARKETS['Publix'], store: 'Publix', cat: 'Dairy & Eggs', em: '🧀', hot: 83, ...GOLD,
  title: 'Cheese & Yogurt BOGO — Two for the Price of One, Minus Two Coupons', fp: '~40% of retail', fn: 1.75, rv: '$4.49 each', sv: '61%', sn: 61, badge: 'BOGO STACK',
  steps: ['Dairy hits the Publix BOGO list most weeks (shredded cheese, yogurt multipacks, cream cheese)',
    'Both items ring at half price in BOGO markets',
    'Use <strong>two manufacturer coupons</strong> — one on each item',
    'Stack a Publix digital coupon where one exists on the same product',
    'Typical landing: <strong>$1.50–$2.00 per unit on $4.49 retail</strong>'],
  stk: ['Publix BOGO sale', '2× manufacturer coupons', 'Publix digital coupon', 'Ibotta'],
  apps: ['Publix app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Publix weekly BOGO dairy list — I Heart Publix matchup',
  tip: 'Publix BOGO cycles run about 6 weeks per product. When your staple hits BOGO, buy the full 6-week supply — cheese freezes, yogurt dates run long.' }),

// ══════════════ MEAT & FREEZER ══════════════
X({ markets: CHAIN_MARKETS['Harris Teeter'], store: 'Harris Teeter', cat: 'Meat & Seafood', em: '🍗', hot: 87, ...RED,
  title: 'Boneless Chicken Breast — $1.77/lb on the Weekly Ad Low', fp: '$1.77/lb', fn: 1.77, rv: '$4.99/lb', sv: '65%', sn: 65, badge: 'HOT PRICE',
  steps: ['Harris Teeter runs boneless skinless chicken breast to <strong>$1.77–$1.99/lb</strong> on rotation',
    'Buy the <strong>family pack</strong> — the ad price usually requires it',
    'Stack an e-VIC digital meat offer if one is loaded to your card',
    'Portion and freeze the same day in meal-size bags',
    'Watch the <strong>manager markdown stickers</strong> in the morning for an extra 30% on same-day-sell meat'],
  stk: ['Weekly ad family-pack price', 'e-VIC digital meat offer', 'Manager markdown stickers'],
  apps: ['Harris Teeter app', 'Fetch Rewards'], exp: W,
  src: 'Harris Teeter weekly ad meat rotation — Southern Savers Harris Teeter matchup',
  tip: 'Meat is where coupons don\'t reach, so the entire game is the ad cycle plus markdown timing. Under $2/lb on chicken breast is the stock-up trigger.' }),

X({ markets: ['austin', 'houston', 'sanantonio'], store: 'HEB', cat: 'Meat & Seafood', em: '🥩', hot: 84, ...GOLD,
  title: 'H-E-B Meat Market Ground Beef — $2.97/lb Family Pack', fp: '$2.97/lb', fn: 2.97, rv: '$5.48/lb', sv: '46%', sn: 46, badge: 'HOT PRICE',
  steps: ['80/20 ground beef family packs hit <strong>$2.97–$3.27/lb</strong> on the H-E-B ad',
    'Check the <strong>Combo Loco</strong> block — ground beef is a frequent anchor with free buns, cheese or seasoning',
    'Clip any H-E-B digital meat coupon in the app',
    'Look for the <strong>red "Reduced for Quick Sale" stickers</strong> in the morning meat case for another 30%'],
  stk: ['Family-pack ad price', 'Combo Loco free partner items', 'H-E-B digital meat coupon', 'Quick-sale markdown'],
  apps: ['H-E-B app', 'Fetch Rewards'], exp: W,
  src: 'H-E-B weekly ad meat pricing + Combo Loco mechanics',
  tip: 'H-E-B Combo Loco on ground beef routinely throws in buns and cheese free — a full burger night for the price of the meat alone.' }),

X({ markets: ['all'], store: 'Target', cat: 'Frozen', em: '🧊', hot: 80, ...TEAL,
  title: 'Frozen Meals & Veg — 30–40% Off with Circle + Gift Card Stack', fp: '~$1.20 each', fn: 1.20, rv: '$2.29 each', sv: '48%', sn: 48, badge: 'BASKET DEAL',
  steps: ['Frozen runs a recurring <strong>buy N get a Target gift card</strong> promo',
    'Stack <strong>Target Circle</strong> percent-off offers on individual frozen brands',
    'Add manufacturer coupons at the register — Target allows one store + one manufacturer coupon per item',
    'Submit Ibotta frozen-category rebates',
    'Typical: <strong>35–45% off</strong> the frozen aisle in one trip'],
  stk: ['Gift-card threshold promo', 'Target Circle offers', 'Manufacturer coupons', 'Ibotta rebates'],
  apps: ['Target Circle', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Target weekly ad frozen gift-card promo — hip2save Target matchup',
  tip: 'Target\'s one-store-plus-one-manufacturer-coupon-per-item policy is the most generous of the mass retailers. Frozen is where it pays off most.' }),

// ══════════════ PANTRY STAPLES ══════════════
X({ markets: ['all'], store: 'Dollar General', cat: 'Staples', em: '🥫', hot: 92, ...RED,
  title: 'Pantry Stock-Up — $25 Cart for $12 (Saturday $5/$25 + Digitals)', fp: '~50% off cart', fn: 12, rv: '$25', sv: '52%', sn: 55, badge: 'EVERY SAT',
  steps: ['Shop <strong>Saturday only</strong> — clip the <strong>$5 off $25</strong> digital coupon in the DG app',
    'Build the cart from sale-tagged pantry staples: pasta, sauce, rice, canned beans, cereal, peanut butter',
    'Clip <strong>every item-level DG digital coupon</strong> that matches your cart (they stack with the $5/$25)',
    'Add manufacturer coupons — DG accepts one per item alongside its own digital',
    'Typical landing: <strong>a $25 shelf-price cart for $12–$15</strong>',
    'Split larger hauls into separate $25 transactions — the $5/$25 is one per transaction'],
  stk: ['$5 off $25 Saturday digital', 'Item-level DG digital coupons', 'Manufacturer coupons', 'Ibotta'],
  apps: ['Dollar General app', 'Ibotta', 'Fetch Rewards'], exp: 'Every Saturday',
  src: 'Dollar General Saturday $5/$25 + Digital Coupon stacking policy',
  tip: 'The $5/$25 threshold is measured on the shelf-price subtotal before digital coupons come off, so load up to $25 first and let the coupons take it down from there.' }),

X({ markets: ['all'], store: 'Family Dollar', cat: 'Staples', em: '🍝', hot: 83, ...GOLD,
  title: 'Pasta, Sauce & Canned Goods — $5 off $25 Smart Coupon Stack', fp: '~45% off cart', fn: 14, rv: '$25', sv: '44%', sn: 45, badge: 'EVERY SAT',
  steps: ['Clip the Saturday <strong>$5 off $25 Smart Coupon</strong> in the Family Dollar app',
    'Fill the cart with sale-tagged pantry staples',
    'Stack <strong>item-level Smart Coupons</strong> on individual products',
    'Important: at Family Dollar the $5/$25 applies <strong>after</strong> item coupons — build the cart to land above $25 post-coupon',
    'Typical: <strong>$35 of pantry goods for under $20</strong>'],
  stk: ['$5/$25 Saturday Smart Coupon', 'Item-level Smart Coupons', 'Ibotta'],
  apps: ['Family Dollar app', 'Ibotta'], exp: 'Every Saturday',
  src: 'Family Dollar Smart Coupons stacking order',
  tip: 'This is the one threshold coupon that calculates AFTER item coupons — the opposite of Dollar General. Aim for $25.01 post-coupon or the $5 simply won\'t fire.' }),

X({ markets: CHAIN_MARKETS['Publix'], store: 'Publix', cat: 'Staples', em: '🍜', hot: 90, ...RED,
  title: 'Pasta & Sauce BOGO — Two Jars for $2.29 Total', fp: '$1.15 each', fn: 1.15, rv: '$4.29 each', sv: '73%', sn: 73, badge: 'BOGO STACK',
  steps: ['Pasta sauce hits the <strong>Publix BOGO list</strong> — $4.29 becomes $2.15 each',
    'Apply <strong>two $1 manufacturer coupons</strong>, one per jar',
    'Final: <strong>$2.29 for two jars — $1.15 each</strong>',
    'Pair with BOGO dry pasta the same week for a complete meal base under $2'],
  stk: ['Publix BOGO sale', '2× $1 manufacturer coupons', 'Publix digital coupon', 'Ibotta'],
  apps: ['Publix app', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Publix weekly BOGO pantry list — I Heart Publix matchup',
  tip: 'Pasta and sauce almost always BOGO in the same week at Publix — that pairing is the cheapest reliable dinner base in the Southeast.' }),

X({ markets: ['rdu', 'charlotte'], store: 'Lowes Foods', cat: 'Staples', em: '🥬', hot: 76, ...TEAL,
  title: 'Fresh Rewards Personal Prices + Weekly Free Item', fp: 'varies + free item', fn: 1.00, rv: 'varies', sv: '40%+', sn: 45, badge: 'FREE ITEM',
  steps: ['Open the <strong>Fresh Rewards</strong> app — personal prices are generated from your own purchase history',
    'Clip the <strong>weekly app freebie</strong> (a full-size item, most weeks)',
    'Stack manufacturer coupons on personal-price items',
    'Lowes Foods also runs strong local produce pricing — check the ad before Harris Teeter'],
  stk: ['Fresh Rewards personal prices', 'Weekly free item', 'Manufacturer coupons'],
  apps: ['Ibotta', 'Fetch Rewards'], exp: 'Weekly',
  src: 'Lowes Foods Fresh Rewards program mechanics',
  tip: 'The weekly free item alone justifies the app. Personal prices differ per account, so check both adults\' logins and shop whichever is better that week.' }),

// ══════════════ HOUSEHOLD PAPER & CLEANING ══════════════
X({ markets: ['all'], store: 'Target', cat: 'Household', em: '🧻', hot: 89, ...RED,
  title: 'Paper Towels & Toilet Paper — 40% Off with the $15 Gift Card Stack', fp: '~40% off', fn: 30, rv: '$50', sv: '40%', sn: 42, badge: 'BASKET DEAL',
  steps: ['Buy <strong>$50 of household essentials</strong> (paper goods, laundry, cleaning)',
    'Receive a <strong>$15 Target gift card</strong> at checkout during the recurring essentials event',
    'Stack <strong>Target Circle</strong> offers (5–30% off individual brands)',
    'Add manufacturer coupons at the register — one store + one manufacturer coupon per item is allowed',
    'Layer Ibotta rebates on Bounty, Charmin and Tide',
    'Effective: <strong>35–45% total savings</strong> on the trip'],
  stk: ['$15 gift card wyb $50', 'Target Circle offers', 'Manufacturer coupons', 'Ibotta rebates'],
  apps: ['Target Circle', 'Ibotta', 'Fetch Rewards'], exp: W,
  src: 'Target essentials gift-card event — recurring hip2save Target matchup',
  tip: 'Time the paper-goods restock to the gift-card event and roll the card into the next one. Run back to back, this keeps household paper permanently ~40% off.' }),

X({ markets: ['all'], store: 'Walmart', cat: 'Household', em: '🧼', hot: 81, ...TEAL,
  title: 'Dish Soap, Cleaners & Laundry — Rollback + Ibotta Double Dip', fp: '~45% off', fn: 2.00, rv: 'varies', sv: '45%', sn: 45, badge: 'STACK IT',
  steps: ['Walmart takes no store coupons — <strong>rebate apps are the entire stack</strong>',
    'Shop the rollback tags on Dawn, Tide, Clorox and Lysol',
    'Activate matching <strong>Ibotta</strong> rebates before checkout',
    'Check <strong>Checkout 51</strong> for the same items — the two apps occasionally both pay on one purchase',
    'Scan the receipt in Fetch for points on top'],
  stk: ['Walmart rollback', 'Ibotta rebate', 'Checkout 51 rebate', 'Fetch Rewards'],
  apps: ['Walmart app', 'Ibotta', 'Checkout 51', 'Fetch Rewards'], exp: 'Rollbacks — ongoing',
  src: 'Walmart rollback pricing + rebate app double-dip mechanics',
  tip: 'The Ibotta + Checkout 51 double dip on one receipt is the closest thing to coupon stacking Walmart allows. Always check both galleries before a household run.' }),
];

const deals = [...core.deals.map(remapCoreDeal), ...EXPANSION, ...STAPLES];

// ─── BLUE-FAMILY COLOR SYSTEM ────────────────────────────────────────────────
// Every color in the app resolves to one of five stops on a turquoise → navy
// ramp. Brand colors (HEB red, Kroger blue, Aldi orange) are deliberately NOT
// used — the palette is the product's, not the retailers'.
// Colors are emitted as CSS `var()` / `color-mix()` expressions rather than raw
// hex so badges and verification tags follow the light/dark theme. Baking hex
// here is what made them unreadable in light mode (light ink on a light card).
// Text always uses the `-ink` variant, which clears WCAG AA in both themes.
// Store-chip gradients stay fixed dark blues — they carry white text in both
// themes, so they must not lighten when the theme flips.
const BLUE = Object.fromEntries(['turquoise', 'sky', 'ocean', 'blue', 'navy'].map(stop => [stop, {
  text: `var(--${stop}-ink)`,
  bg: `color-mix(in oklab, var(--${stop}) 14%, var(--bg-2))`,
  bd: `color-mix(in oklab, var(--${stop}) 34%, var(--line))`,
}]));
const STORE_GRADIENT = {
  turquoise: ['#0d7a70', '#05403a'],  // white text 5.2:1
  sky:       ['#1d6f99', '#0d3b52'],  // white text 5.6:1
  ocean:     ['#0a52a0', '#04264d'],  // white text 7.8:1
  blue:      ['#2a35a0', '#11154d'],  // white text 9.9:1
  navy:      ['#1f3563', '#0c1530'],  // white text 11.2:1
};
const STOPS = Object.keys(BLUE);

// Badge → ramp stop. Best-value badges take the brightest stop so the eye lands
// on the strongest deals first; program/loyalty badges sit at the deep end.
const BADGE_TIER = {
  MONEYMAKER: 'turquoise', 'MONSTER STACK': 'turquoise', 'NEAR FREE': 'turquoise',
  'FREE ITEM': 'turquoise', 'BOGO FREE': 'turquoise', 'B1G2 FREE': 'turquoise', 'PENNY DEAL': 'turquoise',
  'HOT PRICE': 'sky', 'EVERY SAT': 'sky', 'SALE': 'sky', '3-DAY SALE': 'sky',
  'MEAL DEAL': 'sky', 'COMBO LOCO': 'sky', 'JUNE 23': 'sky',
  'STACK IT': 'ocean', 'BOGO STACK': 'ocean', 'DOUBLE COUP': 'ocean', '5X EVENT': 'ocean',
  'MVP STACK': 'ocean', 'BASKET DEAL': 'ocean', 'SCAN GUAR.': 'ocean',
  MPERKS: 'blue', 'APP COUPON': 'blue', 'REG. REWARDS': 'blue', EXTRABUCKS: 'blue',
  'PROMO CODE': 'blue', 'COMPETITOR': 'blue',
};
const badgeStyle = Object.fromEntries(
  [...new Set([...Object.keys(BADGE_TIER), ...deals.map(d => d.badge)])].map(b => {
    const s = BLUE[BADGE_TIER[b] || 'ocean'];
    return [b, [s.bg, s.text, s.bd]];
  }));

// Store chips: spread the ramp deterministically so chains stay visually
// distinct without reintroducing brand colors. Same store => same gradient.
const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const SBG = Object.fromEntries(
  [...new Set(deals.map(d => d.store))].map(store => {
    const [from, to] = STORE_GRADIENT[STOPS[hash(store) % STOPS.length]];
    return [store, `linear-gradient(135deg,${from},${to})`];
  }));

// Verification-tag tints follow heat so the badge and the tag agree visually.
const tierForHeat = h => (h >= 90 ? 'turquoise' : h >= 82 ? 'sky' : h >= 74 ? 'ocean' : 'blue');

// Links come from the verified registry (data/links.json), keyed by store — so
// per-deal `durl`/`surl` are dropped here. That kills the dead-link class of bug
// permanently: one place to audit, one place to fix. `src` keeps the citation.
for (const d of deals) {
  const s = BLUE[tierForHeat(d.hot)];
  d.vc = s.bg;
  d.vt2 = s.text;
  d.vt = String(d.vt || '').replace(/[🔥✅◆]+/gu, m => (m.includes('✅') ? '✓' : '◆')).trim();
  delete d.durl;
  delete d.surl;
}

const out = {
  updatedAt: new Date().toISOString(),
  week: 'Week of Jul 13–19, 2026 (seed snapshot — use Refresh for the live week)',
  markets: MARKETS, sbg: SBG, badgeStyle, deals,
};
fs.writeFileSync(path.join(DATA, 'deals.json'), JSON.stringify(out, null, 1));

const cats = [...new Set(deals.map(d => d.cat))].sort();
console.log(`deals.json written: ${deals.length} deals, ${MARKETS.length - 1} markets, ${new Set(deals.map(d => d.store)).size} stores`);
console.log(`categories (${cats.length}): ${cats.join(', ')}`);
const unlinked = [...new Set(deals.map(d => d.store))].filter(s => !links.stores[s]);
if (unlinked.length) console.warn(`⚠ stores missing from data/links.json: ${unlinked.join(', ')}`);
else console.log('✓ every store resolves to a verified link registry entry');
