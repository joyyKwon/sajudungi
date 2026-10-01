import { GAN_ELEMENT, GAN_HANGUL, SajuResult, ZHI_HANGUL, ZHI_MAIN_GAN, yearGanZhi } from './saju';
import { getContent } from './contentStore';
import { iga } from './interpret';
import { ELEMENT_HANJA } from './sajuContent';

/*
 * 조후용신 per 일간 × 월지, read from the public-domain text of 《窮通寶鑑》
 * (zh.wikisource.org/wiki/窮通寶鑑). Each cell lists the needed stems in the order the
 * text ranks them (先/次/佐), plus the phrase it came from. Where the text gives a
 * condition-dependent choice, the general rule is used. Several modern summary tables
 * add stems the original rules out (e.g. 甲 辰月: "三月無用丁之法"), so this follows the
 * original wording rather than those tables. Needs expert review like all content.
 */
type Cell = [stems: string, source: string];

export const JOHU_TABLE: Record<string, Record<string, Cell>> = {
  甲: {
    寅: ['丙癸', '得丙癸逢，富貴雙全'],
    卯: ['庚戊丁', '庚金得所…有庚戊者上命，如有丁透大富大貴'],
    辰: ['庚壬', '先取庚金，次用壬水'],
    巳: ['癸丁', '丙火司權，先癸後丁'],
    午: ['癸丁庚', '五月先癸後丁，庚金次之'],
    未: ['丁庚', '六月三伏生寒…先丁後庚'],
    申: ['丁庚', '丁火為尊，庚金次之'],
    酉: ['丁丙庚', '丁火為先，次用丙火，庚金再次'],
    戌: ['丁癸', '九月甲木，耑用丁癸'],
    亥: ['庚丁丙', '庚丁為要，丙火次之'],
    子: ['丁庚丙', '丁先庚後，丙火佐之'],
    丑: ['庚丁', '先用庚劈甲，方引丁火…故丁次之'],
  },
  乙: {
    寅: ['丙癸', '以丙火為先，癸水次之'],
    卯: ['丙癸', '以丙為君，癸為臣'],
    辰: ['癸丙', '陽氣愈熾，先癸後丙'],
    巳: ['癸辛', '耑取癸水為尊…以庚辛佐癸，須辛透為清'],
    午: ['癸丙', '上半月仍用癸水，下半月丙癸齊用'],
    未: ['癸丙', '柱多金水，丙火為尊…癸水透干，大富大貴'],
    申: ['己丙', '有己透加丙，亦是上命…七月喜己土為用'],
    酉: ['癸丙', '白露之後耑用癸水…秋分後又宜用丙'],
    戌: ['癸辛', '必賴癸水滋養…又遇辛金發水之源'],
    亥: ['丙戊', '取丙為用，戊土次之'],
    子: ['丙', '喜用丙火解凍…故耑用丙火'],
    丑: ['丙', '冬月之木…耑取丙火'],
  },
  丙: {
    寅: ['壬庚', '取壬為尊，庚金佐之'],
    卯: ['壬', '陽氣舒升，耑用壬水'],
    辰: ['壬甲', '用壬水，或成土局，取甲為輔'],
    巳: ['壬庚', '宜專用壬水…得庚發水源'],
    午: ['壬庚', '得壬高透，方為上命…或一壬無庚'],
    未: ['壬庚', '壬水為用，取庚輔佐'],
    申: ['壬', '仍用壬水，輔映光輝'],
    酉: ['壬', '仍用壬水輔映'],
    戌: ['甲壬', '必須先用甲木，次取壬水'],
    亥: ['甲戊庚', '得見甲戊庚出干，可云科甲'],
    子: ['壬戊', '壬水為最，戊土佐之'],
    丑: ['壬甲', '喜壬為用…土多又不可少甲'],
  },
  丁: {
    寅: ['庚甲', '非庚不能劈甲，何以引丁，姑用庚金'],
    卯: ['庚甲', '先庚後甲'],
    辰: ['甲庚', '先用甲木引丁制土，次看庚金'],
    巳: ['甲庚', '取甲引丁，必用庚劈甲'],
    午: ['壬庚', '得庚壬兩透者，科甲定然'],
    未: ['甲壬', '專取甲木，壬水次之'],
    申: ['甲庚丙', '端用甲木…仍取庚劈甲…或借丙暖金'],
    酉: ['甲庚丙', '八月甲丙庚皆用'],
    戌: ['甲庚', '九月耑用甲庚'],
    亥: ['甲庚', '三冬丁火，甲木為尊，庚金佐之'],
    子: ['甲庚', '三冬丁火，甲木為尊，庚金佐之'],
    丑: ['甲庚', '三冬丁火，甲木為尊，庚金佐之'],
  },
  戊: {
    寅: ['丙甲癸', '正二月先丙後甲，癸又次之'],
    卯: ['丙甲癸', '正二月先丙後甲，癸又次之'],
    辰: ['甲丙癸', '三月先甲後丙，癸又次之'],
    巳: ['甲丙癸', '先用甲疏劈，次取丙癸為佐'],
    午: ['壬甲', '先看壬水，次取甲木，丙火酌用'],
    未: ['癸丙甲', '先看癸水，次用丙火甲木'],
    申: ['丙癸甲', '先丙後癸，甲木次之'],
    酉: ['丙癸', '先丙後癸，不必木疏'],
    戌: ['甲癸', '先看甲木，次取癸水'],
    亥: ['甲丙', '先用甲木，次取丙火'],
    子: ['丙甲', '丙火為專，甲木為佐'],
    丑: ['丙甲', '丙火為專，甲木為佐'],
  },
  己: {
    寅: ['丙', '故丙為尊…壬多要見戊制'],
    卯: ['甲癸', '先取甲木疏之…次取癸水潤之'],
    辰: ['丙癸甲', '先丙後癸，土暖而潤，隨用甲疏'],
    巳: ['癸丙', '三夏己土…取癸為要，次用丙火'],
    午: ['癸丙', '三夏己土…取癸為要，次用丙火'],
    未: ['癸丙', '三夏己土…取癸為要，次用丙火'],
    申: ['癸丙', '三秋己土，先癸後丙，取辛輔癸'],
    酉: ['癸丙', '三秋己土，先癸後丙，取辛輔癸'],
    戌: ['甲癸丙', '九月土盛，宜甲木疏之…先癸後丙'],
    亥: ['丙甲戊', '取丙為尊，甲木參酌…初冬壬旺，取戊制之'],
    子: ['丙甲', '取丙為尊，甲木參酌'],
    丑: ['丙甲', '取丙為尊，甲木參酌'],
  },
  庚: {
    寅: ['丙甲', '先用丙暖庚性…須甲疏洩'],
    卯: ['丁甲', '專用丁火，借甲引丁'],
    辰: ['甲丁', '先甲後丁'],
    巳: ['壬戊丙', '先壬水…次取戊土，丙火佐之'],
    午: ['壬癸', '專用壬水，癸又次之'],
    未: ['丁甲', '先用丁火，次取甲木'],
    申: ['丁甲', '專用丁火煅煉，次取甲木引丁'],
    酉: ['丁甲丙', '用丁用甲，丙不可少'],
    戌: ['甲壬', '宜先用甲疏，後用壬洗'],
    亥: ['丁丙甲', '非丁莫造，非丙不暖…丁甲兩透'],
    子: ['丁甲丙', '仍取丁甲，次取丙火照暖'],
    丑: ['丙丁甲', '先取丙火解凍，次取丁火煉金，甲亦不可少'],
  },
  辛: {
    寅: ['己壬庚', '取己土為生身之本…己壬兩透，支見庚制甲'],
    卯: ['壬甲', '壬水為尊…得甲制伏'],
    辰: ['壬甲', '母旺子相，先壬後甲'],
    巳: ['壬甲癸', '喜壬水之洗淘…壬、癸、甲三者全無，斯為下品'],
    午: ['己壬', '須己壬兼用'],
    未: ['壬庚', '先用壬水，取庚佐之'],
    申: ['壬甲戊', '壬水為尊，甲戊酌用'],
    酉: ['壬甲', '專用壬水淘洗…見甲制土方妙'],
    戌: ['壬甲', '須甲疏土，壬洩旺金，先壬後甲'],
    亥: ['壬丙', '先用壬水，次取丙火'],
    子: ['丙壬', '切忌癸出凍金而困丙火，壬丙兩透'],
    丑: ['丙壬', '先丙後壬，無丙不能解凍'],
  },
  壬: {
    寅: ['庚丙戊', '宜用庚金之源…庚丙戊三者齊透'],
    卯: ['戊辛庚', '先戊後辛，庚金次之'],
    辰: ['甲庚', '先用甲疏季土，次取庚金'],
    巳: ['壬辛庚', '專取壬水比肩為助，次取辛金發源…庚金為佐'],
    午: ['癸庚', '取癸為用，取庚為佐'],
    未: ['辛甲癸', '先辛後甲，次取癸水'],
    申: ['戊丁', '專用戊土，次取丁火'],
    酉: ['甲', '忌戊土為病，專用甲木'],
    戌: ['甲丙', '見一甲制戌中之戊…斯用丙火'],
    亥: ['戊庚', '取戊為用…戊庚兩全'],
    子: ['戊丙', '先取戊土，次用丙火'],
    丑: ['丙甲', '專用丙火…亦用丙火，甲木佐之'],
  },
  癸: {
    寅: ['辛丙', '先用辛金…次用丙火照暖'],
    卯: ['庚辛', '專以庚金為用，辛金次之'],
    辰: ['丙辛甲', '清明後專用丙火…谷雨後尚宜辛甲佐之'],
    巳: ['辛庚', '喜辛金為用，無辛用庚'],
    午: ['庚辛壬', '庚辛壬參酌並用'],
    未: ['庚辛', '所以專用庚辛'],
    申: ['丁甲', '必取丁火為用…丁透有甲'],
    酉: ['辛丙', '取辛金為用，丙火佐之'],
    戌: ['辛甲', '專用辛金發水之源，要比肩滋甲制戊'],
    亥: ['庚辛', '宜用庚辛為妙'],
    子: ['丙辛', '專用丙火解凍，又要辛金滋扶'],
    丑: ['丙', '寒極成冰…宜丙火解凍'],
  },
};

