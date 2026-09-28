import { PillarKey, SajuResult, ZHI_HANGUL, pillarsOf } from './saju';
import { getContent } from './contentStore';
import type { SinsalInfo, SinsalKey } from './content/sinsal';

/*
 * 신살 rules. Schools differ; the choices below follow what Korean 만세력 apps most
 * commonly use and should be confirmed during expert review:
 *  - 도화·역마·화개: from BOTH the year branch and the day branch (삼합 group of the base).
 *  - 천을귀인: 甲戊庚→丑未, 乙己→子申, 丙丁→亥酉, 辛→寅午, 壬癸→巳卯 (day stem).
 *  - 양인: yang day stems only.
 *  - 괴강: 庚辰·庚戌·壬辰·壬戌·戊戌, in any pillar. 백호: the 7 classic pillars, in any pillar.
 *  - 공망: 일주 순중공망, checked on the year/month/hour branches.
 * An unknown birth hour simply leaves the hour pillar out (pillarsOf does this).
 */

type Group = 'fire' | 'water' | 'metal' | 'wood';
const SAMHAP: Record<string, Group> = {
  寅: 'fire', 午: 'fire', 戌: 'fire',
  申: 'water', 子: 'water', 辰: 'water',
  巳: 'metal', 酉: 'metal', 丑: 'metal',
  亥: 'wood', 卯: 'wood', 未: 'wood',
};
const DOHWA: Record<Group, string> = { fire: '卯', water: '酉', metal: '午', wood: '子' };
const YEOKMA: Record<Group, string> = { fire: '申', water: '寅', metal: '亥', wood: '巳' };
const HWAGAE: Record<Group, string> = { fire: '戌', water: '辰', metal: '丑', wood: '未' };

