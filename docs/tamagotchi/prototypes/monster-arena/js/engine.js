'use strict'
// Pixel sprite engine: palettes, the Spr drawing grid, shape helpers and rigs.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- Pixel sprite engine: shapes on a grid, auto shading (light from top-left), auto outline ---------- */
const MATS = {
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
const GLOW = new Set([
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
const hexRgb = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
  h.length > 7 ? parseInt(h.slice(7, 9), 16) : 255,
]
const MAT_RGB = Object.fromEntries(Object.entries(MATS).map(([k, v]) => [k, v.map(hexRgb)]))

function inPoly(x, y, pts) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i],
      [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

class Spr {
  constructor(w, h) {
    this.w = w
    this.h = h
    this.m = new Array(w * h).fill(0)
    this.det = []
    this.pix = []
  }
  set(x, y, k) {
    if (x < 1 || y < 1 || x > this.w - 2 || y > this.h - 2) return
    this.m[y * this.w + x] = k
  }
  E(cx, cy, rx, ry, k) {
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
  P(pts, k) {
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
  L(x0, y0, x1, y1, r0, k, r1 = r0) {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2) + 1
    for (let i = 0; i <= n; i++) {
      const t = i / n
      const r = r0 + (r1 - r0) * t
      this.E(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, r, k)
    }
    return this
  }
  spike(x, y, h, w, k, lean = 0) {
    return this.P(
      [
        [x - w, y],
        [x + lean, y - h],
        [x + w, y],
      ],
      k
    )
  }
  d(x, y, c) {
    this.det.push([Math.round(x), Math.round(y), c])
    return this
  }
  // A hand-made bitmap (palette + rows of letters, '.' = empty) placed at (ox, oy). Unlike detail
  // pixels these count as body: they set the ground line and the white flash. shift(x, y) can move
  // a part of it with the pose (e.g. the tail).
  bmp(b, ox, oy, shift) {
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
  line(pts, c, c2) {
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
  eye(x, y, kind = 'cute') {
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
  bake() {
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
    const cv = document.createElement('canvas')
    cv.width = w
    cv.height = h
    const cx = cv.getContext('2d')
    const img = cx.createImageData(w, h)
    const D = img.data
    let foot = 0
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x,
          k = m[i]
        let rgb = null
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
    cx.putImageData(img, 0, 0)
    const white = document.createElement('canvas')
    white.width = w
    white.height = h
    const wx = white.getContext('2d')
    wx.drawImage(cv, 0, 0)
    wx.globalCompositeOperation = 'source-in'
    wx.fillStyle = '#fff'
    wx.fillRect(0, 0, w, h)
    return { cv, white, w, h, foot }
  }
}

/* ---------- Monster designs (authored facing right). Each draw takes a pose so parts can move. ---------- */
const POSE0 = {
  fl: [0, 0],
  bl: [0, 0],
  ff: [0, 0],
  bf: [0, 0],
  arm: [0, 0],
  arm2: [0, 0],
  head: [0, 0],
  body: [0, 0],
  jaw: 0,
  tail: 0,
  wing: 0,
  glow: 0,
}
const QUAD = {
  idle: [{}, { tail: 1, wing: 0.3 }],
  walk: [
    { fl: [1.5, 0], bf: [1.5, 0], bl: [-1.5, -1.5], ff: [-1.5, -1.5] },
    { bl: [0, -0.5], ff: [0, -0.5], body: [0, -0.6], tail: -1 },
    { fl: [-1.5, -1.5], bf: [-1.5, -1.5], bl: [1.5, 0], ff: [1.5, 0] },
    { fl: [0, -0.5], bf: [0, -0.5], body: [0, -0.6], tail: 1 },
  ],
  attack: [
    { head: [-2, -1], body: [-1, 0], fl: [-1, 0], tail: 1, wing: 0.5 },
    { head: [3, 1], body: [1, 0], fl: [3, -3], jaw: 1, tail: -1, wing: -0.5 },
    { head: [1, 0], fl: [1, -1], jaw: 0.4 },
  ],
  cast: [
    { head: [-1, -1], body: [-1, 0], jaw: 0.5, wing: 1, glow: 1, tail: 1 },
    { head: [2, 0], body: [1, 0], jaw: 1, wing: -1, glow: 1, tail: -1 },
  ],
  hurt: [{ head: [-2, -1], body: [-1, 0], jaw: 0.3, wing: 0.5 }],
}
const BIPED = {
  idle: [{}, { tail: 1, wing: 0.3, arm: [0, 0.5] }],
  walk: [
    { bl: [2, 0], bf: [-2, -1.5], arm: [-1.5, 0], arm2: [1.5, 0] },
    { bf: [0, -0.5], body: [0, -0.8] },
    { bl: [-2, -1.5], bf: [2, 0], arm: [1.5, 0], arm2: [-1.5, 0] },
    { bl: [0, -0.5], body: [0, -0.8] },
  ],
  attack: [
    { head: [-2, -1], body: [-1, 0], arm: [-3, -3], tail: 1, wing: 0.5 },
    {
      head: [2, 1],
      body: [1, 0],
      arm: [5, 1],
      arm2: [2, 0],
      jaw: 1,
      bl: [1, 0],
      tail: -1,
      wing: -0.5,
    },
    { head: [1, 0], arm: [2, 0], jaw: 0.4 },
  ],
  cast: [
    {
      head: [-1, -1],
      body: [-1, 0],
      jaw: 0.5,
      wing: 1,
      arm: [-1, -3],
      arm2: [-1, -2],
      glow: 1,
      tail: 1,
    },
    {
      head: [2, 0],
      body: [1, 0],
      jaw: 1,
      wing: -1,
      arm: [3, -1],
      arm2: [2, -1],
      glow: 1,
      tail: -1,
    },
  ],
  hurt: [{ head: [-2, -1], body: [-1, 0], jaw: 0.3, wing: 0.5, arm: [-1, -1] }],
}
const SWIM = {
  attack: [
    { head: [-2, 0], body: [-2, 0], tail: 2, wing: 0.5 },
    { head: [3, 0], body: [3, 0], jaw: 1, tail: -2, wing: -0.5 },
    { head: [1, 0], body: [1, 0], jaw: 0.4 },
  ],
  cast: [
    { body: [-1, -1], head: [-1, -1], jaw: 0.4, wing: 1, glow: 1, tail: 1.5 },
    { body: [1, 0], head: [2, 0], jaw: 1, wing: -1, glow: 1, tail: -1.5 },
  ],
  hurt: [{ body: [-2, 0], head: [-2, -1], jaw: 0.3 }],
}
// Flyers move on their wings: idle is a slow flap with the body rising on each downstroke, walking flaps
// twice as fast, attack dives in with the wings swept back, cast throws the wings up.
const FLY = {
  attack: [
    { head: [-2, -2], body: [-2, -1], wing: -1, tail: 1 },
    { head: [2, 2], body: [2, 1], jaw: 1, wing: 0.9, tail: -1, fl: [2, -1], ff: [2, -1] },
    { head: [1, 0], jaw: 0.4, wing: 0.2 },
  ],
  cast: [
    { head: [-1, -2], body: [-1, -1], jaw: 0.5, wing: -1, glow: 1, tail: 1 },
    { head: [2, 0], body: [1, 0], jaw: 1, wing: 0.7, glow: 1, tail: -1 },
  ],
  hurt: [{ head: [-2, -1], body: [-2, 0], jaw: 0.3, wing: 0.5 }],
}
const BLOB = {
  idle: [{}, { body: [0, 0.5] }],
  walk: [{ body: [0, -1.5], bl: [0, -1] }, {}, { body: [0, -1.5], fl: [0, -1] }, {}],
  attack: [{ body: [-1.5, 0.5] }, { body: [3, -1], jaw: 1 }, { body: [1, 0] }],
  cast: [
    { body: [-1, 0.5], glow: 1 },
    { body: [1, -1], glow: 1, jaw: 1 },
  ],
  hurt: [{ body: [-2, 0] }],
}
function scalePose(p, k) {
  const out = { ...p }
  for (const key of ['fl', 'bl', 'ff', 'bf', 'arm', 'arm2', 'head', 'body'])
    out[key] = [p[key][0] * k, p[key][1] * k]
  out.tail = p.tail * k
  return out
}
const glowMouth = (s, x, y) =>
  s
    .d(x, y, '#fff6b0')
    .d(x + 1, y, '#ffd04a')
    .d(x, y - 1, '#ffd04a')
    .d(x, y + 1, '#ff8a24')
    .d(x - 1, y, '#ffd04a')
    .d(x + 2, y, '#ff8a24')
// A bushy tail that zigzags like a lightning bolt from (x0, y0) along relative points, tapering to a glowing tip.
function boltTail(s, x0, y0, path, r, k, sway = 0) {
  r *= 1.5
  const pts = [
    [x0, y0],
    ...path.map(([dx, dy], i) => [
      x0 + dx + ((sway * (i + 1)) / path.length) * 1.4,
      y0 + dy - ((Math.abs(sway) * (i + 1)) / path.length) * 0.4,
    ]),
  ]
  for (let i = 0; i < pts.length - 1; i++)
    s.L(
      pts[i][0],
      pts[i][1],
      pts[i + 1][0],
      pts[i + 1][1],
      r * (1 - (i / pts.length) * 0.55),
      k,
      r * (1 - ((i + 1) / pts.length) * 0.7)
    )
  const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]],
    ang = Math.atan2(b[1] - a[1], b[0] - a[0])
  s.P(
    [
      [b[0] - Math.sin(ang) * r * 0.6, b[1] + Math.cos(ang) * r * 0.6],
      [b[0] + Math.cos(ang) * r * 1.6, b[1] + Math.sin(ang) * r * 1.6],
      [b[0] + Math.sin(ang) * r * 0.6, b[1] - Math.cos(ang) * r * 0.6],
    ],
    'volt'
  )
  s.line(pts.slice(1), '#ffe14a', '#fffac0')
}
// Dragon parts shared by the lightning fused options.
// A bat wing: arm spar from the shoulder S to the wrist W, finger spars to the tips, membrane panels between them
// in two alternating shades with scalloped trailing edges, back to the body at B.
function dragonWing(s, S, W, tips, B, k1, k2, clawed) {
  const sc = (a, b) => [
    (a[0] + b[0]) / 2 + (W[0] - (a[0] + b[0]) / 2) * 0.22,
    (a[1] + b[1]) / 2 + (W[1] - (a[1] + b[1]) / 2) * 0.22,
  ]
  s.P([S, W, tips[0]], k1)
  for (let i = 0; i < tips.length - 1; i++)
    s.P([W, tips[i], sc(tips[i], tips[i + 1]), tips[i + 1]], i % 2 ? k1 : k2)
  s.P([W, tips[tips.length - 1], sc(tips[tips.length - 1], B), B, S], tips.length % 2 ? k1 : k2)
  s.L(S[0], S[1], W[0], W[1], 1.6, 'gold', 1.2)
  for (const p of tips) s.L(W[0], W[1], p[0], p[1], 0.9, 'gold', 0.5)
  s.line(
    [
      [S[0], S[1] - 1],
      [W[0], W[1] - 1],
      [tips[0][0], tips[0][1] - 1],
    ],
    '#fff4c0'
  )
  if (clawed) s.spike(W[0], W[1] + 1, 4, 1.2, 'gold', (W[0] - S[0]) * 0.1)
}
const featherWing = (s, x, y, sc, dir, lift, k, vein) => birdWing(s, x, y, sc, dir, lift, k, vein)
const claws = (s, x, y, sc = 1) => {
  for (const a of [-0.5, 0.2, 0.9])
    s.L(x, y, x + 2.6 * sc * Math.cos(a), y + 1.6 * sc * Math.sin(a) + 0.4, 0.5, 'gold')
}
// A storm dragon head at (ex, ey) facing right: branching gold horns, long snout, roaring jaw j, lightning whiskers.
function dragonHead(s, ex, ey, j) {
  s.L(ex - 2, ey - 3, ex - 9, ey - 14, 1.3, 'gold', 0.8)
  s.L(ex - 5, ey - 8, ex - 2, ey - 15, 0.9, 'gold', 0.5)
  s.L(ex - 9, ey - 14, ex - 14, ey - 16, 0.8, 'gold', 0.4)
  s.L(ex - 7, ey - 11, ex - 12, ey - 9, 0.7, 'gold', 0.4)
  s.L(ex + 2, ey - 4, ex - 1, ey - 16, 1.2, 'gold', 0.7)
  s.L(ex, ey - 11, ex + 4, ey - 16, 0.8, 'gold', 0.4)
  s.E(ex + 2, ey, 7, 5.6, 'tbird')
  s.P(
    [
      [ex + 4, ey - 4],
      [ex + 18, ey - 1.5],
      [ex + 18, ey + 2.5],
      [ex + 4, ey + 3.5],
    ],
    'tbird'
  )
  s.P(
    [
      [ex + 1, ey - 5.5],
      [ex + 11, ey - 4],
      [ex + 12, ey - 1.5],
      [ex + 2, ey - 1.5],
    ],
    'gold'
  )
  s.P(
    [
      [ex + 3, ey + 3],
      [ex + 17, ey + 3 + j],
      [ex + 14, ey + 6.5 + j],
      [ex + 4, ey + 6.5],
    ],
    'tbird2'
  )
  if (j > 1)
    s.P(
      [
        [ex + 5, ey + 3],
        [ex + 17, ey + 3],
        [ex + 14, ey + 3 + j],
        [ex + 5, ey + 4 + j * 0.6],
      ],
      'maw'
    )
  for (const x of [8, 12, 16]) s.d(ex + x, ey + 3, '#ffffff')
  if (j > 1) for (const x of [10, 14]) s.d(ex + x, ey + 2 + j, '#ffffff')
  s.d(ex + 18, ey - 1, '#060c22').d(ex + 17, ey - 1, '#060c22')
  s.line(
    [
      [ex + 16, ey + 1],
      [ex + 20, ey + 5],
      [ex + 17, ey + 9],
      [ex + 21, ey + 13],
    ],
    '#ffe14a',
    '#fffac0'
  )
    .line(
      [
        [ex + 12, ey + 4],
        [ex + 13, ey + 9],
        [ex + 10, ey + 13],
      ],
      '#ffe14a'
    )
    .line(
      [
        [ex + 17, ey - 1],
        [ex + 21, ey - 4],
      ],
      '#ffe14a'
    )
  s.d(ex + 5, ey - 1, '#fffac0')
    .d(ex + 6, ey - 1, '#ffe14a')
    .d(ex + 4, ey - 2, '#060c22')
    .d(ex + 5, ey - 2, '#060c22')
    .d(ex + 6, ey - 2, '#060c22')
    .d(ex + 7, ey - 2, '#060c22')
}
// A broad bird wing from the shoulder (sx, sy): leading edge up and back to the tip, finger feathers along the
// trailing edge. dir -1 = near wing (sweeps back over the body), 1 = far wing (behind, toward the front).
// lift raises the tip; vein draws a lightning line along it; puff adds storm-cloud lumps on the trailing edge.
function birdWing(s, sx, sy, sc, dir, lift, k, vein, puff) {
  const d = dir < 0 ? -1 : 0.75,
    base = [
      [0, 0],
      [5 * d, -10],
      [12 * d, -20],
      [22 * d, -28],
      [27 * d, -31],
      [24 * d, -26],
      [28 * d, -24],
      [21 * d, -20],
      [25 * d, -17],
      [17 * d, -14],
      [20 * d, -9],
      [11 * d, -6],
      [12 * d, 0],
      [4 * d, 2],
    ]
  const pts = base.map(([x, y], i) => [sx + x * sc, sy + y * sc + lift * Math.min(1, -y / 28)])
  s.P(pts, k)
  if (puff) for (const i of [5, 7, 9, 11]) s.E(pts[i][0], pts[i][1], 3.4 * sc, 2.8 * sc, puff)
  for (const i of [6, 8, 10])
    s.line(
      [
        [pts[i][0], pts[i][1]],
        [(pts[i][0] + sx) / 2, (pts[i][1] + sy) / 2],
      ],
      '#0c0a18'
    )
  if (vein)
    s.line(
      [[sx + 2 * d * sc, sy - 2 * sc], pts[2], [pts[2][0] - 2 * d, pts[2][1] + 2], pts[3]],
      vein,
      '#fffac0'
    )
}
// Holy line helpers.
// A thin glowing halo ring of detail pixels (always drawn on top), tilt leans it to one side.
function haloRing(s, x, y, rx, ry, tilt = 0, thick = 1) {
  const n = Math.ceil(rx * 8)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU,
      px = x + Math.cos(a) * rx,
      py = y + Math.sin(a) * ry + Math.cos(a) * rx * tilt
    const c = Math.sin(a) < -0.2 ? '#fff6c8' : Math.sin(a) > 0.4 ? '#e8a820' : '#ffd84a'
    s.d(px, py, c)
    if (thick > 1) s.d(px, py + 1, Math.sin(a) < 0 ? '#ffd84a' : '#c48a16')
  }
}
// A light ray (thin pointed wedge) from radius r0 to r1 at angle a around (cx, cy).
function ray(s, cx, cy, r0, r1, a, w, k) {
  const c = Math.cos(a),
    sn = Math.sin(a)
  s.P(
    [
      [cx + c * r0 - sn * w, cy + sn * r0 + c * w],
      [cx + c * r1, cy + sn * r1],
      [cx + c * r0 + sn * w, cy + sn * r0 - c * w],
    ],
    k
  )
}
// A lion's mane of light: alternating long gold and short white rays round a gold disc.
function lightMane(s, cx, cy, r, n, k = 'mane', k2 = 'hlight') {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + 0.2
    ray(s, cx, cy, r * 0.5, r * (i % 2 ? 1.05 : 1.45), a, r * 0.3, i % 2 ? k2 : k)
  }
  s.E(cx, cy, r * 0.85, r * 0.8, k)
}
// A long feathered wing pointing along angle a from (sx, sy): smooth leading edge, scalloped trailing edge.
// side flips which edge carries the feather tips.
function plumeWing(s, sx, sy, len, wid, a, k, side = 1, line = '#7e88a4') {
  const c = Math.cos(a),
    sn = Math.sin(a),
    T = (u, v) => [sx + c * u - sn * v * side, sy + sn * u + c * v * side],
    pts = []
  for (let i = 0; i <= 8; i++) {
    const q = i / 8
    pts.push(T(len * q, -wid * 0.35 * Math.sin(Math.PI * Math.min(1, q * 1.05))))
  }
  for (let i = 10; i >= 0; i--) {
    const q = i / 10
    pts.push(
      T(
        len * (q * 0.94),
        wid * (0.2 + 0.8 * Math.sin(Math.PI * Math.min(1, q * 0.9 + 0.08))) * (i % 2 ? 0.62 : 1)
      )
    )
  }
  s.P(pts, k)
  for (const q of [0.3, 0.5, 0.7])
    s.line([T(len * q, wid * 0.1), T(len * (q - 0.12), wid * 0.6 * Math.sin(Math.PI * q))], line)
}
// Gold scale plates in a row along the back.
function scaleRow(s, pts, rx, ry, k = 'gold') {
  for (const [x, y] of pts) s.E(x, y, rx, ry, k)
  for (const [x, y] of pts) s.d(x - rx * 0.4, y - ry * 0.3, '#fff0a0')
}
// A qilin head at (ex, ey) facing right: long snout, one swept-back horn, cloud brow, whisker.
function qilinHead(s, ex, ey, sc, j, horn = 'gold', hornGlow = false) {
  s.L(ex - 1 * sc, ey - 3 * sc, ex - 6 * sc, ey - 12 * sc, 1.3 * sc, horn, 0.5 * sc)
  s.L(ex - 6 * sc, ey - 12 * sc, ex - 9 * sc, ey - 14 * sc, 0.6 * sc, horn, 0.4)
  s.P(
    [
      [ex - 4 * sc, ey - 2 * sc],
      [ex - 8 * sc, ey - 6 * sc],
      [ex - 2 * sc, ey - 4 * sc],
    ],
    'ivory2'
  )
  s.E(ex, ey, 5 * sc, 4.2 * sc, 'ivory')
  s.P(
    [
      [ex + 2 * sc, ey - 2.5 * sc],
      [ex + 10 * sc, ey],
      [ex + 10 * sc, ey + 2.6 * sc],
      [ex + 2 * sc, ey + 3.4 * sc],
    ],
    'ivory'
  )
  s.P(
    [
      [ex + 2 * sc, ey + 2.4 * sc],
      [ex + 9 * sc, ey + 2.6 * sc + j],
      [ex + 7 * sc, ey + 4.6 * sc + j],
      [ex + 2 * sc, ey + 4.2 * sc],
    ],
    'ivory2'
  )
  s.E(ex - 1 * sc, ey - 3.6 * sc, 3.4 * sc, 1.6 * sc, 'sky')
  s.line(
    [
      [ex + 8 * sc, ey + 1.5 * sc],
      [ex + 11 * sc, ey + 4 * sc],
      [ex + 10 * sc, ey + 7 * sc],
    ],
    '#f2c13a',
    '#fff0a0'
  )
  s.d(ex + 2 * sc, ey - 1 * sc, '#ffffff')
    .d(ex + 3 * sc, ey - 1 * sc, '#2a1802')
    .d(ex + 1 * sc, ey - 2 * sc, '#2a1802')
    .d(ex + 2 * sc, ey - 2 * sc, '#2a1802')
    .d(ex + 3 * sc, ey - 2 * sc, '#2a1802')
  s.d(ex + 9.5 * sc, ey + 0.4 * sc, '#2a2620')
  if (hornGlow) s.d(ex - 9 * sc, ey - 14 * sc, '#ffffff').d(ex - 8 * sc, ey - 14 * sc, '#fff6c8')
}
// A lion head at (cx, cy) in its mane: cream face, short muzzle, gold eyes.
function lionFace(s, cx, cy, sc, j, eye = 'cute') {
  s.E(cx + 1.6 * sc, cy + 0.8 * sc, 4.6 * sc, 4.3 * sc, 'lionb')
  s.E(cx - 1.4 * sc, cy - 3.6 * sc, 1.5 * sc, 1.5 * sc, 'lionb')
  s.E(cx + 4.8 * sc, cy + 2 * sc, 2.8 * sc, 2.1 * sc + j * 0.3, 'ivory')
  s.d(cx + 7 * sc, cy + 0.8 * sc, '#6a3a2a').d(cx + 6.4 * sc, cy + 0.8 * sc, '#6a3a2a')
  if (j > 0.5)
    s.line(
      [
        [cx + 4 * sc, cy + 3.4 * sc],
        [cx + 7 * sc, cy + 3.4 * sc],
      ],
      '#5a0a1a'
    )
  if (eye === 'cute') s.eye(cx + 2 * sc, cy - 1 * sc, 'cute')
  else
    s.d(cx + 2 * sc, cy - 1 * sc, '#fff6b0')
      .d(cx + 3 * sc, cy - 1 * sc, '#c48a16')
      .line(
        [
          [cx + 0.5 * sc, cy - 2.4 * sc],
          [cx + 4 * sc, cy - 1.8 * sc],
        ],
        '#2a1a04'
      )
}
// Dark line helpers.
// A bat wing: arm spar from the shoulder S to the wrist W, finger spars to the tips, membrane panels in two
// alternating shades with scalloped trailing edges, back to the body at B. torn cuts notches out of the edge.
function memWing(s, S, W, tips, B, k1, k2, spar, torn = 0) {
  const sc = (a, b) => [
    (a[0] + b[0]) / 2 + (W[0] - (a[0] + b[0]) / 2) * 0.25,
    (a[1] + b[1]) / 2 + (W[1] - (a[1] + b[1]) / 2) * 0.25,
  ]
  s.P([S, W, tips[0]], k1)
  for (let i = 0; i < tips.length - 1; i++)
    s.P([W, tips[i], sc(tips[i], tips[i + 1]), tips[i + 1]], i % 2 ? k1 : k2)
  s.P([W, tips[tips.length - 1], sc(tips[tips.length - 1], B), B, S], tips.length % 2 ? k1 : k2)
  for (let i = 0; i < torn; i++) {
    const a = tips[i],
      b = tips[i + 1] || B,
      m = sc(a, b)
    s.E(lerp(a[0], m[0], 0.55), lerp(a[1], m[1], 0.55), 1.6, 1.4, 0)
  }
  s.L(S[0], S[1], W[0], W[1], 1.2, spar, 0.9)
  for (const p of tips) s.L(W[0], W[1], p[0], p[1], 0.7, spar, 0.4)
  s.spike(W[0], W[1] + 0.5, 2.6, 0.9, 'bone', (W[0] - S[0]) * 0.08)
}
// One jointed leg: hip → knee (raised) → foot.
function jLeg(s, h, kn, f, r, k) {
  s.L(h[0], h[1], kn[0], kn[1], r, k, r * 0.85)
  s.L(kn[0], kn[1], f[0], f[1], r * 0.8, k, r * 0.45)
}
// A ring of red eyes for spiders.
function spiderEyes(s, x, y, big = 1) {
  for (const [dx, dy, b] of [
    [0, 0, 1],
    [2.4, -0.4, 1],
    [1.2, -2, 0.6],
    [3.4, -1.8, 0.6],
    [-1.4, -1.2, 0.5],
    [4.4, 0.4, 0.5],
  ]) {
    s.d(x + dx * big, y + dy * big, b > 0.8 ? '#ff3a4a' : '#c8102a')
    if (b > 0.8 && big > 1) s.d(x + dx * big + 1, y + dy * big, '#ff8a8a')
  }
}
const starDots = (s, pts) => {
  for (const [x, y, b] of pts) {
    s.d(x, y, b ? '#ffffff' : '#a8b4ff')
    if (b)
      s.d(x + 1, y, '#6a7ad8')
        .d(x - 1, y, '#6a7ad8')
        .d(x, y - 1, '#6a7ad8')
        .d(x, y + 1, '#6a7ad8')
  }
}
// Shadow line helpers.
// A violet glowing eye: 'o' round and cute, 'n' narrow and angry, 's' a sleepy line.
function shEye(s, x, y, kind = 'o') {
  if (kind === 'o')
    s.d(x, y, '#f0d8ff')
      .d(x + 1, y, '#b04aff')
      .d(x, y + 1, '#b04aff')
      .d(x + 1, y + 1, '#4a1a8a')
  else if (kind === 'n')
    s.d(x - 1, y - 1, '#7a2ad0')
      .d(x, y, '#f0d8ff')
      .d(x + 1, y, '#d08aff')
      .d(x + 2, y, '#a04aff')
      .d(x + 2, y + 1, '#7a2ad0')
  else
    s.d(x, y, '#b04aff')
      .d(x + 1, y, '#b04aff')
      .d(x + 2, y, '#b04aff')
  return s
}
// A tapered ribbon along a list of points.
function ribbon(s, pts, r0, r1, k) {
  const n = pts.length - 1
  for (let i = 0; i < n; i++)
    s.L(
      pts[i][0],
      pts[i][1],
      pts[i + 1][0],
      pts[i + 1][1],
      r0 + ((r1 - r0) * i) / n,
      k,
      r0 + ((r1 - r0) * (i + 1)) / n
    )
}
// A pixel arc of a circle centred (cx, cy), radius r, from angle a0 to a1 (radians), drawn as detail dots.
function arc(s, cx, cy, r, a0, a1, c, rx = r) {
  const pts = []
  for (let i = 0; i <= 8; i++) {
    const a = a0 + ((a1 - a0) * i) / 8
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * r])
  }
  return s.line(pts, c)
}
// Drawing on a design grid: scale sc, offset (ox, oy).
function tf(s, sc, ox, oy) {
  const X = (x) => x * sc + ox,
    Y = (y) => y * sc + oy,
    M = (pts) => pts.map(([x, y]) => [X(x), Y(y)])
  return {
    X,
    Y,
    M,
    E: (x, y, rx, ry, k) => s.E(X(x), Y(y), rx * sc, ry * sc, k),
    L: (x0, y0, x1, y1, r0, k, r1 = r0) => s.L(X(x0), Y(y0), X(x1), Y(y1), r0 * sc, k, r1 * sc),
    P: (pts, k) => s.P(M(pts), k),
    d: (x, y, c) => s.d(X(x), Y(y), c),
    ln: (pts, c, c2) => s.line(M(pts), c, c2),
    R: (pts, r0, r1, k) => ribbon(s, M(pts), r0 * sc, r1 * sc, k),
    sp: (x, y, h, w, k, l = 0) => s.spike(X(x), Y(y), h * sc, w * sc, k, l * sc),
  }
}
// The hooded wraith from the owner's picture (fused form), on an 88-pixel grid. mini: the baby version.
function drawWraith(s, P, sc, mini) {
  const [bx, by] = P.body,
    t = P.tail,
    hx = P.head[0] * 0.5,
    hy = P.head[1] * 0.5,
    g = tf(s, sc, bx, by)
  // purple tendrils streaming back from the hood
  const ten = mini
    ? [
        [
          [42, 22],
          [32, 16 - t],
          [22, 18 - t],
          [17, 25 - t],
        ],
        [
          [46, 18],
          [40, 9],
          [33, 5 - t],
        ],
      ]
    : [
        [
          [42, 23],
          [33, 17 - t],
          [24, 16 - t],
          [18, 20 - t],
          [16, 27 - t],
        ],
        [
          [44, 19],
          [38, 11],
          [31, 6 - t],
          [26, 6 - t],
        ],
        [
          [47, 17],
          [45, 9],
          [44, 2 - t],
        ],
        [
          [50, 15],
          [50, 8],
          [47, 2],
        ],
        [
          [41, 28],
          [35, 27],
          [29, 29 - t],
          [26, 33 - t],
        ],
        [
          [43, 25],
          [37, 22],
          [31, 22 - t],
        ],
      ]
  ten.forEach((p, i) =>
    g.R(
      p.map(([x, y]) => [x + hx, y + hy]),
      i < 2 ? 2.6 : 2,
      0.7,
      i % 2 ? 'vten' : 'vwing2'
    )
  )
  // back arm ending in dripping purple claws
  g.R(
    [
      [42, 40],
      [34, 45],
      [28, 50],
    ],
    4,
    2.6,
    'wr2'
  )
  if (!mini)
    for (const [x, y, l] of [
      [20, 62, -1],
      [23, 64, 0],
      [26, 63, 0.5],
      [29, 61, 1],
      [18, 57, -2],
      [31, 58, 2],
    ])
      g.R(
        [
          [28, 49],
          [(28 + x) / 2 - l, (49 + y) / 2],
          [x, y],
        ],
        1.6,
        0.5,
        'vten'
      )
  else
    for (const x of [22, 26, 30])
      g.R(
        [
          [28, 50],
          [x, 58],
        ],
        1.4,
        0.5,
        'vten'
      )
  // robe: thick at the chest, swirling down to a hooked tail
  const bp = [
    [45, 40, 11],
    [48, 49, 10.5],
    [52, 57, 9],
    [55, 64, 7.4],
    [53, 71, 6],
    [46, 76, 5],
    [38, 78, 4],
    [31, 76, 3.2],
    [28, 71, 2.4],
    [31, 67, 1.6],
  ]
  for (let i = 0; i < bp.length - 1; i++)
    g.L(
      bp[i][0],
      bp[i][1] + (i > 5 ? t * 0.4 : 0),
      bp[i + 1][0],
      bp[i + 1][1] + (i > 4 ? t * 0.4 : 0),
      bp[i][2],
      i > 5 ? 'wr2' : 'wr',
      bp[i + 1][2]
    )
  // wrap folds across the robe, with violet bands
  for (let i = 0; i < bp.length - 2; i++)
    for (const q of [0.2, 0.55, 0.85]) {
      const [x0, y0, r0] = bp[i],
        [x1, y1, r1] = bp[i + 1],
        x = x0 + (x1 - x0) * q,
        y = y0 + (y1 - y0) * q,
        r = (r0 + (r1 - r0) * q) * 0.85
      const nx = -(y1 - y0),
        ny = x1 - x0,
        n = Math.hypot(nx, ny) || 1,
        ux = (nx / n) * r,
        uy = (ny / n) * r
      g.ln(
        [
          [x - ux, y - uy + 1.2],
          [x, y + 1.8],
          [x + ux, y + uy + 1.2],
        ],
        q === 0.55 && i % 2 ? '#6a40a8' : q === 0.2 ? '#35304a' : '#6e6988'
      )
    }
  // collar and hood (tall point, face a dark void with two angry violet eyes)
  g.E(50 + hx, 38 + hy, 9, 5, 'wr')
  g.ln(
    [
      [43 + hx, 37 + hy],
      [50 + hx, 40 + hy],
      [57 + hx, 37 + hy],
    ],
    '#35304a'
  )
  g.ln(
    [
      [44 + hx, 39 + hy],
      [51 + hx, 42 + hy],
    ],
    '#7a4ac0'
  )
  g.P(
    [
      [54, 12],
      [58, 15],
      [63, 20],
      [66, 27],
      [65, 34],
      [61, 39],
      [55, 41],
      [48, 39],
      [42, 34],
      [40, 27],
      [43, 20],
      [48, 15],
    ].map(([x, y]) => [x + hx, y + hy]),
    'wr'
  )
  g.ln(
    [
      [53 + hx, 14 + hy],
      [48 + hx, 20 + hy],
      [45 + hx, 28 + hy],
      [47 + hx, 35 + hy],
    ],
    '#a6a2bc'
  )
  g.ln(
    [
      [50 + hx, 16 + hy],
      [44 + hx, 24 + hy],
    ],
    '#77728e'
  )
  g.P(
    [
      [56, 19],
      [61, 22],
      [64, 28],
      [62, 35],
      [58, 37],
      [54, 33],
      [53, 25],
    ].map(([x, y]) => [x + hx, y + hy]),
    'void'
  )
  for (const [x, y, c] of [
    [55, 26, '#7a2ad0'],
    [56, 26, '#d08aff'],
    [57, 27, '#f0d8ff'],
    [58, 27, '#b04aff'],
    [60, 27, '#b04aff'],
    [61, 27, '#f0d8ff'],
    [62, 26, '#d08aff'],
    [63, 26, '#7a2ad0'],
  ])
    g.d(x + hx, y + hy, c)
  // front arm reaching to a violet vortex
  g.R(
    [
      [54, 44],
      [61, 46],
      [66, 49],
    ],
    3.8,
    2.6,
    'wr'
  )
  g.ln(
    [
      [56, 45],
      [64, 48],
    ],
    '#8c87a6'
  )
  for (const [x, y] of [
    [69, 50],
    [69, 53],
    [67, 55],
  ])
    g.R(
      [
        [66, 49],
        [x, y],
      ],
      1.3,
      0.4,
      'vten'
    )
  if (!mini) {
    let prev = null
    for (let i = 0; i <= 90; i++) {
      const an = i * 0.3,
        r = 0.8 + i * 0.1,
        p = [74 + Math.cos(an) * r, 58 + Math.sin(an) * r * 0.85]
      if (prev) g.ln([prev, p], i % 9 < 3 ? '#9a8aff' : i % 9 < 6 ? '#5a4ae8' : '#3a2aa8')
      prev = p
    }
    g.E(74, 58, 2, 2, 'vio')
  }
}
// The horned demon from the picture, turned to face right, on an 80-pixel grid. tier 0 imp, 1 bare claws, 2 bone club, 3 spiked mace.
function drawDemon(s, P, sc, tier) {
  const [bx, by] = P.body,
    t = P.tail,
    hx = P.head[0] * 0.6,
    hy = P.head[1] * 0.6,
    g = tf(s, sc, bx, by)
  const a = P.arm,
    a2 = P.arm2,
    hs = [0.5, 0.7, 0.85, 1][tier]
  const horn = (base, pts, r) =>
    g.R(
      [
        base,
        ...pts.map(([x, y]) => [base[0] + (x - base[0]) * hs, base[1] + (y - base[1]) * hs]),
      ].map(([x, y]) => [x + hx, y + hy]),
      r,
      0.5,
      'horn'
    )
  // tail
  g.R(
    [
      [21, 54],
      [12, 55 - t],
      [6, 50 - t],
      [5, 44 - t],
    ],
    2,
    0.7,
    'dem2'
  )
  g.P(
    [
      [3, 41 - t],
      [7, 41 - t],
      [5, 46 - t],
    ],
    'dem2'
  )
  // back leg, crouched: hip, knee out to the back, clawed foot
  g.L(29, 55, 20, 63, 4.6, 'dem2', 3.8)
  g.L(20, 63, 17, 74, 3.6, 'dem2', 2.6)
  g.E(15, 76, 4.6, 1.8, 'dem2')
  for (const x of [10, 13, 16]) g.d(x, 77.5, '#d6ccbb')
  // back arm down to the weapon
  g.L(28, 34, 24, 47, 4.2, 'dem2', 3.6)
  g.L(24, 47, 29, 55 + a2[1] * 0.5, 3.4, 'dem2', 2.8)
  g.E(30, 55.5, 3.2, 2.8, 'dem2')
  // torso: broad shoulders, deep chest, abs, leaning forward
  g.E(30, 32, 8.6, 7, 'dem')
  g.E(37, 40, 10.5, 10.5, 'dem')
  g.E(37.5, 50, 8, 6.4, 'dem')
  g.E(33, 54, 7, 3.6, 'dem2')
  g.ln(
    [
      [30, 39],
      [36, 42],
      [42, 41],
      [46, 37],
    ],
    '#3a3654'
  )
  g.ln(
    [
      [38, 43],
      [38, 55],
    ],
    '#3a3654'
  )
  g.ln(
    [
      [32, 47],
      [44, 47],
    ],
    '#3a3654'
  )
  g.ln(
    [
      [33, 51],
      [43, 51],
    ],
    '#3a3654'
  )
  g.ln(
    [
      [23, 30],
      [28, 26.6],
      [34, 27],
    ],
    '#aaa6c4'
  )
  g.ln(
    [
      [34, 35],
      [40, 34],
    ],
    '#8e8aac'
  )
  g.ln(
    [
      [29, 42],
      [30, 50],
    ],
    '#3a3654'
  )
  if (tier >= 2) for (let i = 0; i < 4; i++) g.sp(23 + i * 3.4, 28 - i * 1.2, 3.4, 1.2, 'dem2', -1)
  // front leg
  g.L(40, 55, 48, 63, 5, 'dem', 4)
  g.L(48, 63, 46, 74, 3.8, 'dem', 2.8)
  g.E(48, 76, 5, 1.9, 'dem')
  for (const x of [46, 49.5, 53]) g.d(x, 78, '#d6ccbb')
  g.ln(
    [
      [44, 58],
      [48, 63],
    ],
    '#3a3654'
  )
  // head: pointed ears, brow, angry violet eyes, grinning fangs, C-shaped horns
  g.sp(36 + hx, 21 + hy, 6, 2.2, 'dem', -3)
  g.sp(51 + hx, 20 + hy, 6, 2.2, 'dem', 3.4)
  horn(
    [35, 18],
    [
      [31, 12],
      [30, 6],
      [31.5, 2],
    ],
    2.6
  )
  horn(
    [46, 18],
    [
      [49.5, 12],
      [49, 6],
      [46.5, 2.5],
    ],
    2.8
  )
  g.E(43 + hx, 23 + hy, 8.4, 8.2, 'dem')
  g.E(44 + hx, 29.4 + hy, 6.8, 4, 'dem')
  g.ln(
    [
      [37 + hx, 21 + hy],
      [42 + hx, 22.6 + hy],
      [44 + hx, 22.6 + hy],
      [50 + hx, 21 + hy],
    ],
    '#2a2640'
  )
  for (const [x, y, c] of [
    [38, 23, '#7a2ad0'],
    [39, 23.6, '#d08aff'],
    [40, 24, '#f0d8ff'],
    [41, 24, '#b04aff'],
    [45, 24, '#b04aff'],
    [46, 24, '#f0d8ff'],
    [47, 23.6, '#d08aff'],
    [48, 23, '#7a2ad0'],
  ])
    g.d(x + hx, y + hy, c)
  g.ln(
    [
      [39 + hx, 29 + hy],
      [49 + hx, 29 + hy],
    ],
    '#1a1626'
  )
  for (const x of [40, 42.5, 45, 47.5]) g.d(x + hx, 28.6 + hy, '#f4eef8')
  g.d(41 + hx, 30.4 + hy, '#f4eef8')
  g.d(47 + hx, 30.4 + hy, '#f4eef8')
  g.d(43.5 + hx, 26.4 + hy, '#2a2640')
  // weapon held across the body in both hands, head out in front
  if (tier === 3) {
    g.L(22, 55, 56, 51, 1.4, 'iron')
    for (let i = 0; i < 8; i++) {
      const an = (i * Math.PI) / 4
      g.sp(63 + Math.cos(an) * 6, 51 + Math.sin(an) * 6, 3.4, 1.4, 'iron', Math.cos(an) * 2.6)
    }
    g.E(63, 51, 6.4, 6.4, 'iron')
    g.E(61, 50, 1.4, 1.3, 'vio')
    g.E(65.5, 50, 1.4, 1.3, 'vio')
    g.d(63, 53, '#3a3850')
    for (const [x0, w] of [
      [58, 1],
      [63, -1],
      [67, 1],
    ])
      g.ln(
        [
          [x0, 43],
          [x0 + w, 40],
          [x0, 37],
          [x0 + w, 34],
          [x0, 31],
        ],
        '#6a3aa8'
      )
  } else if (tier === 2) {
    g.L(26, 55, 52, 50, 1.6, 'bone')
    g.E(55, 49.5, 3.6, 3.2, 'bone')
    g.d(54, 49, '#7a2ad0')
  }
  // front arm, hand gripping the shaft
  g.L(46, 33, 51, 43, 4, 'dem', 3.4)
  g.L(51, 43, 45, 52 + a[1] * 0.5, 3.4, 'dem', 2.8)
  g.E(44.5, 53, 3.4, 3, 'dem')
  if (tier < 2) for (const x of [42, 44.5, 47]) g.d(x, 56, '#d6ccbb')
  g.ln(
    [
      [47, 34],
      [50, 40],
    ],
    '#aaa6c4'
  )
}
// The armoured skeleton from the picture, on a 64-pixel grid. king: the boss version.
function drawSkel(s, P, sc, king) {
  const [bx, by] = P.body,
    hx = P.head[0] * 0.5,
    hy = P.head[1] * 0.5,
    a2 = P.arm2,
    g = tf(s, sc, bx, by)
  // sword smoke behind the blade
  for (const [pts, r] of [
    [
      [
        [46, 26],
        [48, 18],
        [46, 12],
        [49, 5],
        [47, 0],
      ],
      2.2,
    ],
    [
      [
        [52, 18],
        [54, 11],
        [52, 6],
        [55, 1],
      ],
      1.8,
    ],
    [
      [
        [56, 12],
        [58, 6],
        [57, 1],
      ],
      1.4,
    ],
  ])
    g.R(
      pts.map(([x, y]) => [x + a2[0], y + a2[1]]),
      r,
      0.6,
      'shdw'
    )
  if (king)
    g.P(
      [
        [16, 14],
        [8, 40],
        [6, 58],
        [12, 54],
        [16, 60],
        [22, 55],
        [26, 61],
        [30, 55],
        [36, 60],
        [40, 53],
        [44, 58],
        [42, 30],
        [36, 14],
      ],
      'cloak2'
    )
  // hanging bone legs under the tattered robe
  g.L(21, 46, 20, 56, 1.3, 'skul')
  g.E(19.4, 57, 2.2, 1, 'skul')
  g.L(34, 48, 35.5, 60, 1.4, 'skul')
  g.E(36.6, 61, 2.4, 1, 'skul')
  // robe and cowl
  g.P(
    [
      [15, 15],
      [24, 12],
      [33, 13],
      [38, 18],
      [39, 25],
      [37, 30],
      [40, 40],
      [41, 50],
      [39, 55],
      [37, 51],
      [35, 56],
      [32, 51],
      [29, 57],
      [26, 51],
      [23, 55],
      [21, 49],
      [18, 52],
      [18, 44],
      [19, 34],
      [17, 26],
    ],
    'cloak'
  )
  for (const [p, c] of [
    [
      [
        [29, 35],
        [30, 45],
        [29, 54],
      ],
      '#3a2e58',
    ],
    [
      [
        [34, 34],
        [36, 44],
        [36, 52],
      ],
      '#3a2e58',
    ],
    [
      [
        [24, 36],
        [23, 46],
        [24, 53],
      ],
      '#3a2e58',
    ],
    [
      [
        [32, 36],
        [33, 48],
      ],
      '#a898c8',
    ],
    [
      [
        [20, 22],
        [24, 18],
        [30, 17],
      ],
      '#a898c8',
    ],
  ])
    g.ln(p, c)
  // ribs and the bony hand on the chest
  g.E(26, 27, 5, 3.8, 'skul')
  for (const y of [25.6, 27.4, 29.2])
    g.ln(
      [
        [22, y],
        [30, y + 0.4],
      ],
      '#3a2e40'
    )
  g.ln(
    [
      [26, 23.5],
      [26, 30.5],
    ],
    '#3a2e40'
  )
  g.L(20, 28, 25, 27, 0.9, 'skul')
  for (const y of [26, 27.4, 28.8])
    g.ln(
      [
        [25, y],
        [28, y - 0.3],
      ],
      '#d4ccc6'
    )
  // belt
  g.P(
    [
      [19, 32],
      [32, 31.5],
      [32.5, 34],
      [19.5, 34.5],
    ],
    'bark2'
  )
  g.E(26, 33, 1.4, 1.2, 'iron')
  // cowl round the head, skull face, helmet with a nose guard
  g.E(23 + hx, 13 + hy, 8, 6.4, 'cloak')
  g.E(23 + hx, 14 + hy, 4.4, 4.8, 'skul')
  g.E(21.3 + hx, 13.2 + hy, 1.5, 1.4, 'void')
  g.E(25 + hx, 13.2 + hy, 1.5, 1.4, 'void')
  g.d(23.2 + hx, 15.4 + hy, '#2a2030')
  if (king) {
    g.d(21.3 + hx, 13.2 + hy, '#b04aff')
    g.d(25 + hx, 13.2 + hy, '#b04aff')
  }
  g.ln(
    [
      [20 + hx, 17.4 + hy],
      [26.6 + hx, 17.4 + hy],
    ],
    '#2a2030'
  )
  for (const x of [20.6, 22, 23.4, 24.8, 26]) g.d(x + hx, 17 + hy, '#f2ece6')
  g.P(
    [
      [17.5, 11.5],
      [18, 6.5],
      [21, 3.4],
      [25, 3.4],
      [28, 6.5],
      [28.6, 11.5],
      [26, 10.2],
      [20.4, 10.2],
    ].map(([x, y]) => [x + hx, y + hy]),
    'iron'
  )
  g.ln(
    [
      [18.4 + hx, 10.6 + hy],
      [28 + hx, 10.6 + hy],
    ],
    '#c4c2d8'
  )
  g.L(23.2 + hx, 6 + hy, 23.2 + hx, 14 + hy, 0.7, 'iron')
  g.d(21.4 + hx, 6.2 + hy, '#e8ecff')
  if (king) {
    for (const [dx, h, l] of [
      [-4.5, 5, -1],
      [-1.5, 6.5, 0],
      [1.5, 6.5, 0],
      [4.5, 5, 1],
    ])
      g.sp(23.2 + dx + hx, 4.4 + hy, h, 1.3, 'gold', l)
    g.E(23.2 + hx, 4.6 + hy, 5.6, 1.4, 'gold')
    g.d(23.2 + hx, 4.6 + hy, '#b04aff')
  }
  // sword: bone forearm, hilt, long blade up to the right
  const sx = a2[0],
    sy = a2[1]
  g.L(31 + sx, 26 + sy, 38 + sx, 33 + sy, 1, 'skul')
  g.E(39 + sx, 34 + sy, 1.8, 1.6, 'skul')
  g.P(
    [
      [41 + sx, 30 + sy],
      [57 + sx, 9 + sy],
      [61 + sx, 7 + sy],
      [59.4 + sx, 11 + sy],
      [44 + sx, 33 + sy],
    ],
    'iron'
  )
  g.ln(
    [
      [43 + sx, 31 + sy],
      [58.6 + sx, 10 + sy],
    ],
    '#3a2e58'
  )
  g.ln(
    [
      [42 + sx, 30 + sy],
      [57.4 + sx, 9.4 + sy],
    ],
    '#c4c2d8'
  )
  g.L(37.4 + sx, 31 + sy, 45.4 + sx, 37 + sy, 1.1, 'shield')
  g.L(39.4 + sx, 35.4 + sy, 37.6 + sx, 38.6 + sy, 1, 'bark2')
  g.E(37 + sx, 39.4 + sy, 1, 1, 'shield')
  // kite shield on the left
  g.P(
    [
      [4, 15],
      [19.5, 17],
      [20.5, 29],
      [13, 42.5],
      [3.4, 28],
    ],
    'shield'
  )
  g.P(
    [
      [6, 17],
      [18, 18.6],
      [18.8, 28.6],
      [13, 39.6],
      [5.4, 27.6],
    ],
    'cloak2'
  )
  g.ln(
    [
      [12, 17.6],
      [12.6, 41],
    ],
    '#aaa2c0'
  )
  g.ln(
    [
      [5, 16],
      [19, 17.6],
    ],
    '#d4ccec'
  )
  g.ln(
    [
      [4.4, 17],
      [4, 27],
    ],
    '#aaa2c0'
  )
  g.ln(
    [
      [8, 22],
      [10, 26],
      [8.6, 30],
    ],
    '#1a1626'
  )
  g.ln(
    [
      [15, 25],
      [16.6, 30],
    ],
    '#1a1626'
  )
  if (king) {
    g.E(12.4, 26, 2.4, 2.6, 'vio')
    g.d(11.6, 25.4, '#f0d8ff')
  }
}
// The skull from the picture, on an 80-pixel grid. winged: bat wings and the crystal crown.
function drawSkull(s, P, sc, winged) {
  const [bx, by] = P.body,
    j = P.jaw * 2,
    w = -7 * P.wing,
    g = tf(s, sc, bx, by)
  if (winged) {
    memWing(
      s,
      g.M([[29, 40]])[0],
      g.M([[19, 32 + w]])[0],
      g.M([
        [4, 40 + w],
        [6, 47 + w * 0.7],
        [13, 50 + w * 0.4],
        [20, 50 + w * 0.2],
      ]),
      g.M([[28, 47]])[0],
      'vwing',
      'vwing2',
      'dem2',
      1
    )
    memWing(
      s,
      g.M([[54, 40]])[0],
      g.M([[63, 31 + w]])[0],
      g.M([
        [78, 40 + w],
        [77, 46 + w * 0.7],
        [71, 49 + w * 0.4],
        [64, 49 + w * 0.2],
      ]),
      g.M([[55, 47]])[0],
      'vwing2',
      'vwing',
      'dem2',
      1
    )
    // crystal crown
    for (const [b, tip, wd] of [
      [[41, 27], [40.5, 9.5], 3.2],
      [[35.7, 28], [32.4, 15.4], 2.4],
      [[31.5, 30.6], [24.6, 20.6], 2.4],
      [[46.3, 27.5], [47.8, 17.4], 2.2],
      [[51.5, 29], [56.4, 17.6], 2.6],
      [[27, 33], [21.6, 28], 1.4],
      [[55, 31], [59, 26.6], 1.4],
    ]) {
      const dx = tip[0] - b[0],
        dy = tip[1] - b[1],
        n = Math.hypot(dx, dy),
        px = (-dy / n) * wd,
        py = (dx / n) * wd
      g.P(
        [
          b,
          [b[0] + dx * 0.3 + px, b[1] + dy * 0.3 + py],
          tip,
          [b[0] + dx * 0.3 - px, b[1] + dy * 0.3 - py],
        ],
        'crys'
      )
      g.ln(
        [
          [b[0] + dx * 0.3 + px * 0.4, b[1] + dy * 0.3 + py * 0.4],
          [tip[0] - dx * 0.1, tip[1] - dy * 0.1],
        ],
        '#ffffff'
      )
    }
  }
  // cranium turned a little to the right, cheekbones, cracks
  g.E(41, 39, 14.5, 13, 'skul')
  g.E(45, 50, 10.5, 4.6, 'skul')
  g.E(31, 44, 3.4, 6, 'skul')
  g.ln(
    [
      [46, 26.5],
      [45, 30],
      [47, 32],
      [45.6, 35],
    ],
    '#6e6470'
  )
  g.ln(
    [
      [29, 34],
      [31, 37],
      [29.6, 40],
    ],
    '#6e6470'
  )
  g.ln(
    [
      [30, 40],
      [34, 44],
      [33, 48],
    ],
    '#9a9092'
  )
  // eye sockets with violet glow, nose
  g.E(40, 39, 3.8, 4, 'void')
  g.E(50.4, 39, 3.2, 3.8, 'void')
  g.E(40, 39.4, 1.8, 1.8, 'vio')
  g.E(50.4, 39.4, 1.6, 1.7, 'vio')
  g.d(39.4, 38.6, '#f0d8ff')
  g.d(49.8, 38.6, '#f0d8ff')
  g.P(
    [
      [46.3, 42.6],
      [48, 46],
      [46.3, 47],
      [44.6, 46],
    ],
    'void'
  )
  // jaw hanging open, glowing orb inside
  g.P(
    [
      [39.4, 50],
      [53.6, 50],
      [52, 61 + j],
      [50, 63.6 + j],
      [42, 63.6 + j],
      [40, 61 + j],
    ],
    'void'
  )
  g.P(
    [
      [38.6, 50.6],
      [40.4, 51],
      [41, 61 + j],
      [43, 63 + j],
      [50, 63 + j],
      [51.6, 61 + j],
      [52.6, 51],
      [54.4, 50.6],
      [53, 63 + j],
      [50.4, 66 + j],
      [42, 66 + j],
      [39.6, 63 + j],
    ],
    'skul'
  )
  for (let x = 41; x <= 53; x += 2) {
    g.d(x, 50.4, '#f2ece6')
    g.d(x + 1, 50.4, '#4a4048')
  }
  for (let x = 42; x <= 50; x += 2) {
    g.d(x, 62.6 + j, '#f2ece6')
    g.d(x + 1, 62.6 + j, '#4a4048')
  }
  g.E(45.6, 56 + j * 0.5, 3.8, 3.6, 'vio')
  g.E(45, 55.4 + j * 0.5, 1.4, 1.2, 'crys')
  g.d(44.6, 55 + j * 0.5, '#ffffff')
  if (winged)
    for (const [x, y] of [
      [58, 58],
      [60, 62],
      [56, 66],
      [62, 54],
      [26, 60],
    ])
      g.d(x, y, '#b070e8')
}
const glowSap = (s, x, y) =>
  s
    .d(x, y, '#f0ffe0')
    .d(x + 1, y, '#a8ffa0')
    .d(x, y - 1, '#a8ffa0')
    .d(x, y + 1, '#4ad44a')
    .d(x - 1, y, '#a8ffa0')
    .d(x + 2, y, '#4ad44a')