/** 寅 is 正月 … 丑 is 十二月, as 궁통보감 names the months. */
const MONTH_NAME: Record<string, string> = {
  寅: '正月', 卯: '二月', 辰: '三月', 巳: '四月', 午: '五月', 未: '六月',
  申: '七月', 酉: '八月', 戌: '九月', 亥: '十月', 子: '十一月', 丑: '十二月',
};

export type JohuStem = {
  gan: string;
  role: string;
  /** Visible as a stem (透), hidden as a branch's main stem (藏), or absent from the chart. */
  presence: 'visible' | 'hidden' | 'absent';
};

export type JohuReading = {
  seasonTitle: string;
  seasonBody: string;
  primary: JohuStem;
  others: JohuStem[];
  /** One sentence on whether the chart already holds the main 조후 기운 and when it arrives. */
  presenceLine: string;
  timingLine: string;
  /** e.g. 《궁통보감》 五月丁火: "得庚壬兩透者…" */
  source: string;
};

const label = (gan: string) => `${gan}(${GAN_HANGUL[gan]})`;

export function johuOf(saju: SajuResult, now: Date = new Date()): JohuReading {
  const { JOHU_SEASON, JOHU_ROLE } = getContent();
  const monthZhi = saju.month.zhi;
  const [stems, quote] = JOHU_TABLE[saju.dayGan][monthZhi];

  const otherStems = [saju.year.gan, saju.month.gan, saju.hour?.gan].filter((g): g is string => !!g);
  const branches = [saju.year.zhi, saju.month.zhi, saju.day.zhi, saju.hour?.zhi].filter((z): z is string => !!z);
  const toStem = (gan: string): JohuStem => ({
    gan,
    role: JOHU_ROLE[gan],
    presence: otherStems.includes(gan) ? 'visible' : branches.some((z) => ZHI_MAIN_GAN[z] === gan) ? 'hidden' : 'absent',
  });
  const [primary, ...others] = [...stems].map(toStem);

  const p = label(primary.gan);
  const hiddenIn = branches.filter((z) => ZHI_MAIN_GAN[z] === primary.gan).map((z) => `${z}(${ZHI_HANGUL[z]})`);
  const presenceLine =
    primary.presence === 'visible'
      ? `원국의 천간에 ${p}${iga(p)} 드러나 있어, 필요한 기운을 이미 갖추고 있는 편이에요.`
      : primary.presence === 'hidden'
        ? `${p}${iga(p)} 천간에는 없지만 지지 ${hiddenIn.join('·')} 속에 숨어 있어요. 운에서 ${p}${iga(p)} 드러날 때 힘을 얻기 쉬워요.`
        : `원국에는 ${p}${iga(p)} 없어요. 운에서 ${p}${iga(p)} 들어오는 때에 균형이 잡히기 쉬워요.`;

  const thisYear = now.getFullYear();
  let nextYear = thisYear;
  while (yearGanZhi(nextYear)[0] !== primary.gan) nextYear += 1;
  const nextGz = yearGanZhi(nextYear);
  const timingLine =
    nextYear === thisYear
      ? `올해 ${thisYear}년(${nextGz})이 바로 ${p}의 해예요.`
      : `다음 ${p}의 해는 ${nextYear}년(${nextGz})이에요.`;

  return {
    seasonTitle: JOHU_SEASON[monthZhi].title,
    seasonBody: JOHU_SEASON[monthZhi].body,
    primary,
    others,
    presenceLine,
    timingLine,
    source: `《궁통보감》 ${MONTH_NAME[monthZhi]}${saju.dayGan}${ELEMENT_HANJA[GAN_ELEMENT[saju.dayGan]]}: "${quote}"`,
  };
}
