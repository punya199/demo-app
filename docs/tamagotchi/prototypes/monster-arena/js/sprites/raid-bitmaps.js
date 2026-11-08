'use strict'
// Raid boss sprites made as bitmaps instead of shapes: palette + one string per row
// ('a' = first colour, '.' = empty). Drawn with Spr.bmp.

// อสูรห้วงลึก: from the owner's AI-made picture (160 x 64, reduced to 16 colours, trimmed to 150 x 59).
const RAID_BMP = {
  abyssfish: {
    pal: [
      '#f1f4f8',
      '#a9cded',
      '#b1b9d0',
      '#9a9eab',
      '#6884ae',
      '#5394e6',
      '#4f7bc6',
      '#5275b7',
      '#3a72cb',
      '#545c67',
      '#2b4f98',
      '#2b4f60',
      '#1b3d82',
      '#102d65',
      '#5f1125',
      '#000102',
    ],
    rows: [
      '..................................................................................pp..................................................................',
      '..................................................................................nappp...............................................................',
      '..................................................................................pfaapp..............................................................',
      '...................................................................................pfpaap.............................................................',
      '....................................................................................pffaaap...........................................................',
      '....................................................................................pffffaap..........................................................',
      '...................................................................................pffffffaap.....pp..................................................',
      '...................................................................................pppnffffaap....pdp.................................................',
      'pappp.................................................................pppp............pfffffbapp..pnaap...............................................',
      'ppfappp...............................................................paappp...........pfffffbap...pfapp..............................................',
      '.pkfaappp..............................................................ppaaadpp.....ppppfkkffpaap..pffapp.............................................',
      '.ppnnffbalp.............................................................ppffbappp....dappfkmfffbapppfffaj....pp.......................................',
      '..pnnnnffappp............................................................pffffaapp...ppabkknngffaapppffpaj...app......................................',
      '...ppnnngfbapp.............................................ppppp..........pfffffaapp..pkffknnnnffbpkkmpfbd...pacp.....................................',
      '...pppnnnnfcappp...........................................paaaappp.......ppfifffbapp..plffnnnnnifpnnnkffbp..pfbpp..pap...............................',
      '....pknnnnnnfaap............................................ppfbaapp.......pffkfffbap.ppfffnnnnnnngppnnmffap.ppfapp.phap..............................',
      '....ppmmmnnnnfbhp............................................ppffbappp....pppfkkpffbappfikknnnppppnpapnnnfap.ppffap..pbapp..p.........................',
      '.....ppmkmnnnnfbapp...........................................ppfffaapp...pappikniffbpppknnnnnpaapppfappnkffppfkffap.pifap..pp........................',
      '......pppmmmnnnkbapp.............................ppp...........pfkfffap...ppffknnnninffcpppnpnnppfappiaapnnnpappnnmbpppkfapppbhp......................',
      '.....ppnnnmmnnnnfbjp.............................pappp.........pfikfffap....pfiknnnknpkfcppnppnnpfbappfbppnnpbappnnfpappifappfapp.....................',
      '.....pppmnnnmnnnffapp............................pfaaapp.....ppppfkkffbap...ppiknpppnnpppaappnnnpkffppppkppppkfapppppkaapkpapffapp.pp.................',
      '........pnmnnnnnnnfbap............................pffbaep....phapiknnnffap.pgknnnpaappnnppgbejppppppppghgkkffppppffffnnnpppkpkkfnp.pap................',
      '.........pnnnnnnnnnfaap................ppp........ppfffaap....pffimnnnnffappnnnnnnpfapppnppkifbpphhhhhnnnnnnpnhhhnnnpnkfffpppnppipppiepp..............',
      '.........ppppnmnnnnfbap................pappp.......pfiffbpp...pkkfmnnppnkfbpppnnnnpfiffcppppppnhhknnnnnnnnnpknnnnnnnkhknnpphkkkfknkpnfbpppp...........',
      '..........pnmnnnnnnkfbpp.....ppp........paabp......pffkffajp.ppfkknnnpappkfbhppnpppppppphgghhpkknnnnnnpnknpnknnnnmphnnnpnkkkkkknnkhfhnnhbpppp.........',
      '..........pmmmmnnnnnffblp.....pbpp......pnffapp..ppppfnnmffppppnnnnnppkbapnnkfppppphhhhknnnppknnnnnnnnkknnknnnnnnnknnnpknnnnnnmkkkkkkkkkkkkkbbppp.....',
      '...........pmmmnnnnnnffap.....pfapp....pppffpapp.pbppfmnnmfbppnnnnnpnnpifcpppppphhhnpnmnnnnnkknnnnnnnnknnpnnnnpnnpnnnnnpnnnnnnnnnppppnkkkkkkkkbbkpp...',
      '...........ppmmmnnnnnnfbpp....pffappp..pblkifbap.ppfpknnnnnkfpppppppppppppnkkkhhnnnnknnnnnpknnnnnnnnnknnnnnnnppnpnnppnppnpnnnnnnnnnnpppppnnknkkkbbpppp',
      '............kmnnnnnnnnnfbppp.pppkpfap..pnkknnnfbpppkknnnnnnnnnifpppppkhhknpnknnnnnpknnnnnpknnnnnnnnpknnnnnnnnpnnpnhpnppnpphhhhnnnnnnnppaappppnnnnkkkfp',
      '............ppnnnnnnnnnnnfbpppngnnnfjppfknnnnnnnfkpnnnnppppppphkkkkkknnnnnnknnnnnnknnnnnnnnnnnnnnnnknnnnnnfhkkhphhnhhpnhpphhhhhhhehnnnnpppnnnnnnnaaaap',
      '............pkknnnnnnnnnnhhfkppppnnnnfppnnnpppppppppppppkkkhkkmnknnnnnnnnpknnnnnnnnnnnnnnnnnnnnnnnnhnnnnhhhhphhphhphhphhphhhhhhhhhhehnnppnnhaaaaaaaapp',
      '............ppkmnnnnnnnnnnnkkkkkkpppppppppppkkkkkkkkknkknnnnnppknnnnnnnnpknnnnnnnnnnnnnpnnnnnhkknnfhhnnhhhhhphhphhphhphhphhhhhhhhhaaaaaaaaaaaadaaaapp.',
      '.............ppkknnnnnnhnnnnnnnnnkkkkkkkkkknkknnnnnnnknnnnnnnnknnnnnnnnpknnnnnnnnnnnnnnpnnnhhhhfnhhhhnhhhhhhphapchpfepefphhhhaaaadaaaaaaaaaaaaaaajp...',
      '.............pkknnnnnnhhhaaaaaaaaannnnnnnnnknnnnnnnnhnnnnnnnnnnnnnnnnnnnnnnnnnnnfefhhhhhfnehhhhnhhhhnnhhhhaapaapaapaapaapahaaaaapppppppppppppppppp....',
      '...........ppkknnnnnnhhhacbhhhhhaaaaaaaaahhnaaanhhhhkkkhhhknnnnnnnkhhhnnnnnfhhhnhhhhhhhhhhhhhhhhhhhhnhhhhhaapaapaapaapaapaaaaappppapappdpadpapapp.....',
      '..........ppkkknnnnnhhaaahpp....peccbaaaahaaaannaaahhhaahhnhhhhhhhhhhgnnnhhhhhhhhhhhhhhhhhhhhhhhhhhhnhaaaaaapaapaapaapaapaaaapaaapppppppppppppap......',
      '.........ppkknnmnnnnhaabp..........ppcccccbaaaaaaaaaaaaaakhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhheaaaaaaaappppaaapadpaapappappaaaaaapppooppopp...pp.......',
      '.........ppppnknnnnnaabpp...........pppnnccccccbaaaaaaaaaahhhhaaaaaahhhhhhhhhhaaahhhhhhhhhhhhaaaaappppkkknpaappapaapaapaapaaaaaappppooop..............',
      '...........pkkknnnnaaapp..............ppppppppcccccaabaaaaaaaaaaaaaaaaaaafecaaaaaafaaaaaaaahaaaapppkkkknnnnpaapjaaaaaaaaaaaaaaaaappapopp..............',
      '..........pnkkmnnnaabap..................pnnnpppaccccccccccccccccccaaaaaaaaaaaaaacaaaaaaaaaacapppkknnnnnnnhapaaaaaaaaabaaaaaaaaaadpapaopp.............',
      '........ppkkmnnnnaabpp...................pnnmnppppppcccccccccpppppppcccaaaaaabaabaaaaaaaaaccppkkknnnnnnnhhaapaaaaaaaaaabaaaaaaaaaaappappop............',
      '........pkkknnkkaabep...................pkkkgp.....ppppppccccpnnnnnpppccccccccccbaaaaaaaaccppmkknnnnnnnnhkapcaaaaaaaaaaabbbaaaaaaaaapppappp...........',
      '........pkknnkkaaccp....................phkhpp..........pppppnnnnnkfppcccccccccccccccccccccpkmnnnnnnnnnhhaapcaaaaaaaaaaabccccbcaaaaaaapdppppp.........',
      '.......pkknnkkaacnpp....................phnpp.............ppnmnnnhfappppppcccccccccccccccbppppnmkknnnnhhaappccbaaaacccccccccccccaaaaaaajdpadpp........',
      '......phknkkaabapp.....................pfpp...............pnknnhhhapp....ppppccccccccccccccppkkknnnnnhhhaapccccccccccccccnppppppcddcbaaaapppp.........',
      '.....pphnkhaabapp.....................ppp................ppkknhhhapp........ppppdddddcccccbpnkkknnnnhhhaapaccccccccccbpppp.....ppppppbcaaaaap.........',
      '....pphkkaaabppp.........................................pnknhhhapp............ppppppllnnnppkkknnnlhhhaappjnnnnpppppppp.............pppabapp..........',
      '...pghgaaappp............................................phhhaajp..............pnnmppp....pkkknnnnhhhaaap..............................pppp...........',
      '..pfhaaappp.............................................pghhaapp..............ppnkpp.....ppkkknnnhhfaaap..............................................',
      '.ppaaappp...............................................phhaapp...............pkfpp.....ppkkmnnnhhgaaapp..............................................',
      '.pppppp................................................pgjppp................pnppp....pppkknnnkhhfaaapp...............................................',
      '......................................................pppp...................pp.......pppnnnnhhhaaanp.................................................',
      '......................................................................................ppmmnnhhhaaaap..................................................',
      '.....................................................................................ppmknnhhhaaaap...................................................',
      '...................................................................................ppnkkhghaaappp.....................................................',
      '..................................................................................ppkkhghaaaapp.......................................................',
      '.................................................................................pnhhhhaaaappp........................................................',
      '................................................................................ppghaaaappp...........................................................',
      '...............................................................................pkjjhppppp.............................................................',
    ],
  },
  // ราชันย์ลาวา: from the owner's AI-made lava golem (reduced from about 860 x 960 to 90 x 87, mapped to a
  // hand-picked rock + lava palette; the smoke and embers were dropped and come back as particles).
  lavaking: {
    pal: [
      '#0c080c',
      '#1e1620',
      '#2e2430',
      '#42363e',
      '#5e5056',
      '#8a7c78',
      '#d8c4a0',
      '#4a0804',
      '#a8200a',
      '#e8400a',
      '#f07010',
      '#f8b818',
      '#f8e020',
    ],
    rows: [
      '...........................e...aaaaaaa....................................................',
      '.......................jj..a..aaaaaaaaa...................................................',
      '......................jjjiaaaaaggggccdaaa.................................................',
      '.....................jkgjaagggggggddcdddaaa...............................................',
      '....................jkgjaagggggggddddcddiaaa................aaa...........................',
      '....................jmmjagggggggdddddccjjcaa..............aaaaaaa.........................',
      '....................jjkaag..gggdeedddchllccaa..........aaaa...fbaa........................',
      '....................jjaagggg..gdeddddbciiccca.........aaff.....ccaaa......................',
      '...................aaaagggggggggddddccchicccaaa......aafffffffbccccaa.....................',
      '.................aaaggg.gggggdddeddebcchiccccaaa.....addddffbccdcccca.....................',
      '................aaggggggdggddddddddeccchhccccacaa...aadddddbccccdcccca....................',
      '...............aaagggggdecddddddddddccbjjacccadca.aaaaaaddabcccccdcccaa...................',
      '..............aaagggggdeeeddddddddddcbijljaccabbaaaaafffaddccccccccccca...................',
      '..............aaggeeedeeeebddddddddbbhjllljaaabbaaffaddc.adbcccccccccca...................',
      '..............aageeeeeeeeeebdddddbbbikkaaajaabbaaafaadbbddchiliacccccba...................',
      '..............aaeeeeeeeeeeebcbbdbbbbjkbdddaaabaaa.ddaddbddabimmmjjcccaa.....j.............',
      '..............aaeeceedeeeeeebbbbbbbijbdddddaahajjaddadddddaddbjmmmmhaaa....jjj............',
      '..............aeeeceeccdcccbcccbbbbjabdddddaaijllaaaaadddabddddimmmjaaaaaaajl.............',
      '..............aeecheccdddccaccbbbbbjhcdddddajjlljjaibaaaaacdddddbiiaaaaaeaaaj.............',
      '.............aacccjcddccdcbabbbbbbhjbccddddaklljjjccbbaaaacdddddcbbbaabeeeeaa..j..........',
      '.............aaaahjjhcccdbaaabbbbbjbccccddaalaakabbbbaaaaaadddddcbbaabbbeeeeaajjj.........',
      '.............aaaaajkiicababbabbbbihcccccccaaaccalaaaaaiiiaaadddcbbbaabbbbeeeeaajj.........',
      '............aa..ffaakiiihbbbbabbhbcccccccabbacddajffffbkkiaaaddcbbaabbbbbeeeeeaa..........',
      '............aaffffdaakkkihbbbbabbcccccccaabbacccbeffffdckkjiaaaabbaaabbbbbeeeeea..........',
      '............affffdddaakkkibbbbabcccccccaabbaacccbeeefdddclljiiiaaaahibbbbbbeeeeaa.........',
      '............adffdddddaalljihhhacbcccccaabbbaacddheeedddddbllllljiahiiabbbbbeeeeeaa........',
      '...........aa.dddddddajllljjjiibbcccaabbbbaaccccheeeedddddhllllllijjjabbbbbbeeeeeaa.......',
      '..........aaeefdddddddaallljljiabbaaabbbbaaccccheeeedddddddajllhhllkjhabbbbbbeeeeaa.......',
      '..........aaeeedddddddballlllljiaababaaaaabbccchieeeddddddddakacccbljababbbbbbeeeha.......',
      '..........aaeeddddcdddbakiaaaajjiiiiiaaaabcddcciaaedddddddddjacccccddabaabbbbbbchha.......',
      '..........aedfdddddddbbiiacccaajjiiaaabcaccddccjaaaadddddddbjaccccddddababbbbbbbiaa.......',
      '.........aaeebddddddaaajjcccccaaiaaaacbcaacddccjjiiaadddddakkiccccddddabaabbbbbbiaa.......',
      '.........aeeeedddddaahijbbcccccaabbabccccadcccajkkkkaabddaikjihccccdddabbacbbbbiaa........',
      '.........aeeebaaaaabhiibbbbbbccaabbaaccccaaaaiikkkkkjhaaaikiijihcccdcbabbaabbbjjaa........',
      '.........aaebbaaabbbhjhbbbbbbbaaabbaaccccaaijkkmkkkkkkkkkkkiiijhccbbbaabbhaaaijaa.........',
      '..........aabaabbbbbhihbbbbbbbaaabbaaccccaijjmmmmjjkkkkkkjjiiijibbbbcaabbiiiiiaa..........',
      '...........aaaiabbbhiiabbbbbba..aaihacccaijjmmmkjjjjklmmmmkjiijjhcbbbabbbjjiaaaa..........',
      '............aaijaaaijiabbbbbaa...aaiaccaikkmmmjjkkjjjmmmmmmkjjjjhbccaabbiijaaaa...........',
      '............aajkjijjlliabbbaa....aajiaaijkmmljjjjjjjjmmmmmmkjjjihbbcaaahiaaabba...........',
      '..........aaaaaalllmmlljaaaa.....aahjijaaaaaabbhjjjjjlmmmmljjjiaabbaabbaabbabba...........',
      '.........aaffggaaakmmjjkaa........ahijaaacccccccchjjjjkmmmjjjibbbaaabbbbbbbbabba..........',
      '........aagggggddakljiaaa.........aaaaaacccccbcccbbjjjjmmmjiibbbcaabbbbbbbbcacba..........',
      '.......aagggggdddaaljhhaa..........aaabaccccccbcccchjjiijjihbbbaaaabbbbbbbccacca..........',
      '......aagggggdddddbkiacaa...........abbihccccccccccbjiiiijibbbaa..aaabbbccccabaa..........',
      '......affcdddddddddkaccca............abhiaacccccccccjjiijibbcaa...aacaacccccaaa...........',
      '.....aaffdcedddddddhjaccaa...........aahaiiaacccccccajjjiccbaa....aaccccccccaaa...........',
      '....aaffddccddddddddjhcccaa..........aahaaaiiaccccccajjibbcaa......acccaccccaia...........',
      '....afffdddcceeddddcajhccaa.........aaaiiiaaaaaaccaahihaaaa........aaaaacbaaijjaa.........',
      '....affddddcccceddbbbjiccba.......aaaaaaajjjaaaaaaaaiiaaaa..........aaiiaaaijljaaaa.......',
      '....aeedddddcccceccbbhibbba......aaaeeeeaajaccccaccchjjjaaa.........aijjjijjlliaccaa......',
      '...aaeedddddhcccbbccbaabbba.....aaeeeeeccajacbbbccccchlllaaa.......aakkkkljlljadccaa......',
      '...aeeddddddhccccbbcbaabbba.....aeeeeccccajhbbbbbcccccalacaa.......aajaaaallliccccca......',
      '...aeedddddciccccbbbbabbbba....aaeeeccccccajbbbbbcccccbabbbaa.....aaihccccaljaccccca......',
      '..aaeddddddhjccccbbbaabbbba....accccccccccbjabbbaccccchibbcaa.....aajccccccalicccccaa.....',
      '..aaddddddcjjcbbbbbaaabbbba....aacacccccccaaiaaaacccccijhbba......acabbccccclibccccca.....',
      '..addddddbiljcccbbaababbbaa....aaaaacccaacaaaiiiaccccakkcbaa......abbbbbcccchjaccccca.....',
      '..aaddddcjlaaaacbaabbbabaa.....aaiiaaaaccccaabjkaabaaikabaaaaa....abbbcbbccchjhcbcccaa....',
      '...accdbikaabaaiabbbbbaaa.....aafekkacccccccabhlliiilkabaaiaaaa...abbbccbbccaihcccccca....',
      '...aabbijaaaaijiabbbbbaaa....aaeeeeljcccccccaahilmlllabaabbjbba...aabbbccbbbaihccccccaa...',
      '....aaiiaaalllljaabbbbaa....aaeeefcjjcccccccaabbilmlabaabbbjjbaa...abbbbcbbbajabcccccca...',
      '.....aiaaffffccljaaaaaa....aaeefccccjccccccbaabbillbbaabbbbbkibaa..aabbcbbbajjiacccccba...',
      '....aaaafffccccbljhaaaa....aeeeccccckhccccbccaaabhaaaabbbbbbbkbbaa..abbbbbaajliiaaccbba...',
      '...aaffffddccccchlibccaaa..aeecccccchihbbbabaa.aaaaaababbbbbbkkbba..aabbbbijlljjjiabbba...',
      '..affffffdddccccallicccaaa.aeeccccccbjibbbbcaa..aaabbbabbbbbbkkbbaa..aabaajkaaaljjiaaaa...',
      '.aafffffcccdcccccallicccaa.aecccccccbljaahbaa.....abbbbabbbbbiabbba...aaijjaaaaaljjiaa....',
      '.affffffddddcccccailjhcccaaacccccccchmljiiaa......aabbbhabbbajbbbba....aiaaaddaaaaaaaaa...',
      '.aaffffcdddddccccciljhccccadcccccccakllljaa........aabbaiiijkbbbbba....aaabbdddaaddddcaa..',
      '.aacffcdddddcdddcajlljhcccacccccccajaaaaaaa.........aahiijkliaabbaa....abbbddddaaddddccaa.',
      'aaeeddddddddcdddaakaaaibccaccccccajaaccbaa...........aaaaalliiaaaaa...aabbbddddaaddddccca.',
      'aeecddddcdcccaaaaafeeaaaaaacccccaijhcccbaa..........aaeeeiaabbbbbbaa..abbbbddddaadddddcca.',
      'aeecdddddddcaaaaafddddeaaaaaaccaajkccccbca.........aaeeeeabbbbbbbbba..abbbbddddaadddddcca.',
      'aeecbddddddaaiiiaddddddeeaaiaaaijlacccccca........aaaeeeeabbbbbbbbba..aabbaaddaaaaccddcca.',
      'acccaddcaaaajjjiadddddddeeaaijjjllbcccbbbaa.......aeaeeeabbbbbbbbbaa...aaaajaaaikaaaaaaaa.',
      'acccaiaaaaijffddaadddddccccaabkllabbccbbbba......aaebaaabbbbbbbbbba...aaaafddaaakiajiiaaaa',
      'aabaajjjiafddddddadddddccccaacalabbbccbabaa......aeeabbbbbbbbabbbaa..aaaaeddddaacjjkcccaca',
      '.aaiiiabdadddddddaadddccccccabhibbbbbaabba.......aeebbbbbabbabbbaa..aacafddddddabhjcccccca',
      '..aiaadddadddddddkadddccccccachaaaaaaabaaa.......aebbbbbbbbaibbba...abbaaddddddaahjcccccca',
      '..aaaadddadddddddjaadcccccccaaaaaiiaaaaaaa.......aabbbbbbbbaibbaa...abbaaddddddaahjcccccca',
      '..aeeadddaaddddddcjaccabbbbaaaaahbabaaiacaa.....aaiabbbbbaaiaaaaaa..abbbaddddddcahjcccccba',
      '..adeadddaadddddddjaaaaaabbaaaaaaddddaaccca.....abiihaaaiijjjhaaaaaaabbbadddddddaijcccccba',
      '..aeeaedbbaddddddbaabbbbbbbaiiiiddddddaccaaa....aahhjijjaaabcccccccaaaaaaabbbbddajjccccaaa',
      '..aedabbbbaaddbbbbbabbbbbbaadjjiddddddbaaaaa...aabbbaajabbbbbccccccdaaaaaaaabbbbaiiccccaa.',
      '..aabaabbbaabbbbbbbaabbbbaaddjkcccdddbbaabbba..abbbbbaiabbbbbbcccccbbaaaabbbaaaaaiabbbbaa.',
      '...abbabbbbaabbbbbbaaaaaaaddcaiccccccbbaabbba.aabbbbbbabbbbbbbcccdbbbbaabbbbbbbaaibbbbaa..',
      '....abaabbbbaabbbbbaaaaadddccaiccccccbbbabbba.aabbbbbbaabbbbbbccccbbbbaabbbbbbaaiabbbaa...',
      '....aaaaabbbbaaaaaaa.aabbbbbbajacccccbbaabbba.aabbbbbajabbbbbbbcccbbbbaaaabbaaahabbaaa....',
      '........aaaaaaaa.....aaaaaaaaaaaaaaaaaaaaaaaa..aaaaaaaaaaaaaaaaaaaaaaaa.aaaaaaaaaaaa......',
    ],
  },
}