// A pointed leaf from (x, y) along angle a, with an optional vein colour.
function leafShape(s, x, y, len, a, wid, k, vein) {
  const c = Math.cos(a),
    sn = Math.sin(a),
    nx = -sn,
    ny = c,
    pts = []
  for (let i = 0; i <= 8; i++) {
    const q = i / 8,
      w = Math.sin(q * Math.PI) * wid * (q < 0.5 ? 1 : 1 - (q - 0.5) * 0.4)
    pts.push([x + c * len * q + nx * w, y + sn * len * q + ny * w])
  }
  for (let i = 7; i >= 1; i--) {
    const q = i / 8,
      w = Math.sin(q * Math.PI) * wid * (q < 0.5 ? 1 : 1 - (q - 0.5) * 0.4)
    pts.push([x + c * len * q - nx * w, y + sn * len * q - ny * w])
  }
  s.P(pts, k)
  if (vein)
    s.line(
      [
        [x + c, y + sn],
        [x + c * len * 0.8, y + sn * len * 0.8],
      ],
      vein
    )
}
const flower = (s, x, y) =>
  s
    .d(x - 1, y, '#ff9ac0')
    .d(x + 1, y, '#ff9ac0')
    .d(x, y - 1, '#ffd0e0')
    .d(x, y + 1, '#e06a9a')
    .d(x, y, '#fff27a')
