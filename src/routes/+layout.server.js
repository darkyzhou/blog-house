import { BACKGROUND_NAME, BACKGROUND_OFFSETS } from '../utils/constants';

export const prerender = true;

export async function load() {
  return { backgroundName: BACKGROUND_NAME, backgroundOffsets: BACKGROUND_OFFSETS };
}
