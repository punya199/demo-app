// Pixel sprite engine, ported from the monster-arena prototype (docs/tamagotchi/prototypes/monster-arena,
// js/engine.js): palettes, and Spr, a pixel grid that monster designs draw shapes on. Baking shades
// every material with light from the top-left and outlines the silhouette automatically.

// Materials: five tones each, darkest (the outline) first. '#rrggbbaa' tones are see-through.
export const MATS: Record<string, string[]> = {
  red: ['#2a0806', '#7c1a10', '#b8321a', '#e2582a', '#ff9e66'],
  red2: ['#220606', '#5e140d', '#8a2214', '#ad3a1d', '#d4643a'],
  crim: ['#1c0306', '#560a16', '#8a1824', '#bc2e38', '#ee6c6c'],
  crim2: ['#160305', '#420812', '#66121c', '#86202a', '#a84448'],
  amber: ['#2a1604', '#8a4a0c', '#c87a18', '#eeaa2c', '#ffd87a'],
  amber2: ['#221204', '#6a380a', '#965a12', '#b8761c', '#d89a40'],
  char: ['#0a0809', '#211819', '#352829', '#4e3b3a', '#735650'],
  char2: ['#080607', '#181213', '#261d1e', '#372a2a', '#4e3b3a'],
  sun: ['#2a1e14', '#97805e', '#cdb894', '#ede0c0', '#ffffff'],
  sun2: ['#221810', '#76634a', '#a08c6c', '#bba684', '#d4c2a0'],
  rose: ['#22040f', '#661030', '#9c1e48', '#d4466a', '#ff9ab0'],
  rose2: ['#1a030c', '#4e0c24', '#741634', '#94264a', '#b84a6a'],
  belly: ['#3a1e0c', '#c0803e', '#e6ae68', '#fbd596', '#fff1cf'],
  fire: ['#5a1404', '#ff5a14', '#ff8a24', '#ffc444', '#fff3a8'],
  core: ['#7a2a04', '#ffd04a', '#ffe680', '#fff6c0', '#ffffff'],
  horn: ['#241a12', '#6e5a46', '#a88f72', '#dcc7a8', '#fff4e0'],
  gold: ['#2a1802', '#7d520a', '#c48a16', '#f2c13a', '#fff0a0'],
  ash: ['#141214', '#3a3438', '#5a5257', '#80777a', '#b0a6a6'],
  ash2: ['#100e10', '#2c272a', '#433c40', '#5a5257', '#777070'],
  coal: ['#0d0a0a', '#231d1e', '#372e2f', '#4f4344', '#706264'],
  lava: ['#1a0604', '#4a140a', '#78240f', '#a6371a', '#d65a24'],
  wing: ['#240505', '#5e100c', '#8c1d12', '#b8361b', '#e46a36'],
  shell: ['#2b1f17', '#a68b6c', '#d9c3a2', '#f2e6cc', '#ffffff'],
  sea: ['#061428', '#0f3a68', '#1b5e9e', '#3a90d2', '#a0dcff'],
  seaB: ['#13202a', '#7fa6b8', '#b8d6e2', '#e2f2f8', '#ffffff'],
  wing2: ['#1a0404', '#480c0a', '#6a160e', '#8a2414', '#b04428'],
  lava2: ['#140504', '#3a1008', '#5c1c0c', '#802c14', '#a8441e'],
  dropw: ['#06243e', '#1a72c4', '#3aa2f0', '#86d4ff', '#e8faff'],
  bub: ['#2a3e6a', '#8ac4f0', '#c4ecff', '#f0fbff', '#ffffff'],
  cobalt: ['#040e2e', '#0a2e86', '#1452c8', '#3c86f0', '#9ccaff'],
  cobalt2: ['#030a22', '#08246a', '#0e3c9a', '#2464c4', '#6aa0e8'],
  pearl: ['#1e2a3a', '#a8bcd0', '#dce8f4', '#f6fbff', '#ffffff'],
  jellyv: ['#2a0636', '#8a1aa8', '#c444dc', '#f080f4', '#ffd8ff'],
  jglow: ['#4a1050', '#ff7ae0', '#ffb0f0', '#ffe0fa', '#ffffff'],
  jtent: ['#3a0a48cc', '#a040c0cc', '#d070e8cc', '#f0a8f8cc', '#ffe0ffcc'],
  sharktop: ['#050c1e', '#0e2448', '#1a3a6e', '#2e5a9a', '#6a96d0'],
  slate2: ['#0a1220', '#22384e', '#34566e', '#4e7a94', '#8ab4cc'],
  armor: ['#0c1014', '#323c46', '#4e5a66', '#7a8894', '#b8c4ce'],
  octov: ['#06201c', '#0e5a50', '#18887a', '#3ab8a4', '#9cf0dc'],
  octov2: ['#041814', '#0a443c', '#126a60', '#22907e', '#6ccab6'],
  octopink: ['#2a0a18', '#a03a68', '#e06a98', '#ffa0c4', '#ffe0ec'],
  abyss2: ['#04061a', '#141a50', '#1e2a7a', '#3044a8', '#6a84e0'],
  magglow: ['#3a0a3a', '#ff4ad8', '#ff8ae8', '#ffc8f4', '#ffffff'],
  finglass: ['#1a3a6a99', '#3a7ad0aa', '#6ab0f0aa', '#a8dcffaa', '#e8f8ffaa'],
  royalv: ['#160a38', '#3c228a', '#5a3ac4', '#8a6aec', '#d4c4ff'],
  royalv2: ['#10082a', '#2e1a6a', '#46309a', '#6a54c4', '#a094e4'],
  levi: ['#021616', '#06504a', '#0a7e72', '#22b29e', '#8af0dc'],
  levi2: ['#011010', '#043c38', '#076058', '#148a7a', '#4ec8b4'],
  narw: ['#0a1028', '#1e3466', '#2e5096', '#4a78c4', '#a8c8f0'],
  narw2: ['#080c20', '#182a54', '#24407a', '#3a62a2', '#7aa0d4'],
  brute: ['#0a1618', '#264448', '#3a666a', '#5a8e90', '#a6cccc'],
  brute2: ['#081214', '#1e3638', '#2e5254', '#467072', '#7ea4a4'],
  deepv: ['#120c30', '#2a2272', '#3e34a6', '#5c54d4', '#a8a4f4'],
  serp: ['#03141a', '#0a3a48', '#11606e', '#2a909a', '#86dce0'],
  serp2: ['#020e12', '#072a34', '#0c4652', '#1a6a76', '#54a8b0'],
  serpb: ['#2a1c06', '#9a6a12', '#d49a28', '#f4c85a', '#fff0b0'],
  maw: ['#2a0408', '#5a0a1a', '#8a1a2a', '#b83040', '#e86a7a'],
  armorice: ['#0c1220', '#2e3a56', '#46587c', '#6a80a8', '#b4c4e0'],
  deepv2: ['#0e0a26', '#221c5c', '#322a86', '#4a42ae', '#827ed4'],
  ice: ['#0a3a5a', '#5ad8ff', '#a8f0ff', '#e0fcff', '#ffffff'],
  shellb: ['#1a2630', '#8ab0c0', '#c4dce6', '#e8f4f8', '#ffffff'],
  aqua: ['#0a2a40', '#2a7ab8', '#4aa6e0', '#8ad4ff', '#e0f6ff'],
  bubble: ['#1a3a50', '#7ac0e0', '#b0e4f8', '#e0f8ff', '#ffffff'],
  foam: ['#2a5a78', '#c8eeff', '#e8f8ff', '#ffffff', '#ffffff'],
  navy: ['#06122a', '#123a6e', '#1e5aa0', '#3a84cc', '#8ec4f0'],
  seab2: ['#18263a', '#8aa6c4', '#bcd4ea', '#e4f0fa', '#ffffff'],
  jelly: ['#2a0a30', '#8a3a9a', '#c46ad0', '#eaa0f0', '#ffe0ff'],
  jelly2: ['#220826', '#6a2a7a', '#9a4aa8', '#c47ad0', '#e8b0f0'],
  slate: ['#0c1620', '#2a4458', '#3e6680', '#5e8ca8', '#a8cce0'],
  steel: ['#0e1418', '#3a4a56', '#5e7280', '#8aa0ae', '#c8d8e0'],
  octo: ['#0a1e1a', '#1e5a4e', '#2e8a74', '#52b89a', '#a8ecd4'],
  octo2: ['#081814', '#164a40', '#226e5e', '#3a9480', '#7ccab4'],
  abyss: ['#080a20', '#1e2470', '#2e3aa8', '#4a62d8', '#9ab0ff'],
  glowfin: ['#06203a', '#1aa6d8', '#4ad4ff', '#a8f0ff', '#ffffff'],
  royal: ['#140c30', '#3a2a7a', '#5a46b0', '#8a74dc', '#d0c4ff'],
  royal2: ['#100a26', '#2e2262', '#46388c', '#6a58b4', '#a294dc'],
  coral: ['#2a0a14', '#a03a5a', '#e0607e', '#ff9ab0', '#ffe0ea'],
  teal: ['#041a1a', '#0e5a5a', '#168a86', '#34bab0', '#a0f0e4'],
  teal2: ['#031414', '#0a4444', '#106a68', '#228e88', '#60c8bc'],
  tshell: ['#121a0c', '#3a4a1c', '#5a6e2a', '#82964a', '#b8c87e'],
  tshell2: ['#0e1408', '#2c3a14', '#44561e', '#5e7430', '#8aa058'],
  tbelly: ['#2a2410', '#a8985a', '#d4c47e', '#ece0a8', '#fff8d8'],
  tskin: ['#0c1a1c', '#2a4a50', '#3e6a72', '#5e929a', '#a0ccd2'],
  tskin2: ['#0a1416', '#203a40', '#30545c', '#46747c', '#7ca8ae'],
  rock: ['#121014', '#3a3438', '#565054', '#7a7276', '#a8a0a2'],
  fin: ['#061428', '#0c2f58', '#164a84', '#2470b4', '#6ab4ea'],
  bone: ['#2a2620', '#9a9080', '#d6ccbb', '#f4ede0', '#ffffff'],
  // leaf line
  eggl: ['#1a2a12', '#9ab47a', '#c8dca4', '#e8f4cc', '#ffffff'],
  leafg: ['#06200c', '#16601e', '#26942e', '#4cc44a', '#b0f490'],
  leafg2: ['#041a0a', '#0e4418', '#186a24', '#2c8e34', '#68c060'],
  bud: ['#10260a', '#4a8a1e', '#78b82c', '#a8de4a', '#e4ffa0'],
  budl: ['#1e2a0a', '#a8c86a', '#d0e89a', '#ecf8c8', '#ffffff'],
  vine: ['#081a08', '#1e4a1a', '#2e6a24', '#4a9234', '#90cc6a'],
  moss: ['#0c1a08', '#2e4a14', '#4a6e1e', '#6e9a2c', '#b0d070'],
  bark: ['#140c06', '#3e2614', '#5e3c1e', '#86582e', '#b88a5a'],
  bark2: ['#100a04', '#2e1c0e', '#462c16', '#624020', '#8a6440'],
  wood: ['#2a1a0c', '#9a7444', '#c49a62', '#e2c08a', '#fff0c8'],
  acorn: ['#1e1004', '#7a4a14', '#a8701e', '#d49a3a', '#f8d488'],
  fawn: ['#1e0e04', '#6a3a14', '#9a5a22', '#c88438', '#f0c078'],
  fawn2: ['#180a04', '#4e2a0e', '#704018', '#925826', '#b88048'],
  deer: ['#1a0804', '#6a2a10', '#9a4218', '#c4602a', '#f09a5a'],
  deer2: ['#140604', '#4e1e0a', '#702e12', '#924018', '#b86638'],
  cream: ['#2a2010', '#a8946a', '#d8c49a', '#f2e6c4', '#ffffff'],
  petal: ['#2a0a1a', '#a83a6a', '#e06a9a', '#ff9ac0', '#ffe0ee'],
  blossom: ['#2a0a1a', '#c04a7a', '#ec7aa6', '#ffb0cc', '#fff0f6'],
  mcap: ['#2a0606', '#8a1a1a', '#c4302a', '#e8604a', '#ffb0a0'],
  mbody: ['#2a1c10', '#9a7a5a', '#c4a47e', '#e4cca4', '#fff4dc'],
  mbody2: ['#22160c', '#7a5e42', '#9a7e5e', '#b89c78', '#d8c0a0'],
  wolf: ['#0c1410', '#2e4038', '#46604e', '#6a8a72', '#b0ccb4'],
  wolf2: ['#0a100c', '#22302a', '#344a3c', '#4e6a56', '#7e9a84'],
  wolfb: ['#1a1e18', '#8a9a84', '#b8c8b0', '#dce8d4', '#ffffff'],
  wolfd: ['#0a0c0a', '#2a2c24', '#40423a', '#5c5e52', '#8e9282'],
  wolfd2: ['#080a08', '#1e2018', '#2e3028', '#44463c', '#6a6c5e'],
  jade: ['#04140e', '#0e4a36', '#1a7458', '#34a07c', '#9ae4c4'],
  jade2: ['#03100a', '#0a3828', '#125440', '#227458', '#5aa88a'],
  canopy: ['#061c0a', '#1a5a1e', '#2a8a2a', '#52b83e', '#bcec7a'],
  wolfk: ['#06080e', '#1a2030', '#2a3448', '#445272', '#8a9cc0'],
  wolfk2: ['#05060a', '#141826', '#202838', '#323e58', '#5a6a8c'],
  wolfm: ['#0e1218', '#3a4656', '#5a6a80', '#8496ae', '#c8d4e4'],
  // earth line
  stone: ['#141210', '#4a4238', '#6e6456', '#968a78', '#c8bca6'],
  stone2: ['#100e0c', '#3a342c', '#544c42', '#706658', '#9a8e7c'],
  sand: ['#2a1e10', '#9a7a4a', '#c4a06a', '#e2c492', '#fff0cc'],
  clay: ['#2a1008', '#8a3e22', '#b85a34', '#d8804e', '#f4b48a'],
  tort: ['#1a140c', '#5a4a30', '#7e6a46', '#a68e62', '#d4c096'],
  tort2: ['#140f08', '#46381f', '#5e4c30', '#7c6844', '#a6906a'],
  shellE: ['#1e1206', '#6a4214', '#94602a', '#bc8440', '#e8b878'],
  ore: ['#0c0e12', '#343a46', '#566070', '#8490a4', '#d0daea'],
  rhino: ['#121010', '#3e3632', '#5e5450', '#857a74', '#bcb2aa'],
  rhino2: ['#0e0c0c', '#2e2826', '#463e3a', '#625854', '#8a807a'],
  worm: ['#2a0e10', '#8a4a4a', '#b8706a', '#dc9a8e', '#ffd0c4'],
  snow: ['#2a3440', '#a8b8c8', '#d4e0ec', '#f0f6fc', '#ffffff'],
  topaz: ['#5a2a04', '#ffa02a', '#ffc45a', '#ffe4a0', '#ffffff'],
  basalt: ['#0a0a0c', '#26262a', '#3a3a40', '#4e4e56', '#74747e'],
  basalt2: ['#08080a', '#1c1c20', '#2c2c32', '#3c3c44', '#5a5a64'],
  amberB: ['#2a1206', '#8a4a1c', '#b86a2e', '#dc9050', '#f8c08a'],
  amberB2: ['#221004', '#6a3814', '#8e5222', '#ae6c36', '#d09060'],
  maskb: ['#2a2014', '#a8906a', '#d4bc92', '#efdcb8', '#fff4e0'],
  // lightning line
  volt: ['#5a4a04', '#ffd23a', '#ffe14a', '#fff07a', '#fffac0'],
  vcore: ['#7a6a10', '#fff07a', '#fffac0', '#ffffff', '#ffffff'],
  cloudw: ['#2a3040', '#a8b4cc', '#d4dcec', '#eef2fa', '#ffffff'],
  stormc: ['#141824', '#3e4660', '#5a6488', '#8a94b8', '#c8d0ec'],
  storm2: ['#0e111a', '#2c3248', '#40486a', '#5e688e', '#8e98bc'],
  tbird: ['#060c22', '#14306e', '#1e4aa0', '#3a72d4', '#9cc4ff'],
  wingb: ['#0a1840', '#1e4aa0', '#2e64c4', '#4a86e4', '#a8ccff'],
  tbird2: ['#050a1a', '#102454', '#18387a', '#2a56a6', '#6a94d8'],
  cat: ['#2a2210', '#b09a4a', '#e0c870', '#f8e8a8', '#fffbe0'],
  cat2: ['#221a0c', '#8e7a38', '#b8a052', '#d8c47e', '#f0e4b4'],
  navyT: ['#0a0c1a', '#24284e', '#363c72', '#50589e', '#9aa2e0'],
  navyT2: ['#08091a', '#1c1f3e', '#2a2e5a', '#3c427c', '#6a72b4'],
  hawk: ['#100e1e', '#3a3466', '#56509a', '#7e78c8', '#c4c0f4'],
  hawk2: ['#0c0a18', '#2c2850', '#423c78', '#5e58a0', '#8e88d0'],
  leo: ['#1a1a24', '#7a84a8', '#aab4d4', '#d4dcf0', '#ffffff'],
  leo2: ['#14141c', '#5e6688', '#8890b4', '#aab2d4', '#d4dcf0'],
  tigw: ['#1a1a24', '#8a92b4', '#b8c0dc', '#e0e6f6', '#ffffff'],
  tigw2: ['#14141c', '#6a7294', '#9098bc', '#b4bcdc', '#dce2f4'],
  bison: ['#0e0c10', '#2e2a36', '#463f52', '#645c74', '#9a90ac'],
  bison2: ['#0a080c', '#221e28', '#342e3e', '#4a4258', '#726a84'],
  maskb2: ['#221a10', '#86704e', '#a8946e', '#c4b08a', '#e0d0b0'],
  spirit: ['#14241c', '#7aa892', '#b0d8c2', '#dcf4e6', '#ffffff'],
  spirit2: ['#101c16', '#5e8a76', '#88b49e', '#acd2bc', '#d8f0e2'],
  antler: ['#1e140a', '#6e5236', '#9a7a52', '#c8a87a', '#f4e0b8'],
  antlerg: ['#2a1a04', '#8a6a24', '#b8943a', '#e0c060', '#fff0b0'],
  bear: ['#120a06', '#3a2414', '#563820', '#7a5230', '#a8805a'],
  bear2: ['#0e0804', '#2c1a0e', '#422a16', '#5c3c22', '#82603e'],
  sap: ['#0a3a10', '#6aff6a', '#a8ffa0', '#e0ffd8', '#ffffff'],
  bloom: ['#5a4a04', '#ffd84a', '#ffe88a', '#fff6c8', '#ffffff'],
  // holy line
  ivory: ['#2a2620', '#b4aa94', '#ddd4c0', '#f4eee0', '#ffffff'],
  ivory2: ['#201c18', '#8e8676', '#b4ab98', '#d0c8b6', '#ece6d6'],
  fleece: ['#2a2420', '#c4b8a8', '#e8e0d4', '#faf6ee', '#ffffff'],
  halo: ['#6a4a04', '#ffd84a', '#ffe88a', '#fff6c8', '#ffffff'],
  hlight: ['#7a6a30', '#fff0b0', '#fff8dc', '#ffffff', '#ffffff'],
  sky: ['#0e1a2a', '#5a86b4', '#8ab4e0', '#bcdcf8', '#ffffff'],
  feath: ['#1e2230', '#a0aac4', '#d0d8ec', '#eef2fc', '#ffffff'],
  feath2: ['#181a26', '#7e88a4', '#a8b2cc', '#c8d0e6', '#e4eaf8'],
  lionb: ['#2a2014', '#b89a6c', '#e0c89c', '#f4e6c4', '#fffaf0'],
  lionb2: ['#201810', '#94784e', '#b89c70', '#d4bc90', '#ecdcb8'],
  mane: ['#2a1a04', '#a8741c', '#d8a838', '#f4d070', '#fff0b8'],
  bronze: ['#1a1006', '#6a4a1c', '#9a7030', '#c89a48', '#f0cc80'],
  bronze2: ['#140c04', '#523814', '#7a5822', '#9e7838', '#c8a060'],
  crabp: ['#2a0e12', '#a04a5a', '#d07a88', '#f0aab4', '#ffe0e4'],
  elew: ['#1e1c22', '#8e8a98', '#bcb8c6', '#e2deea', '#ffffff'],
  elew2: ['#18161c', '#6e6a78', '#9a96a6', '#bcb8c8', '#dcd8e6'],
  // dark line
  night: ['#0a0612', '#2a1a40', '#3e2a5e', '#5a4282', '#9a84c4'],
  night2: ['#08050e', '#1e1430', '#2e2046', '#423262', '#6e5c96'],
  moon: ['#2a2a20', '#c8c4a4', '#e8e4c8', '#f8f6e8', '#ffffff'],
  bat: ['#0e080e', '#2e1c2c', '#46283e', '#623a56', '#9a6a88'],
  bat2: ['#0a060a', '#22141e', '#341e2e', '#4a2a40', '#704a64'],
  batw: ['#12060e', '#3a1426', '#521e36', '#702a4a', '#a85476'],
  batw2: ['#0e050a', '#2c101e', '#40182a', '#58203a', '#84405c'],
  curse: ['#3a0a4a', '#a04ae8', '#c47aff', '#e4b8ff', '#ffffff'],
  spid: ['#08060c', '#1e1828', '#2e2440', '#463a60', '#7a6aa0'],
  spid2: ['#06040a', '#16121e', '#221c30', '#342a48', '#5a4e78'],
  blood: ['#2a0206', '#8a0a18', '#c41624', '#ec3a44', '#ff9a9a'],
  ratg: ['#141010', '#4a3e3a', '#6a5a54', '#8e7c74', '#c4b0a4'],
  ratg2: ['#100c0c', '#3a302c', '#52463f', '#6e5e56', '#988478'],
  ratt: ['#2a0e12', '#9a5a62', '#c8848c', '#e8aab0', '#ffd8dc'],
  rotg: ['#0e140c', '#3a4a32', '#566a48', '#7a9064', '#b4c8a0'],
  rotg2: ['#0a1008', '#2c3a26', '#425236', '#5c704a', '#8aa074'],
  starsky: ['#04040e', '#0c1030', '#141a4a', '#22306e', '#4a5aa8'],
  eclipse: ['#5a2004', '#ff7a1a', '#ffb02a', '#ffd87a', '#fff6c8'],
  void: ['#000000', '#05030a', '#0a0612', '#100a1a', '#1a1226'],
  owl: ['#0a0810', '#26203a', '#3a3254', '#565076', '#9a92bc'],
  owl2: ['#08060c', '#1c182c', '#2a2440', '#3e385c', '#6a6490'],
  owlb: ['#141018', '#4a4258', '#6a6280', '#8e86a6', '#c4bed8'],
  owlb2: ['#100c14', '#3a3446', '#524a64', '#6e6684', '#9a92b0'],
  soul: ['#1a0a2acc', '#5a3ea8cc', '#8a72d8cc', '#bcaaf4d8', '#f0e8ffe6'],
  soul2: ['#14081ecc', '#3e2a80b0', '#6650b4b0', '#8a76d8b8', '#bcaaf4c8'],
  soulm: ['#1a0a2acc', '#6a4eb8cc', '#9a84e4d0', '#c8b8f8dc', '#f0e8ffea'],
  soulc: ['#3a2a70', '#b8a4ff', '#dcd0ff', '#f4eeff', '#ffffff'],
  // shadow line
  // shadow line (hooded wraiths, horned demons and the undead): slate purple with violet glow
  shd: ['#0a0814', '#221e36', '#363050', '#4e4670', '#8278a8'],
  shd2: ['#070510', '#161226', '#241f3a', '#362f54', '#5a5280'],
  shdl: ['#161222', '#4a4268', '#6e6490', '#9c92c0', '#d4ccec'],
  shdw: ['#0a0814cc', '#221e36cc', '#363050cc', '#5a5290d4', '#a8a0d8e0'],
  ghost: ['#2a2650c4', '#6a6498cc', '#9a94c8d4', '#c8c4e8e0', '#f4f0ffec'],
  mist: ['#2a2a56b0', '#5a5a94b8', '#8a8ac0c0', '#b8b8e0c8', '#f0eefcd4'],
  dem: ['#0e0c18', '#3a3654', '#5a5676', '#7e7a9c', '#aaa6c4'],
  dem2: ['#0a0812', '#2a2640', '#403c5a', '#5a5678', '#7e7a9c'],
  vio: ['#2a0a4a', '#7a2ad0', '#a04aff', '#d08aff', '#f0d8ff'],
  vwing: ['#1e0a2a', '#6a2a88', '#9a46b8', '#c070dc', '#e8b0f4'],
  vwing2: ['#160820', '#4e1e68', '#783498', '#9c52bc', '#c888e0'],
  crys: ['#3a0a5a', '#9a3ae0', '#c470ff', '#e8a8ff', '#ffffff'],
  wr: ['#0c0a16', '#35304a', '#55506c', '#77728e', '#a6a2bc'],
  wr2: ['#08060f', '#25213a', '#3a3552', '#524c6c', '#76708e'],
  bone2: ['#1e1a22', '#7a7080', '#a89eb0', '#cfc6d6', '#f4eef8'],
  vten: ['#14082a', '#3e1e70', '#5e2ea0', '#8448cc', '#b07ae8'],
  iron: ['#0e0c16', '#3a3850', '#5e5c78', '#8a88a4', '#c4c2d8'],
  shield: ['#0e0c16', '#3e3850', '#5c5470', '#7e7694', '#aaa2c0'],
  cloak: ['#0e0a1a', '#3a2e58', '#584878', '#7a6a9c', '#a898c8'],
  cloak2: ['#0a0714', '#2a2044', '#40345e', '#5a4c7c', '#7e70a0'],
  skul: ['#221e22', '#7e7480', '#b0a6a8', '#d4ccc6', '#f2ece6'],
  arm: ['#0a0a12', '#2a2a3c', '#44445c', '#646482', '#a0a0c0'],
  arm2: ['#08080e', '#1e1e2c', '#323246', '#4a4a64', '#70708e'],
  cape: ['#12081e', '#36204e', '#4e3270', '#6a4a92', '#9a7ac0'],
}
// Emissive materials: never shaded darker than the middle tone.
export const GLOW = new Set<string>([
  'fire',
  'core',
  'glowfin',
  'foam',
  'jglow',
  'magglow',
  'ice',
  'sap',
  'bloom',
  'topaz',
  'volt',
  'vcore',
  'halo',
  'hlight',
  'curse',
  'eclipse',
  'soulc',
  'vio',
  'crys',
])

