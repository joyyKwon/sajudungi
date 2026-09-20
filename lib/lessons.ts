// NOTE: AI-drafted curriculum, not reviewed by a 명리 expert. Cards with a
// `personal` flag are filled from the user's own chart at render time.

export type LessonChip = { glyph: string; caption?: string };

export type LessonCard = {
  title: string;
  body: string;
  chips?: LessonChip[];
  /** Replace body/chips with values computed from the user's saju. */
  personal?: 'dayGan' | 'elements' | 'tenGods';
};

export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  cards: LessonCard[];
};

const GAN = '甲乙丙丁戊己庚辛壬癸'.split('');
const GAN_KO = '갑을병정무기경신임계'.split('');
const ZHI = '子丑寅卯辰巳午未申酉戌亥'.split('');
const ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const HOURS = ['23~01시', '01~03시', '03~05시', '05~07시', '07~09시', '09~11시', '11~13시', '13~15시', '15~17시', '17~19시', '19~21시', '21~23시'];

export const LESSONS: Lesson[] = [
  {
    id: '1',
    title: '1강 · 사주란 무엇일까?',
    subtitle: '사주팔자의 기본 개념 이해하기',
    cards: [
      {
        title: '사주는 네 개의 기둥이에요',
        body: "태어난 해·달·날·시, 이 네 가지를 각각 하나의 '기둥(柱)'으로 보고 네 기둥을 합쳐 '사주(四柱)'라고 불러요.",
        chips: [
          { glyph: '年', caption: '년주' },
          { glyph: '月', caption: '월주' },
          { glyph: '日', caption: '일주' },
          { glyph: '時', caption: '시주' },
        ],
      },
      {
        title: '기둥마다 글자가 두 개씩',
        body: "한 기둥은 위 글자(천간)와 아래 글자(지지) 두 글자로 이루어져요. 네 기둥 × 두 글자 = 여덟 글자, 그래서 '사주팔자(四柱八字)'예요.",
      },
      {
        title: '만세력으로 여덟 글자를 뽑아요',
        body: '태어난 날짜와 시간을 만세력(달력)에 대보면 여덟 글자가 나와요. 이 앱의 만세력 탭에서 내 여덟 글자를 볼 수 있어요.',
      },
      {
        title: '정해진 운명이 아니에요',
        body: '사주는 타고난 기질과 흐름을 읽어보는 하나의 도구예요. 정답이 아니라 나를 돌아보는 재미있는 참고 자료로 봐주세요.',
      },
    ],
  },
  {
    id: '2',
    title: '2강 · 천간, 하늘의 기운',
    subtitle: '갑을병정무기경신임계',
    cards: [
      {
        title: '천간이 뭐예요?',
        body: '하늘의 기운을 나타내는 10개의 글자예요. 각 기둥의 위 글자가 천간이에요.',
        chips: GAN.map((g, i) => ({ glyph: g, caption: GAN_KO[i] })),
      },
      {
        title: '순서가 있어요',
        body: '갑 → 을 → 병 → 정 → 무 → 기 → 경 → 신 → 임 → 계. 알파벳처럼 정해진 순서가 있고, 끝(계)까지 가면 다시 처음(갑)으로 돌아가요.',
      },
      {
        title: '음(陰)과 양(陽)',
        body: '홀수 번째인 갑·병·무·경·임은 양, 짝수 번째인 을·정·기·신·계는 음이에요. 양은 겉으로 드러나 활동적인 기운, 음은 안으로 모으는 기운으로 봐요.',
        chips: GAN.map((g, i) => ({ glyph: g, caption: i % 2 === 0 ? '양' : '음' })),
      },
      {
        title: '오행과 짝을 이뤄요',
        body: '갑·을은 목(나무), 병·정은 화(불), 무·기는 토(흙), 경·신은 금(쇠), 임·계는 수(물)예요. 두 글자씩 한 오행을 나눠 가져요.',
        chips: [
          { glyph: '甲乙', caption: '목' },
          { glyph: '丙丁', caption: '화' },
          { glyph: '戊己', caption: '토' },
          { glyph: '庚辛', caption: '금' },
          { glyph: '壬癸', caption: '수' },
        ],
      },
    ],
  },
  {
    id: '3',
    title: '3강 · 지지, 땅의 기운',
    subtitle: '자축인묘진사오미신유술해',
    cards: [
      {
        title: '지지가 뭐예요?',
        body: '땅의 기운을 나타내는 12개의 글자예요. 각 기둥의 아래 글자가 지지이고, 열두 띠 동물과 짝이에요.',
        chips: ZHI.map((z, i) => ({ glyph: z, caption: ANIMALS[i] })),
      },
      {
        title: '내 띠는 년지예요',
        body: '태어난 해의 지지가 곧 띠예요. 사주에서는 1월 1일이 아니라 입춘(立春)을 기준으로 해가 바뀌기 때문에, 입춘 전에 태어났다면 전년도 띠로 계산해요.',
      },
      {
        title: '하루도 12지지로 나눠요',
        body: '하루 24시간을 두 시간씩 열두 칸으로 나눠 지지를 붙여요. 태어난 시간의 지지가 시주의 아래 글자가 돼요. (진태양시 보정을 켜면 실제 경계는 30분씩 뒤로 밀려요.)',
        chips: ZHI.map((z, i) => ({ glyph: z, caption: HOURS[i] })),
      },
      {
        title: '60갑자: 열 글자와 열두 글자의 짝',
        body: '천간과 지지를 순서대로 짝지으면 갑자, 을축, 병인… 계해까지 60가지가 나오고 다시 갑자로 돌아와요. 태어난 해의 간지가 60년 만에 돌아오는 것을 환갑이라고 해요.',
        chips: [
          { glyph: '甲子', caption: '1번째' },
          { glyph: '乙丑', caption: '2번째' },
          { glyph: '丙寅', caption: '3번째' },
          { glyph: '…', caption: '' },
          { glyph: '癸亥', caption: '60번째' },
        ],
      },
    ],
  },
  {
    id: '4',
    title: '4강 · 오행: 목화토금수',
    subtitle: '다섯 가지 기운의 상생상극',
    cards: [
      {
        title: '오행이 뭐예요?',
        body: '세상을 이루는 다섯 가지 기운, 목(木)·화(火)·토(土)·금(金)·수(水)예요. 나무·불·흙·쇠·물에 비유하지만 물질 자체가 아니라 기운의 성질을 뜻해요.',
        chips: [
          { glyph: '木', caption: '성장' },
          { glyph: '火', caption: '열정' },
          { glyph: '土', caption: '안정' },
          { glyph: '金', caption: '결실' },
          { glyph: '水', caption: '지혜' },
        ],
      },
      {
        title: '서로 살려주는 상생',
        body: '목 → 화 → 토 → 금 → 수 → 목. 나무가 불을 살리고, 불이 타고 남은 재가 흙이 되고, 흙 속에서 쇠가 나오고, 쇠에 물이 맺히고, 물이 나무를 키워요.',
        chips: [
          { glyph: '木→火', caption: '목생화' },
          { glyph: '火→土', caption: '화생토' },
          { glyph: '土→金', caption: '토생금' },
          { glyph: '金→水', caption: '금생수' },
          { glyph: '水→木', caption: '수생목' },
        ],
      },
      {
        title: '서로 눌러주는 상극',
        body: '목 → 토 → 수 → 화 → 금 → 목. 나무는 흙을 뚫고, 흙은 물을 막고, 물은 불을 끄고, 불은 쇠를 녹이고, 쇠는 나무를 잘라요. 나쁜 관계가 아니라 균형을 잡아주는 관계예요.',
        chips: [
          { glyph: '木→土', caption: '목극토' },
          { glyph: '土→水', caption: '토극수' },
          { glyph: '水→火', caption: '수극화' },
          { glyph: '火→金', caption: '화극금' },
          { glyph: '金→木', caption: '금극목' },
        ],
      },
      {
        title: '내 사주의 오행',
        body: '',
        personal: 'elements',
      },
    ],
  },
  {
    id: '5',
    title: '5강 · 나의 일간 찾기',
    subtitle: '내 사주에서 일간 읽는 법',
    cards: [
      {
        title: '일간이 뭐예요?',
        body: "일주의 위 글자, 즉 태어난 날의 천간이 '일간'이에요. 사주에서 일간은 '나 자신'을 뜻해서 해석의 중심이 돼요.",
      },
      {
        title: '일간은 열 가지예요',
        body: '열 개의 천간이 각각 자연의 이미지를 가지고 있어요.',
        chips: [
          { glyph: '甲', caption: '큰 나무' },
          { glyph: '乙', caption: '풀과 꽃' },
          { glyph: '丙', caption: '태양' },
          { glyph: '丁', caption: '촛불' },
          { glyph: '戊', caption: '큰 산' },
          { glyph: '己', caption: '논밭' },
          { glyph: '庚', caption: '바위·쇠' },
          { glyph: '辛', caption: '보석' },
          { glyph: '壬', caption: '큰 강' },
          { glyph: '癸', caption: '이슬·비' },
        ],
      },
      {
        title: '나의 일간 찾기',
        body: '',
        personal: 'dayGan',
      },
      {
        title: '일간을 보는 법',
        body: '만세력 탭에서 일주 카드를 눌러보세요. 위 글자가 일간이에요. 사주풀이 화면에서는 일간을 바탕으로 성격·재물·애정 경향을 풀어줘요.',
      },
    ],
  },
  {
    id: '6',
    title: '6강 · 십신이란?',
    subtitle: '사주 해석의 핵심 열쇠',
    cards: [
      {
        title: '십신이 뭐예요?',
        body: '일간(나)을 기준으로, 다른 글자들이 나와 어떤 관계인지를 열 가지 이름으로 부른 거예요. 관계에 따라 그 글자가 삶에서 어떤 역할을 하는지 읽어요.',
      },
      {
        title: '관계는 다섯 가지',
        body: '나와 같은 기운(비겁), 내가 만들어내는 기운(식상), 내가 다스리는 기운(재성), 나를 다스리는 기운(관성), 나를 도와주는 기운(인성). 음양이 같은지 다른지에 따라 각각 둘로 나뉘어 열 가지가 돼요.',
        chips: [
          { glyph: '比', caption: '비겁' },
          { glyph: '食', caption: '식상' },
          { glyph: '財', caption: '재성' },
          { glyph: '官', caption: '관성' },
          { glyph: '印', caption: '인성' },
        ],
      },
      {
        title: '열 가지 십신',
        body: '이름 뒤의 짝은 음양이 같으면 앞의 것(비견·식신·편재·편관·편인), 다르면 뒤의 것(겁재·상관·정재·정관·정인)이에요.',
        chips: [
          { glyph: '비견', caption: '비겁' },
          { glyph: '겁재', caption: '비겁' },
          { glyph: '식신', caption: '식상' },
          { glyph: '상관', caption: '식상' },
          { glyph: '편재', caption: '재성' },
          { glyph: '정재', caption: '재성' },
          { glyph: '편관', caption: '관성' },
          { glyph: '정관', caption: '관성' },
          { glyph: '편인', caption: '인성' },
          { glyph: '정인', caption: '인성' },
        ],
      },
      {
        title: '내 사주의 십신',
        body: '',
        personal: 'tenGods',
      },
    ],
  },
];
