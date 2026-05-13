/**
 * 养老金测算 - 计算引擎（纯函数，零DOM依赖）
 * 可用 Node.js 直接运行单元测试验证
 */

// ===== 山西省补贴标准 =====
const BS = { 200:35, 300:40, 500:60, 700:80, 1000:100, 1500:140, 2000:180, 3000:220, 4000:260, 5000:300 };
const SS = { 200:70, 500:120, 1000:200, 2000:360, 5000:600 };

// ===== 复利基础函数 =====

/**
 * 一次性复利：本金 P 按利率 r 经过 n 年后的终值
 * 公式：P × (1+r)^n
 * @param {number} P 本金
 * @param {number} r 年利率（如 0.0355）
 * @param {number} n 年数
 * @returns {number} 复利终值
 */
function cg(P, r, n) {
  if (n <= 0) return P;
  return P * Math.pow(1 + r, n);
}

/**
 * 年金复利终值：从 sY 年到 eY 年每年缴纳 P 元，按利率 r 复利至 tY 年的终值
 * 公式：Σ(P × (1+r)^(tY-y))，y 从 sY 到 eY，仅当 tY-y > 0 时累加
 * @param {number} P 每年缴纳金额
 * @param {number} sY 开始缴费年份
 * @param {number} eY 截止缴费年份
 * @param {number} tY 目标年份（复利截止年份）
 * @param {number} r 年利率
 * @returns {number} 年金复利终值
 */
function atpv(P, sY, eY, tY, r) {
  let t = 0;
  for (let y = sY; y <= eY; y++) {
    const n = tY - y;
    if (n > 0) t += P * Math.pow(1 + r, n);
  }
  return t;
}

// ===== 主计算函数 =====

/**
 * 根据输入参数计算所有养老金指标
 * @param {object} d 表单数据对象
 * @returns {object} 计算结果对象
 */