export type Rgba = [number, number, number, number]

export const hexRgb = (h: string): Rgba => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
  h.length > 7 ? parseInt(h.slice(7, 9), 16) : 255,
]
export const MAT_RGB: Record<string, Rgba[]> = Object.fromEntries(
  Object.entries(MATS).map(([k, v]) => [k, v.map(hexRgb)])
)

// A point [x, y] on the sprite grid.
export type Pt = number[]

export function inPoly(x: number, y: number, pts: Pt[]) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i],
      [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// A hand-made bitmap: palette + rows of letters ('a' = first colour, '.' = empty).
export interface IBitmap {
  pal: string[]
  rows: string[]
}

// A material key, or 0 to erase.
export type Mat = string | 0

export type EyeKind = 'cute' | 'fierce' | 'big' | 'sleepy' | 'glow'

// The baked pixels of one frame: RGBA rows, and the lowest painted row (the ground line).
export interface ISprPixels {
  w: number
  h: number
  data: Uint8ClampedArray
  foot: number
}

// One baked frame: the picture, a white silhouette (hit flash) and the ground line.
export interface ISprFrame {
  cv: HTMLCanvasElement
  white: HTMLCanvasElement
  w: number
  h: number
  foot: number
}

export class Spr {
  w: number
  h: number
  m: Mat[]
  det: [number, number, string][]
  pix: [number, number, string][]
  constructor(w: number, h: number) {
    this.w = w
    this.h = h
    this.m = new Array<Mat>(w * h).fill(0)
    this.det = []
    this.pix = []
  }
  set(x: number, y: number, k: Mat) {
    if (x < 1 || y < 1 || x > this.w - 2 || y > this.h - 2) return
    this.m[y * this.w + x] = k
  }
  E(cx: number, cy: number, rx: number, ry: number, k: Mat) {
    rx = Math.max(0.7, rx)
    ry = Math.max(0.7, ry)
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
      for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        const dx = (x + 0.5 - cx) / rx,
          dy = (y + 0.5 - cy) / ry
        if (dx * dx + dy * dy <= 1) this.set(x, y, k)
      }
    return this
  }
  P(pts: Pt[], k: Mat) {
    let x0 = 1e9,
      x1 = -1e9,
      y0 = 1e9,
      y1 = -1e9
    for (const [x, y] of pts) {
      x0 = Math.min(x0, x)
      x1 = Math.max(x1, x)
      y0 = Math.min(y0, y)
      y1 = Math.max(y1, y)
    }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
      for (let x = Math.floor(x0); x <= Math.ceil(x1); x++)
        if (inPoly(x + 0.5, y + 0.5, pts)) this.set(x, y, k)
    return this
  }
  L(x0: number, y0: number, x1: number, y1: number, r0: number, k: Mat, r1 = r0) {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2) + 1
    for (let i = 0; i <= n; i++) {
      const t = i / n
      const r = r0 + (r1 - r0) * t
      this.E(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, r, k)
    }
    return this
  }
  spike(x: number, y: number, h: number, w: number, k: Mat, lean = 0) {
    return this.P(
      [
        [x - w, y],
        [x + lean, y - h],
        [x + w, y],
      ],
      k
    )
  }
  // A detail pixel in an exact colour, drawn over the shaded body (eyes, markings).
  d(x: number, y: number, c: string) {
    this.det.push([Math.round(x), Math.round(y), c])
    return this
  }
  // A hand-made bitmap placed at (ox, oy). Unlike detail pixels these count as body: they set the
  // ground line and the white flash. shift(x, y) can move a part of it with the pose (e.g. the tail).
  bmp(b: IBitmap, ox: number, oy: number, shift?: (x: number, y: number) => Pt) {
    b.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x]
        if (ch === '.') continue
        const [dx, dy] = shift ? shift(x, y) : [0, 0]
        this.pix.push([
          Math.round(ox + x + dx),
          Math.round(oy + y + dy),
          b.pal[ch.charCodeAt(0) - 97],
        ])
      }
    })
    return this
  }
  line(pts: Pt[], c: string, c2?: string) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i],
        [bx, by] = pts[i + 1]
      const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay))
      for (let s = 0; s <= n; s++) {
        const x = Math.round(ax + ((bx - ax) * s) / n),
          y = Math.round(ay + ((by - ay) * s) / n)
        this.d(x, y, c2 && s % 3 === 1 ? c2 : c)
      }
    }
    return this
  }
  eye(x: number, y: number, kind: EyeKind = 'cute') {
    const D = '#160806'
    if (kind === 'cute') {
      this.d(x, y, '#ffffff')
        .d(x + 1, y, D)
        .d(x, y + 1, D)
        .d(x + 1, y + 1, D)
    } else if (kind === 'fierce') {
      this.d(x - 1, y - 1, D)
        .d(x, y - 1, D)
        .d(x + 1, y - 1, D)
        .d(x, y, '#ffe14a')
        .d(x + 1, y, D)
        .d(x - 1, y, '#ffe14a')
    } else if (kind === 'big') {
      const B = '#0a1430'
      this.d(x, y, '#ffffff')
        .d(x + 1, y, B)
        .d(x, y + 1, B)
        .d(x + 1, y + 1, '#ffffff')
        .d(x, y + 2, B)
        .d(x + 1, y + 2, '#4a7ac0')
        .d(x - 1, y + 1, B)
        .d(x - 1, y + 2, B)
    } else if (kind === 'sleepy') {
      this.d(x, y, D)
        .d(x + 1, y, D)
        .d(x - 1, y - 1, D)
    } else if (kind === 'glow') {
      this.d(x, y, '#fff6b0')
        .d(x + 1, y, '#fff6b0')
        .d(x - 1, y, '#ffb02a')
        .d(x + 2, y, '#ffb02a')
        .d(x, y - 1, '#ff7a1a')
        .d(x + 1, y - 1, '#ff7a1a')
    }
    return this
  }
  // Shades every material by how deep a pixel sits in its run of same-material pixels (light from
  // the top-left), outlines the silhouette in each material's darkest tone, then lays the detail
  // and bitmap pixels on top. Pure: no canvas, so it can run in tests.
  bakePixels(): ISprPixels {
    const { w, h, m } = this
    const up = new Int16Array(w * h),
      dn = new Int16Array(w * h),
      lf = new Int16Array(w * h),
      rt = new Int16Array(w * h)
    for (let x = 0; x < w; x++) {
      for (let y = 1; y < h; y++) {
        const i = y * w + x
        if (m[i] && m[i] === m[i - w]) up[i] = up[i - w] + 1
      }
      for (let y = h - 2; y >= 0; y--) {
        const i = y * w + x
        if (m[i] && m[i] === m[i + w]) dn[i] = dn[i + w] + 1
      }
    }
    for (let y = 0; y < h; y++) {
      for (let x = 1; x < w; x++) {
        const i = y * w + x
        if (m[i] && m[i] === m[i - 1]) lf[i] = lf[i - 1] + 1
      }
      for (let x = w - 2; x >= 0; x--) {
        const i = y * w + x
        if (m[i] && m[i] === m[i + 1]) rt[i] = rt[i + 1] + 1
      }
    }
    const D = new Uint8ClampedArray(w * h * 4)
    let foot = 0
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x,
          k = m[i]
        let rgb: Rgba | null = null
        if (k) {
          const t = (up[i] + 0.5) / (up[i] + dn[i] + 1),
            s = (lf[i] + 0.5) / (lf[i] + rt[i] + 1)
          let v = 2
          if (t < 0.3) v = 3
          else if (t > 0.7) v = 1
          if (t > 0.6 && t <= 0.7 && (x + y) & 1) v = 1
          if (t >= 0.24 && t < 0.3 && (x + y) & 1) v = 2
          if (s > 0.8 && v > 1) v--
          if (s < 0.25 && v < 3 && t < 0.6) v++
          if (up[i] + dn[i] >= 5 && t < 0.2 && s > 0.18 && s < 0.48) v = 4
          const r = x + 1 < w ? m[i + 1] : 0,
            d = y + 1 < h ? m[i + w] : 0
          if ((r && r !== k) || (d && d !== k)) v = Math.max(1, v - 1)
          if (GLOW.has(k)) v = Math.max(2, v)
          rgb = MAT_RGB[k][v]
          foot = Math.max(foot, y)
        } else {
          const nb = [
            x > 0 ? m[i - 1] : 0,
            x < w - 1 ? m[i + 1] : 0,
            y > 0 ? m[i - w] : 0,
            y < h - 1 ? m[i + w] : 0,
          ].find(Boolean)
          if (nb) {
            rgb = MAT_RGB[nb][0]
            foot = Math.max(foot, y)
          }
        }
        if (rgb) {
          D[i * 4] = rgb[0]
          D[i * 4 + 1] = rgb[1]
          D[i * 4 + 2] = rgb[2]
          D[i * 4 + 3] = rgb[3]
        }
      }
    for (const [x, y, c] of this.det) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue
      const i = (y * w + x) * 4,
        [r, g, b] = hexRgb(c)
      D[i] = r
      D[i + 1] = g
      D[i + 2] = b
      D[i + 3] = 255
    }
    for (const [x, y, c] of this.pix) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue
      const i = (y * w + x) * 4,
        [r, g, b] = hexRgb(c)
      D[i] = r
      D[i + 1] = g
      D[i + 2] = b
      D[i + 3] = 255
      foot = Math.max(foot, y)
    }
    return { w, h, data: D, foot }
  }
  // The baked pixels on a canvas, plus a white copy of the silhouette for the hit flash.
  bake(): ISprFrame {
    const { w, h, data, foot } = this.bakePixels()
    const cv = document.createElement('canvas')
    cv.width = w
    cv.height = h
    const cx = cv.getContext('2d')
    const white = document.createElement('canvas')
    white.width = w
    white.height = h
    const wx = white.getContext('2d')
    if (cx && wx) {
      const img = cx.createImageData(w, h)
      img.data.set(data)
      cx.putImageData(img, 0, 0)
      wx.drawImage(cv, 0, 0)
      wx.globalCompositeOperation = 'source-in'
      wx.fillStyle = '#fff'
      wx.fillRect(0, 0, w, h)
    }
    return { cv, white, w, h, foot }
  }
}