// Animates a bitmap by cutting it into parts, like a paper puppet. part(x, y) names the part of each
// pixel (worked out once per bitmap); offs[name] is [dx, dy] or (x, y) => [dx, dy]; order lists the
// parts back to front. under[name] = { col, off } first paints that part's pixels in one colour at
// offset off, which is what shows where the part has moved away (e.g. the inside of an open mouth).
function bmpRig(s, b, ox, oy, part, offs, order, under = {}) {
  if (!b.parts) b.parts = b.rows.map((row, y) => Array.from(row, (_, x) => part(x, y)))
  const put = (x, y, c) => s.pix.push([Math.round(ox + x), Math.round(oy + y), c])
  const each = (name, fn) =>
    b.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++)
        if (row[x] !== '.' && b.parts[y][x] === name) fn(x, y, row.charCodeAt(x) - 97)
    })
  const at = (o, x, y) => (typeof o === 'function' ? o(x, y) : o || [0, 0])
  // depth = how many pixels in from the outline (worked out once); an under fill can skip the rim (u.inner)
  if (!b.depth) {
    const W = b.rows[0].length,
      H = b.rows.length,
      solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && b.rows[y][x] !== '.'
    b.depth = b.rows.map((row, y) => Array.from(row, (c, x) => (c === '.' ? 0 : 1)))
    for (let d = 1; d < 4; d++)
      b.depth = b.depth.map((row, y) =>
        row.map((v, x) =>
          v === d &&
          [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ].every(([dx, dy]) => solid(x + dx, y + dy) && b.depth[y + dy][x + dx] >= d)
            ? d + 1
            : v
        )
      )
  }
  for (const [name, u] of Object.entries(under))
    each(name, (x, y) => {
      if (b.depth[y][x] <= (u.inner || 0)) return
      const [dx, dy] = at(u.off, x, y)
      put(x + dx, y + dy, u.col)
    })
  for (const name of order)
    each(name, (x, y, k) => {
      const [dx, dy] = at(offs[name], x, y)
      put(x + dx, y + dy, b.pal[k])
    })
}

