import { ILGAN } from './ilgan';
import { ILJU } from './ilju';
import { TEN_GODS } from './tenGods';
import { ELEMENT_BALANCED, ELEMENT_LACKING, ELEMENT_STRONG } from './elements';
import { PILLAR_INFO } from './pillars';
import { DAEUN_THEME, YEAR_THEME } from './flow';
import { GROUP_BALANCED, GROUP_INFO } from './tenGodGroups';
import { GAN_IMAGE } from './gan';

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
  DAEUN_THEME,
  GROUP_INFO,
  GROUP_BALANCED,
  GAN_IMAGE,
};

export type ContentBundle = typeof BUNDLED_CONTENT;
export type ContentKey = keyof ContentBundle;
export const CONTENT_KEYS = Object.keys(BUNDLED_CONTENT) as ContentKey[];

/** Bump when the shape of a block changes in a way old apps can't read. */
export const CONTENT_SCHEMA_VERSION = 1;
