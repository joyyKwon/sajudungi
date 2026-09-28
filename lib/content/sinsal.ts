import type { PillarKey } from '../saju';

// NOTE: AI-drafted text, not reviewed by a 명리 expert (see tenGods.ts).
// Traditionally frightening 신살 (백호·양인·괴강·공망) are written as temperament and
// pacing tips, never as predictions of accidents or misfortune. The rules that decide
// which 신살 apply live in lib/sinsal.ts.

export type SinsalKey = 'dohwa' | 'yeokma' | 'hwagae' | 'cheoneul' | 'munchang' | 'hongyeom' | 'yangin' | 'baekho' | 'goegang' | 'gongmang';

export type SinsalInfo = {
  name: string;
  hanja: string;
  title: string;
  body: string;
};

export const SINSAL: Record<SinsalKey, SinsalInfo> = {
  dohwa: {
    name: '도화살',
    hanja: '桃花殺',
    title: '사람을 끄는 매력',
    body: '복숭아꽃처럼 사람들의 눈길을 모으는 기운이에요. 옛날에는 이성 문제를 조심하라는 뜻으로 풀었지만, 요즘은 매력과 인기, 표현력으로 봐요. 처음 만난 사람과도 금방 분위기를 만들고, 나를 드러내는 일에서 힘을 발휘하기 쉬워요.',
  },
  yeokma: {
    name: '역마살',
    hanja: '驛馬殺',
    title: '움직이는 힘',
    body: '한곳에 머물기보다 움직이고 넓혀가는 기운이에요. 이동, 여행, 이사처럼 새로운 환경에 적응하는 힘이 좋아요. 반복되는 일상보다 활동 반경이 넓은 일에서 더 살아나는 편이에요.',
  },
  hwagae: {
    name: '화개살',
    hanja: '華蓋殺',
    title: '혼자 깊어지는 시간',
    body: '화려한 덮개라는 뜻으로, 예술·학문·종교처럼 정신적인 세계에 끌리는 기운이에요. 혼자 생각을 정리하는 시간이 필요하고, 한 분야를 깊이 파고들어 자기만의 세계를 만드는 힘이 있어요.',
  },
  cheoneul: {
    name: '천을귀인',
    hanja: '天乙貴人',
    title: '도움을 부르는 복',
    body: '신살 중 가장 좋은 길신으로 꼽혀요. 어려운 순간에 도와주는 사람이나 길이 나타나기 쉬운 기운이에요. 평소에 쌓은 인연이 중요한 순간에 힘이 되는 편이에요.',
  },
  munchang: {
    name: '문창귀인',
    hanja: '文昌貴人',
    title: '글과 배움의 재능',
    body: '글, 공부, 시험, 말로 정리하는 일에 재능을 주는 기운이에요. 배운 것을 이해하기 쉽게 풀어내는 힘이 좋아서, 기록하거나 가르치는 일과 잘 맞아요.',
  },
  hongyeom: {
    name: '홍염살',
    hanja: '紅艶殺',
    title: '은근한 감성과 멋',
    body: '감정 표현이 풍부하고 멋을 아는 기운이에요. 도화살이 밖으로 드러나는 매력이라면, 홍염살은 은근히 풍기는 분위기와 감수성에 가까워요. 꾸미는 일이나 예술적인 감각에서 재능이 드러나기 쉬워요.',
  },
  yangin: {
    name: '양인살',
    hanja: '羊刃殺',
    title: '날카로운 결단력',
    body: '일간의 힘이 아주 강해지는 자리예요. 자기 주장이 분명하고 승부욕과 실행력이 뛰어나요. 힘이 센 만큼 부딪히는 일이 생기기 쉬우니, 한 박자 쉬고 말하는 습관이 큰 도움이 돼요.',
  },
  baekho: {
    name: '백호살',
    hanja: '白虎殺',
    title: '강한 추진력',
    body: '기운이 세고 결단이 빠른 성향이에요. 옛날에는 사고를 조심하라는 뜻으로 무섭게 풀었지만, 요즘은 밀어붙이는 힘과 강단으로 봐요. 힘이 넘치는 만큼 쉬는 때를 정해두고 페이스를 조절하면 좋아요.',
  },
  goegang: {
    name: '괴강살',
    hanja: '魁罡殺',
    title: '앞장서는 배짱',
    body: '북두칠성의 머리를 뜻하는 기운으로, 리더십과 배짱이 강한 성향이에요. 스스로 판단하고 앞장서는 힘이 있어 책임 있는 자리에서 빛나기 쉬워요. 고집이 세 보일 수 있으니 다른 의견을 들어보는 여유를 곁들이면 좋아요.',
  },
  gongmang: {
    name: '공망',
    hanja: '空亡',
    title: '비어 있어 자유로운 자리',
    body: '공망은 "비어 있다"는 뜻으로, 그 자리의 일은 기대보다 결과가 늦게 따라오기 쉬운 기운이에요. 대신 욕심을 내려놓게 되어 정신적인 가치나 새로운 관점에 마음이 열리는 편이에요. 해당 자리의 일은 조급해하지 말고 길게 보면 좋아요.',
  },
};

/** What each seat of the chart stands for, shown as "어디에: 월지(사회생활·일)". */
export const SINSAL_POSITION: Record<PillarKey, string> = {
  year: '어린 시절·집안과 윗사람',
  month: '사회생활·일',
  day: '나 자신·배우자',
  hour: '가까운 관계·후반생',
};

export const SINSAL_REPEATED = '두 자리 이상에 있어 이 기운이 더 뚜렷한 편이에요.';

export const SINSAL_NONE = '두드러진 신살이 없어요. 한쪽으로 쏠린 기운 없이 무난하게 균형을 잡는 편이에요.';
