/**
 * 养老金测算 - 单元测试
 * 运行：node src/test_calc.js
 */

const { cg, atpv, calcAll, BS, SS } = require('./calc.js');

let pass = 0, fail = 0;

function assert(name, actual, expected, tolerance = 0.01) {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (ok) { pass++; }
  else {
    fail++;
    console.log(`  ❌ ${name}: 期望 ${expected}, 实际 ${actual.toFixed(2)}`);
  }
}

function section(title) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(50));
}

// ============================================================
section('1. 复利基础函数 cg()');
// ============================================================
// cg(P, r, n) = P × (1+r)^n

// 1000元，3.55%利率，10年 → 1000 × 1.0355^10
assert('cg: 1000×3.55%×10年', cg(1000, 0.0355, 10), 1000 * Math.pow(1.0355, 10));
assert('cg: n=0 返回本金', cg(5000, 0.0355, 0), 5000);
assert('cg: n<0 返回本金', cg(5000, 0.0355, -1), 5000);
assert('cg: 1年', cg(1000, 0.0355, 1), 1035.5);

// ============================================================
section('2. 年金复利函数 atpv()');
// ============================================================
// atpv(P, sY, eY, tY, r) = Σ P × (1+r)^(tY-y), y=sY..eY, tY-y>0

// 每年5000元，2026-2031年，复利至2031年
// 2026: 5000×1.0355^5, 2027: 5000×1.0355^4, ..., 2030: 5000×1.0355^1, 2031: n=0 不计
const expected_5yr = [5,4,3,2,1].reduce((s,n) => s + 5000*Math.pow(1.0355,n), 0);
assert('atpv: 5000×6年(2026-2031)→2031', atpv(5000, 2026, 2031, 2031, 0.0355), expected_5yr);

// 1年缴费，等价于 cg
assert('atpv: 1年等价于cg', atpv(5000, 2030, 2030, 2031, 0.0355), cg(5000, 0.0355, 1));

// sY==eY 单年
assert('atpv: 单年缴费', atpv(200, 2020, 2020, 2031, 0.0355), 200 * Math.pow(1.0355, 11));

// ============================================================
section('3. 补贴标准映射');
// ============================================================
assert('BS: 200→35', BS[200], 35);
assert('BS: 5000→300', BS[5000], 300);
assert('SS: 200→70', SS[200], 70);
assert('SS: 5000→600', SS[5000], 600);

// ============================================================
section('4. 默认参数完整计算');
// ============================================================
// 默认参数：1971年出生，当前2026年
// 基本险历史：2011-2022年，5000/年，补缴3年×5000
// 基本险未来：2026-2031年，5000/年
// 补充险历史：2021年，5000/年，补缴4年×5000
// 补充险未来：2026-2036年，5000/年
// 子女资助：均为0

const d = {
  vBy: '1971', vCy: '2026',
  vBhs: '2011', vBhe: '2022', vBha: '5000',
  cBg: true, vBgn: '3', vBga: '5000', vBgy: '2026',
  vBfs: '2026', vBfa: '5000', vBc: '0',
  vShs: '2021', vShe: '2021', vSha: '5000',
  cSg: true, vSgn: '4', vSga: '5000', vSgy: '2026',
  vSfs: '2026', vSfa: '5000', vSc: '0'
};

const r = calcAll(d);

console.log('\n--- 关键输入 ---');
console.log(`出生年份: ${r.by}, 60岁: ${r.a60}, 65岁: ${r.a65}`);
console.log(`复利利率: ${r.rate} = 3.55%`);
console.log(`基本险历史年数: ${r.byr}, 未来: ${r.bfs}-${r.bfe}(${r.bfe-r.bfs+1}年)`);
console.log(`补充险历史年数: ${r.syr}, 未来: ${r.sfs}-${r.sfe}(${r.sfe-r.sfs+1}年)`);

console.log('\n--- 基本险账户明细 ---');
console.log(`历史缴费复利: ${r.bHistPV.toFixed(2)} (本金${r.byr*5000})`);
console.log(`补缴复利: ${r.bGpv.toFixed(2)} (本金${r.bgn*r.bga})`);
console.log(`未来缴费复利: ${r.bFpv.toFixed(2)} (本金${(r.bfe-r.bfs+1)*r.bfa})`);
console.log(`政府补贴复利: ${r.bSpv.toFixed(2)} (本金${(r.bfe-r.bfs+1)*r.bsub})`);
console.log(`子女资助复利: ${r.bCpv.toFixed(2)}`);
console.log(`基本险账户总额: ${r.bTot.toFixed(2)}`);

