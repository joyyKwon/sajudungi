import { ILGAN } from './ilgan';
import { ILJU } from './ilju';
import { TEN_GODS } from './tenGods';
import { ELEMENT_BALANCED, ELEMENT_LACKING, ELEMENT_STRONG } from './elements';
import { PILLAR_INFO } from './pillars';
import { DAEUN_THEME, MONTH_THEME, YEAR_THEME } from './flow';
import { GROUP_BALANCED, GROUP_INFO } from './tenGodGroups';
import { GAN_IMAGE } from './gan';
import { ZHI_CHUNG, ZHI_HAP, ZHI_RELATION_NONE } from './zhiRelations';
import { LOVE_BY_DAY_GOD, PERSONALITY_BY_MONTH_GOD, WEALTH_BY_JAESEONG } from './detail';
import { SINSAL, SINSAL_NONE, SINSAL_POSITION, SINSAL_REPEATED } from './sinsal';
import { JOHU_INTRO, JOHU_ROLE, JOHU_SEASON } from './johu';
import { CAREER_BALANCED, CAREER_BY_GROUP, CAREER_STYLE_BY_MONTH_GOD, CAREER_TIP_BY_LACKING } from './career';

/**
 * Every piece of interpretation text the app can show. The files in this folder
 * are the built-in copy (always available offline); the same keys live in the
 * Supabase `content_blocks` table so text can be edited without a new release.
 */
export const BUNDLED_CONTENT = {
  ILGAN,
  ILJU,
  TEN_GODS,
  ELEMENT_LACKING,
  ELEMENT_STRONG,
  ELEMENT_BALANCED,
  PILLAR_INFO,
  YEAR_THEME,
  MONTH_THEME,
  DAEUN_THEME,
  GROUP_INFO,
  GROUP_BALANCED,
  GAN_IMAGE,
  ZHI_HAP,
  ZHI_CHUNG,
  ZHI_RELATION_NONE,
  PERSONALITY_BY_MONTH_GOD,
  WEALTH_BY_JAESEONG,
  LOVE_BY_DAY_GOD,
  SINSAL,
  SINSAL_POSITION,
  SINSAL_REPEATED,
  SINSAL_NONE,
  JOHU_INTRO,
  JOHU_SEASON,
  JOHU_ROLE,
  CAREER_BY_GROUP,
  CAREER_BALANCED,
  CAREER_STYLE_BY_MONTH_GOD,
  CAREER_TIP_BY_LACKING,
};

export type ContentBundle = typeof BUNDLED_CONTENT;
export type ContentKey = keyof ContentBundle;
export const CONTENT_KEYS = Object.keys(BUNDLED_CONTENT) as ContentKey[];

/** Bump when the shape of a block changes in a way old apps can't read. */
export const CONTENT_SCHEMA_VERSION = 1;
