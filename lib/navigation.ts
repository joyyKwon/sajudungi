import { router } from 'expo-router';

/**
 * Goes back when there is somewhere to go back to; otherwise (screen opened directly
 * from a link or on a cold start) goes to the start screen, which forwards to the tabs
 * when a profile already exists.
 */
export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/welcome');
}