// A small tree: trunk plus a lumpy canopy.
function grove(s, x, y, h, r, k = 'canopy') {
  s.L(x, y, x, y - h, Math.max(1, r * 0.24), 'bark', Math.max(0.7, r * 0.16))
  s.E(x, y - h - r * 0.35, r, r * 0.78, k)
  s.E(x - r * 0.62, y - h + r * 0.15, r * 0.62, r * 0.5, k)
  s.E(x + r * 0.62, y - h + r * 0.2, r * 0.62, r * 0.5, k)
  s.d(x - r * 0.4, y - h - r * 0.7, '#d8ff9a').d(x - r * 0.2, y - h - r * 0.8, '#d8ff9a')
}

function gecko(s, o, P) {
  const B = o.body,
    F = o.far,
    [bx, by] = P.body,
    hx = P.head[0] + bx,
    hy = P.head[1] + by + (o.headDy || 0),
    t = P.tail
  s.L(5 + bx, 27 + by - t, 9 + bx, 33 + by, 1.2, B, 2)
  s.L(9 + bx, 33 + by, 15 + bx, 35 + by, 2, B, 3)
  s.E(14 + P.bf[0], 40 + P.bf[1], 2.2, 3.5, F)
  s.E(30 + P.ff[0], 40 + P.ff[1], 2, 3.5, F)
  s.E(21 + bx, 34 + by, 9, 5.5, B)
  s.E(22 + bx, 37 + by, 7, 2.5, o.belly)
  s.E(17 + P.bl[0], 40 + P.bl[1], 2.6, 3.6, B)
  s.E(18 + P.bl[0], 43 + P.bl[1], 3, 1.2, B)
  s.E(27 + P.fl[0], 40 + P.fl[1], 2.4, 3.6, B)
  s.E(28 + P.fl[0], 43 + P.fl[1], 3, 1.2, B)
  s.E(31 + (hx + bx) / 2, 30 + (hy + by) / 2, 5, 4.5, B)
  s.E(34 + hx, 27 + hy, 6.5, 5.5, B)
  s.E(39 + hx, 29 + hy, 4, 3.2, B)
  s.E(36 + hx, 31.5 + hy + P.jaw * 1.8, 4.5, 1.6, o.belly)
  if (P.jaw > 0.5)
    s.line(
      [
        [36 + hx, 31 + hy],
        [41 + hx, 31 + hy],
      ],
      '#5a0a06'
    )
  for (const [x, y] of [
    [15, 29],
    [19, 28.5],
    [23, 28.5],
    [28, 26],
  ])
    s.spike(x + bx, y + 1 + by, o.spikeH || 3.5, 1.6, o.spike)
  if (o.tailFire) {
    s.P(
      [
        [2, 27],
        [4, 20],
        [6, 24],
        [7, 18],
        [9, 26],
        [7, 29],
        [4, 29],
      ].map(([x, y]) => [x + bx, y + by - t]),
      'fire'
    )
    s.E(5 + bx, 26 + by - t, 1.6, 2, 'core')
  }
  s.eye(35 + hx, 25 + hy, o.eye || 'cute').d(41 + hx, 28 + hy, '#2a0806')
  if (P.jaw <= 0.5) s.d(38 + hx, 31 + hy, '#2a0806').d(39 + hx, 31 + hy, '#2a0806')
  s.d(19 + P.bl[0], 44 + P.bl[1], '#f4ede0').d(29 + P.fl[0], 44 + P.fl[1], '#f4ede0')
  if (P.glow) glowMouth(s, 43 + hx, 30 + hy + P.jaw)
}