function calcAll(d) {
  const by = parseInt(d.vBy) || 1971;
  const cy = parseInt(d.vCy) || 2026;  // 当前年份
  const rate = 0.0355;  // 山西省社保记账利率
  const a60 = by + 60;  // 60岁所在年份
  const a65 = by + 65;  // 65岁所在年份

  // ===== 基本险 =====
  const bs = parseInt(d.vBhs) || 2011;  // 历史缴费开始年份
  const be = parseInt(d.vBhe) || 2022;  // 历史缴费截止年份
  const byr = Math.max(0, be - bs + 1); // 历史正常缴费年数
  const bam = parseInt(d.vBha) || 200;   // 历史每年缴费金额

  // 基本险-历史缴费复利终值（至60岁）
  const bHistPV = atpv(bam, bs, be, a60, rate);

  // 基本险-断缴补缴
  const bGap = !!d.cBg;
  const bgn = bGap ? (parseInt(d.vBgn) || 0) : 0;    // 断缴年数
  const bga = bGap ? (parseInt(d.vBga) || 0) : 0;    // 补缴金额/年
  const bgy = cy; // 补缴年份 = 当前年份（不可修改）
  const bGp = bgn * bga;                              // 补缴本金总额
  // 补缴视为一次性缴纳，整体按 (1+r)^(a60-bgy) 复利
  const bGpv = bGp > 0 ? cg(bGp, rate, a60 - bgy) : 0;

  // 基本险-未来正常缴费
  const bfs = parseInt(d.vBfs) || 2026;  // 未来缴费开始年份
  const bfe = a60;                        // 未来缴费截止年份 = 60岁所在年份
  const bfa = parseInt(d.vBfa) || 5000;   // 未来每年缴费金额

  // 未来缴费复利终值（至60岁）
  const bFpv = atpv(bfa, bfs, bfe, a60, rate);

  // 基本险-政府补贴
  // NOTE: 仅计算"未来正常缴费"年份的补贴；历史缴费的补贴因2025年前利率非3.55%，
  // 增减互相抵消，故不单独计入。如需补充历史补贴，可增加 atpv(bsub_hist, bs, be, a60, rate)
  const bsub = BS[bfa] || 0;
  const bSpv = atpv(bsub, bfs, bfe, a60, rate);

  // 基本险-子女资助（从当前年份cy到60岁(bfe)，无补贴）
  // NOTE: 子女资助起始年份为当前年份，截止60岁当年
  const bc = parseInt(d.vBc) || 0;
  const bcStart = cy;  // 子女资助基本险开始年份 = 当前年份
  const bCpv = bc > 0 ? atpv(bc, bcStart, bfe, a60, rate) : 0;

  // 基本险账户总额 = 历史 + 补缴 + 未来 + 补贴 + 资助（全部复利至60岁）
  const bTot = bHistPV + bGpv + bFpv + bSpv + bCpv;

  // ===== 补充险 =====
  const ss = parseInt(d.vShs) || 2021;
  const se = parseInt(d.vShe) || 2021;
  const syr = Math.max(0, se - ss + 1);
  const sam = parseInt(d.vSha) || 200;

  // 补充险-历史缴费复利终值（至65岁）
  const sHistPV = atpv(sam, ss, se, a65, rate);

  // 补充险-断缴补缴
  const sGap = !!d.cSg;
  const sgn = sGap ? (parseInt(d.vSgn) || 0) : 0;
  const sga = sGap ? (parseInt(d.vSga) || 0) : 0;
  const sgy = cy; // 补缴年份 = 当前年份（不可修改）
  const sGp = sgn * sga;
  const sGpv = sGp > 0 ? cg(sGp, rate, a65 - sgy) : 0;

  // 补充险-未来正常缴费
  const sfs = parseInt(d.vSfs) || 2026;
  const sfe = a65;  // 截止年份 = 65岁所在年份
  const sfa = parseInt(d.vSfa) || 5000;
  const sFpv = atpv(sfa, sfs, sfe, a65, rate);

  // 补充险-政府补贴
  // NOTE: 同基本险，仅计算未来缴费年份的补贴
  const ssub = SS[sfa] || 0;
  const sSpv = atpv(ssub, sfs, sfe, a65, rate);

  // 补充险-子女资助（从当前年份cy到65岁(sfe)，无补贴）
  // NOTE: 子女资助补充险起始年份为当前年份（而非60岁），截止65岁当年
  const sc = parseInt(d.vSc) || 0;
  const scs = cy;  // 子女资助补充险开始年份 = 当前年份
  const sCpv = sc > 0 ? atpv(sc, scs, sfe, a65, rate) : 0;

  // 补充险账户总额（全部复利至65岁）
  const sTot = sHistPV + sGpv + sFpv + sSpv + sCpv;

  // ===== 月领计算 =====
  const bPn = 176;  // 基础养老金（元/月，山西省标准）
  const eB = 5;     // 高龄补贴（元/月，65岁后）
  const eS = 20;    // 补充险出口补贴（元/月，65岁起）
  const yB = 15;    // 年限养老金起算年数

  // 正常缴费总年数 = 历史年数 + 未来年数（补缴不计入年限养老金）
  const nYr = byr + (bfe - bfs + 1);
  // 超过15年的年数，每年 +1元/月
  const eYr = Math.max(0, nYr - yB);

  // 个人账户养老金 = 账户总额 ÷ 计发月数
  const bAcct = bTot / 139;  // 基本险计发月数139
  const sAcct = sTot / 120;  // 补充险计发月数120

  // 60岁月领 = 基础养老金 + 基本险个人账户养老金 + 年限养老金
  const m60 = bPn + bAcct + eYr;
  // 65岁月领 = 60岁月领 + 补充险个人账户养老金 + 出口补贴 + 高龄补贴
  const m65 = m60 + sAcct + eS + eB;

  // ===== 回报分析 =====
  // 总投入本金（不含政府补贴）
  const tPp = byr * bam                                    // 基本险历史
            + bGp                                          // 基本险补缴
            + (bfe - bfs + 1) * bfa                        // 基本险未来
            + syr * sam                                    // 补充险历史
            + sGp                                          // 补充险补缴
            + (sfe - sfs + 1) * sfa                        // 补充险未来
            + (bc > 0 ? (bfe - bcStart + 1) * bc : 0)     // 子女资助基本险
            + (sc > 0 ? (sfe - scs + 1) * sc : 0);        // 子女资助补充险

  // 政府补贴本金
  const tGs = (bfe - bfs + 1) * bsub + (sfe - sfs + 1) * ssub;

  // 回本年龄：从60岁开始逐年累加月领×12，超过总投入的年份
  let pba = null, c80 = 0, cum = 0;
  for (let age = 60; age <= 95; age++) {
    const mon = age >= 65 ? m65 : m60;
    cum += mon * 12;
    if (age <= 80) c80 += mon * 12;
    if (cum >= tPp && pba === null) pba = age;
  }

  // 80岁回报率 = (领至80岁总额 - 总投入) / 总投入 × 100%
  const roi = tPp > 0 ? (c80 - tPp) / tPp * 100 : 0;

  return {
    by, cy, a60, a65, bTot, sTot,
    bHistPV, bGpv, bFpv, bSpv, bCpv,
    sHistPV, sGpv, sFpv, sSpv, sCpv,
    byr, bgn, bga, bgy, bfs, bfe, bfa, bsub, bcam: bc, bcStart,
    syr, sgn, sga, sgy, sfs, sfe, sfa, ssub, scam: sc, scs,
    bPn, eB, eS, yB, eYr, bAcct, sAcct, m60, m65,
    tPp, tGs, pba, c80, roi, nYr, rate
  };
}

// Node.js 环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { cg, atpv, calcAll, BS, SS };
}