// The golem's rocks as the owner circled them on the preview (2026-11-08), as ellipses on the 90 x 87
// bitmap: name, centre x, centre y, radius x, radius y. Each pixel belongs to the nearest rock, except
// the chest in the middle, which nobody circled and stays as the body.
const GOLEM_ROCKS = [
  ['head', 62, 15, 12, 9],
  ['shoulderB', 29, 15, 14.4, 12.4],
  ['upperB', 22, 30, 13, 9],
  ['foreB', 17, 49, 11, 11],
  ['fistB', 17, 69, 11, 10],
  ['thighB', 41, 57, 8, 9],
  ['shinB', 37, 72, 8, 12],
  ['thighF', 57, 61, 8, 7],
  ['footF', 58, 78, 11, 8],
  ['shoulderF', 74, 28, 8, 7.6],
  ['upperF', 74, 41, 7.6, 3.6],
  ['foreF', 76, 56, 9, 8],
  ['fistF', 77, 75, 9, 8],
]
function golemRock(x, y) {
  let best = Infinity,
    name = 'body'
  for (const [n, cx, cy, rx, ry] of GOLEM_ROCKS) {
    const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
    if (d < best) [best, name] = [d, n]
  }
  return best > 1 && x >= 36 && x <= 67 && y >= 16 && y <= 52 ? 'body' : name
}