const CHEONEUL: Record<string, string> = { 甲: '丑未', 戊: '丑未', 庚: '丑未', 乙: '子申', 己: '子申', 丙: '亥酉', 丁: '亥酉', 辛: '寅午', 壬: '巳卯', 癸: '巳卯' };
const MUNCHANG: Record<string, string> = { 甲: '巳', 乙: '午', 丙: '申', 丁: '酉', 戊: '申', 己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯' };
const HONGYEOM: Record<string, string> = { 甲: '午', 乙: '午', 丙: '寅', 丁: '未', 戊: '辰', 己: '辰', 庚: '戌', 辛: '酉', 壬: '子', 癸: '申' };
const YANGIN: Record<string, string> = { 甲: '卯', 丙: '午', 戊: '午', 庚: '酉', 壬: '子' };
const BAEKHO = ['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '壬戌', '癸丑'];
const GOEGANG = ['庚辰', '庚戌', '壬辰', '壬戌', '戊戌'];

const GAN = '甲乙丙丁戊己庚辛壬癸';
const ZHI = '子丑寅卯辰巳午未申酉戌亥';

/** The two branches left out of the 순(旬) the day pillar belongs to. */
export function gongmangOf(dayGanZhi: string): [string, string] {
  const firstZhi = (ZHI.indexOf(dayGanZhi[1]) - GAN.indexOf(dayGanZhi[0]) + 12) % 12;
  return [ZHI[(firstZhi + 10) % 12], ZHI[(firstZhi + 11) % 12]];
}

export const POSITION_ZHI_LABEL: Record<PillarKey, string> = { year: '년지', month: '월지', day: '일지', hour: '시지' };
export const POSITION_PILLAR_LABEL: Record<PillarKey, string> = { year: '년주', month: '월주', day: '일주', hour: '시주' };

export type SinsalHit = {
  key: SinsalKey;
  info: SinsalInfo;
  /** Where it sits, in pillar order. */
  positions: PillarKey[];
  /** 백호·괴강 are read from a whole pillar (간지); the rest from a branch. */
  byPillar: boolean;
  basis: string;
};

const ORDER: SinsalKey[] = ['cheoneul', 'munchang', 'dohwa', 'hongyeom', 'yeokma', 'hwagae', 'yangin', 'baekho', 'goegang', 'gongmang'];

export function sinsalOf(saju: SajuResult): SinsalHit[] {
  const { SINSAL } = getContent();
  const pillars = pillarsOf(saju);
  const found = new Map<SinsalKey, { positions: Set<PillarKey>; basis: string[]; byPillar: boolean }>();
  const add = (key: SinsalKey, at: PillarKey[], basis: string, byPillar = false) => {
    if (at.length === 0) return;
    const entry = found.get(key) ?? { positions: new Set<PillarKey>(), basis: [], byPillar };
    at.forEach((p) => entry.positions.add(p));
    entry.basis.push(basis);
    found.set(key, entry);
  };
  const branchesEqual = (target: string, except?: PillarKey) => pillars.filter((p) => p.key !== except && p.pillar.zhi === target).map((p) => p.key);
  const branchesIn = (targets: string) => pillars.filter((p) => targets.includes(p.pillar.zhi)).map((p) => p.key);
  const zhiLabel = (z: string) => `${z}(${ZHI_HANGUL[z]})`;

  for (const base of ['year', 'day'] as const) {
    const baseZhi = saju[base].zhi;
    const group = SAMHAP[baseZhi];
    const baseLabel = `${POSITION_ZHI_LABEL[base]} ${zhiLabel(baseZhi)} 기준`;
    add('dohwa', branchesEqual(DOHWA[group], base), `${baseLabel} 도화는 ${zhiLabel(DOHWA[group])}`);
    add('yeokma', branchesEqual(YEOKMA[group], base), `${baseLabel} 역마는 ${zhiLabel(YEOKMA[group])}`);
    add('hwagae', branchesEqual(HWAGAE[group], base), `${baseLabel} 화개는 ${zhiLabel(HWAGAE[group])}`);
  }

  const dayGan = saju.dayGan;
  const ganLabel = `일간 ${dayGan} 기준`;
  const list = (s: string) => [...s].map(zhiLabel).join('·');
  add('cheoneul', branchesIn(CHEONEUL[dayGan]), `${ganLabel} 천을귀인은 ${list(CHEONEUL[dayGan])}`);
  add('munchang', branchesIn(MUNCHANG[dayGan]), `${ganLabel} 문창귀인은 ${list(MUNCHANG[dayGan])}`);
  add('hongyeom', branchesIn(HONGYEOM[dayGan]), `${ganLabel} 홍염은 ${list(HONGYEOM[dayGan])}`);
  if (YANGIN[dayGan]) add('yangin', branchesIn(YANGIN[dayGan]), `${ganLabel} 양인은 ${list(YANGIN[dayGan])}`);

  const pillarsWith = (set: string[]) => pillars.filter((p) => set.includes(p.pillar.ganZhi));
  const baekho = pillarsWith(BAEKHO);
  add('baekho', baekho.map((p) => p.key), `백호살에 해당하는 간지 ${baekho.map((p) => p.pillar.ganZhi).join('·')}`, true);
  const goegang = pillarsWith(GOEGANG);
  add('goegang', goegang.map((p) => p.key), `괴강살에 해당하는 간지 ${goegang.map((p) => p.pillar.ganZhi).join('·')}`, true);

  const empty = gongmangOf(saju.day.ganZhi);
  add(
    'gongmang',
    pillars.filter((p) => p.key !== 'day' && empty.includes(p.pillar.zhi)).map((p) => p.key),
    `일주 ${saju.day.ganZhi}의 공망은 ${empty.map(zhiLabel).join('·')}`,
  );

  const pillarOrder = pillars.map((p) => p.key);
  return ORDER.filter((key) => found.has(key)).map((key) => {
    const entry = found.get(key)!;
    return {
      key,
      info: SINSAL[key],
      positions: pillarOrder.filter((p) => entry.positions.has(p)),
      byPillar: entry.byPillar,
      basis: entry.basis.join(' · '),
    };
  });
}
