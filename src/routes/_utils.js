import basicConfiguration from '../../config/basic-configuration.yml';
import { ResizeObserver } from '@juggle/resize-observer';
import debounce from 'debounce';
import { browser } from '$app/env';

export function getOptimizedImageName(path, ext) {
  return `${path.substring(0, path.lastIndexOf('.'))}-bloghouse-opt.${ext}`;
}

export function makeTitle(title) {
  return `${title} · ${basicConfiguration.blogName}`;
}

export function concatPageUrl(pathName) {
  const url = new URL(basicConfiguration.url);
  url.pathname = pathName;
  return url.href;
}

export function getCssSegment(styles) {
  return `<style type='text/css'>${styles}</style>`;
}

// workaround for a very strange bug that for prerendered output,
// the `page` from `$app/stores` will have a url whose `pathname`
// has a prefix of `//prerender`
export function removePrerenderPrefix(content) {
  return content.replace('//prerender', '');
}

export class WaterflowController {
  constructor(cacheKey, preferredWidthPx, maxColumnsCount, data, onChange) {
    if (!data || !Array.isArray(data)) {
      throw new Error('invalid data', data);
    }
    this.cacheKey = `__blog_house_waterfall_${cacheKey}`;
    this.preferredWidthPx = preferredWidthPx;
    this.maxColumnsCount = maxColumnsCount;
    this.data = data;
    this.onChange = onChange;
    this.initial = true;
    if (browser) {
      const cachedCount = Number(window.localStorage.getItem(this.cacheKey));
      this.columnsCount = cachedCount || 1;
    } else {
      this.columnsCount = 1;
    }
  }

  checkAndUpdateColumns(width) {
    const newColumnsCount = Math.min(
      Math.floor(width / this.preferredWidthPx),
      this.maxColumnsCount
    );
    if (
      this.data?.length <= 0 ||
      !width ||
      (newColumnsCount === this.columnsCount && !this.initial)
    ) {
      return;
    }
    this.initial = false;
    const newColumns = Array(newColumnsCount)
      .fill(null)
      .map(() => []);
    this.data.forEach((a, index) => newColumns[index % newColumnsCount].push(a));
    this.columnsCount = newColumnsCount;
    if (browser) {
      window.localStorage.setItem(this.cacheKey, `${newColumnsCount}`);
    }
    this.onChange(newColumns);
  }

  observeResize(containerElement) {
    const check = (entries) => {
      const width =
        entries?.[0].contentBoxSize?.[0]?.inlineSize || entries?.[0]?.contentRect?.width;
      this.checkAndUpdateColumns(width);
    };
    const observer = new ResizeObserver((entries) => {
      if (this.initial) {
        check(entries);
      } else {
        debounce(() => check(entries), 250)();
      }
    });
    observer.observe(containerElement);
    return {
      destroy: () => observer.disconnect()
    };
  }
}