console.log('\n--- 补充险账户明细 ---');
console.log(`历史缴费复利: ${r.sHistPV.toFixed(2)}`);
console.log(`补缴复利: ${r.sGpv.toFixed(2)}`);
console.log(`未来缴费复利: ${r.sFpv.toFixed(2)}`);
console.log(`政府补贴复利: ${r.sSpv.toFixed(2)}`);
console.log(`子女资助复利: ${r.sCpv.toFixed(2)}`);
console.log(`补充险账户总额: ${r.sTot.toFixed(2)}`);

console.log('\n--- 月领计算 ---');
console.log(`正常缴费年数: ${r.nYr} (= 历史${r.byr} + 未来${r.bfe-r.bfs+1})`);
console.log(`年限养老金加成: ${r.eYr} 元/月 (超15年${r.eYr}年)`);
console.log(`基本险个人账户养老金: ${r.bAcct.toFixed(2)} = ${r.bTot.toFixed(2)}÷139`);
console.log(`60岁月领: ${r.m60.toFixed(2)} = 176 + ${r.bAcct.toFixed(2)} + ${r.eYr}`);
console.log(`补充险个人账户养老金: ${r.sAcct.toFixed(2)} = ${r.sTot.toFixed(2)}÷120`);
console.log(`65岁月领: ${r.m65.toFixed(2)} = ${r.m60.toFixed(2)} + ${r.sAcct.toFixed(2)} + 20 + 5`);

console.log('\n--- 回报分析 ---');
console.log(`总投入本金: ${r.tPp.toFixed(0)}`);
console.log(`政府补贴本金: ${r.tGs.toFixed(0)}`);
console.log(`回本年龄: ${r.pba}岁`);
console.log(`领至80岁累计: ${r.c80.toFixed(0)}`);
console.log(`80岁回报率: ${r.roi.toFixed(1)}%`);

// 关键断言
assert('a60=2031', r.a60, 2031);
assert('a65=2036', r.a65, 2036);
assert('基本险历史年数=12', r.byr, 12);
assert('基本险未来年数=6', r.bfe - r.bfs + 1, 6);
assert('补充险历史年数=1', r.syr, 1);
assert('补充险未来年数=11', r.sfe - r.sfs + 1, 11);
assert('年限养老金加成=3', r.eYr, 3); // nYr=18-15=3

// ============================================================
section('5. 子女资助计算');
// ============================================================
// 子女资助基本险：从当前年份(cy=2026)到60岁当年(a60=2031)
// 子女资助补充险：从当前年份(cy=2026)到65岁当年(a65=2036)
const d2 = { ...d, vBc: '1000', vSc: '2000' };
const r2 = calcAll(d2);
assert('基本险子女资助起始=cy', r2.bcStart, 2026);
assert('补充险子女资助起始=cy', r2.scs, 2026);
// 基本险子女资助：cy(2026)→a60(2031)，atpv(1000, 2026, 2031, 2031, 0.0355)
assert('基本险子女资助值', r2.bCpv, atpv(1000, 2026, 2031, 2031, 0.0355));
// 补充险子女资助：cy(2026)→a65(2036)，atpv(2000, 2026, 2036, 2036, 0.0355)
assert('补充险子女资助值', r2.sCpv, atpv(2000, 2026, 2036, 2036, 0.0355));

// ============================================================
section('6. 边界条件');
// ============================================================
// 不补缴
const d3 = { ...d, cBg: false, cSg: false };
const r3 = calcAll(d3);
assert('不补缴时bGpv=0', r3.bGpv, 0);
assert('不补缴时sGpv=0', r3.sGpv, 0);

// 1975年出生 → a60=2035, a65=2040
const d4 = { ...d, vBy: '1975' };
const r4 = calcAll(d4);
assert('1975年出生a60=2035', r4.a60, 2035);
assert('1975年出生a65=2040', r4.a65, 2040);

// ============================================================
// 结果汇总
// ============================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`  测试结果: ${pass} 通过, ${fail} 失败`);
console.log('='.repeat(50));
if (fail > 0) process.exit(1);
