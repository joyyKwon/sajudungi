import { PillarKey, SajuResult, ZHI_HANGUL, WuXing, pillarsOf } from './saju';
import { getContent } from './contentStore';
import { ELEMENT_HANGUL, ELEMENT_HANJA } from './sajuContent';

export type ZhiRelationKind = 'hap' | 'chung';

export type ZhiRelation = {
  kind: ZhiRelationKind;
  a: PillarKey;
  b: PillarKey;
  /** e.g. "년주 · 월주". */
  label: string;
  /** e.g. "축(丑) · 자(子)", in pillar order (a then b). */
  pairHangul: string;
  title: string;
  body: string;
  /** Only for 육합: the element line, e.g. "토(土) 기운으로 힘을 합쳐요". */
  transformsToLine: string | null;
};

const PILLAR_LABEL: Record<PillarKey, string> = { year: '년주', month: '월주', day: '일주', hour: '시주' };

function lookup(table: Record<string, { title: string; body: string; transformsTo?: WuXing }>, zhiA: string, zhiB: string) {
  return table[zhiA + zhiB] ?? table[zhiB + zhiA] ?? null;
}

/**
 * 합·충 관계가 있는 지지 쌍을 모두 찾는다. 년/월/일/시 중 두 기둥씩 짝지어 보고(시주가 없으면
 * 세 기둥만), 육합과 충 표에 있는 쌍만 돌려준다. 같은 지지가 겹치는 경우(자형)는 다루지 않는다.
 */
export function zhiRelationsOf(saju: SajuResult): ZhiRelation[] {
  const { ZHI_HAP, ZHI_CHUNG } = getContent();
  const pillars = pillarsOf(saju);
  const out: ZhiRelation[] = [];

  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const A = pillars[i];
      const B = pillars[j];
      const zhiA = A.pillar.zhi;
      const zhiB = B.pillar.zhi;
      if (zhiA === zhiB) continue;

      const hap = lookup(ZHI_HAP, zhiA, zhiB);
      const chung = hap ? null : lookup(ZHI_CHUNG, zhiA, zhiB);
      const found = hap ?? chung;
      if (!found) continue;

      out.push({
        kind: hap ? 'hap' : 'chung',
        a: A.key,
        b: B.key,
        label: `${PILLAR_LABEL[A.key]} · ${PILLAR_LABEL[B.key]}`,
        pairHangul: `${zhiA}(${ZHI_HANGUL[zhiA]}) · ${zhiB}(${ZHI_HANGUL[zhiB]})`,
        title: found.title,
        body: found.body,
        transformsToLine: found.transformsTo ? `${ELEMENT_HANGUL[found.transformsTo]}(${ELEMENT_HANJA[found.transformsTo]}) 기운으로 힘을 합쳐요.` : null,
      });
    }
  }
  return out;
}
