import { sample } from 'lodash-es';

export const OVERLAY_SCROLLBAR_SETTINGS_BODY = {
  scrollbars: { theme: 'os-theme-body' }
};

export const OVERLAY_SCROLLBAR_SETTINGS_OTHER = {
  scrollbars: {
    theme: 'os-theme-other',
    autoHide: 'leave',
    autoHideDelay: 200
  }
};

export const BACKGROUND_OFFSETS = {
  background_1: ['center', '35%'],
  background_2: ['center', '45%'],
  background_3: ['center', '40%']
};

export const BACKGROUND_NAME = sample(Object.keys(BACKGROUND_OFFSETS));
