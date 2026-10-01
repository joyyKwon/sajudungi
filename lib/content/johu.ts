// NOTE: AI-drafted text, not reviewed by a 명리 expert (see tenGods.ts).
// Plain-language companion to the 궁통보감 조후 table in lib/johu.ts: the table says
// WHICH stems a chart needs; this file says what the season is like and what each stem does.

export const JOHU_INTRO =
  '조후는 태어난 계절의 온도와 습도를 맞춰주는 기운이에요. 옛 고전 《궁통보감》은 일간과 태어난 달의 조합마다 어떤 기운이 있어야 균형이 잡히는지 정리해두었어요.';

/** The feel of each birth month (by 월지), from 입춘 to the next 입춘. */
export const JOHU_SEASON: Record<string, { title: string; body: string }> = {
  寅: { title: '이른 봄', body: '입춘부터 경칩 전까지예요. 봄이 시작됐지만 아직 추위가 남아 있어, 땅이 채 녹지 않은 때예요.' },
  卯: { title: '한창인 봄', body: '경칩부터 청명 전까지예요. 나무의 기운이 가장 왕성하게 뻗어 나가는 때예요.' },
  辰: { title: '늦봄', body: '청명부터 입하 전까지예요. 봄기운이 무르익고 흙의 기운이 두터워지며, 여름으로 넘어가는 문턱이에요.' },
  巳: { title: '초여름', body: '입하부터 망종 전까지예요. 햇볕이 강해지며 열기가 빠르게 올라오는 때예요.' },
  午: { title: '한여름', body: '망종부터 소서 전까지예요. 불의 기운이 가장 강해 뜨겁고 메마르기 쉬운 때예요.' },
  未: { title: '늦여름', body: '소서부터 입추 전까지예요. 흙이 뜨겁게 달궈진 무더위 속에서도 서늘한 기운이 조금씩 싹트는 때예요.' },
  申: { title: '초가을', body: '입추부터 백로 전까지예요. 서늘한 금의 기운이 들어오며 더위가 물러나기 시작하는 때예요.' },
  酉: { title: '한창인 가을', body: '백로부터 한로 전까지예요. 금의 기운이 가장 강해 공기가 맑고 단단해지는 때예요.' },
  戌: { title: '늦가을', body: '한로부터 입동 전까지예요. 만물이 거둬지고 흙의 기운이 두터워지며, 겨울로 넘어가는 문턱이에요.' },
  亥: { title: '초겨울', body: '입동부터 대설 전까지예요. 물의 기운이 들어오며 날이 차가워지기 시작하는 때예요.' },
  子: { title: '한겨울', body: '대설부터 소한 전까지예요. 물의 기운이 가장 강하고 추위가 깊어지는 때예요.' },
  丑: { title: '늦겨울', body: '소한부터 입춘 전까지예요. 추위가 가장 매서운 가운데 땅이 얼어 있는 때예요.' },
};

/** What each stem does when it is the 조후 기운 a chart needs. */
export const JOHU_ROLE: Record<string, string> = {
  甲: '큰 나무처럼 두꺼운 흙을 뚫어 숨통을 틔우고, 불씨를 이어주는 역할을 해요.',
  乙: '덩굴처럼 부드럽게 뻗어 메마른 흙에 생기를 더해줘요.',
  丙: '태양처럼 온기를 더해 차갑고 얼어붙은 기운을 녹여줘요.',
  丁: '등불처럼 차가운 기운을 밝히고, 단단한 쇠를 다듬어 쓸모 있게 만들어줘요.',
  戊: '둑처럼 넘치는 물을 막아 흐름을 바로잡아줘요.',
  己: '촉촉한 흙처럼 약한 기운이 뿌리내릴 자리를 만들어줘요.',
  庚: '단단한 도끼처럼 너무 무성한 나무를 다듬고, 물의 근원이 되어줘요.',
  辛: '맑은 보석처럼 물의 근원이 되어 물길을 맑게 이어줘요.',
  壬: '큰 강물처럼 뜨거운 열기를 식히고 넘치는 불을 다스려줘요.',
  癸: '단비처럼 메마른 기운을 촉촉하게 적셔줘요.',
};
