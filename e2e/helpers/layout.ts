import { Page, expect } from '@playwright/test';

export async function assertNoOverlap(page: Page, selectors: string[]) {
  const boxes = [];
  for (const s of selectors) {
    for (const el of await page.locator(s).elementHandles()) {
      const b = await el.boundingBox();
      if (b && b.width > 0 && b.height > 0) boxes.push({ s, ...b });
    }
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    const overlap = a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 && a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1;
    expect(overlap, `${a.s} overlaps ${b.s}`).toBe(false);
  }
}

export async function assertNotClipped(page: Page, selector: string) {
  const bad = await page.$$eval(selector, els => els.filter(e => (e as HTMLElement).scrollWidth > (e as HTMLElement).clientWidth + 1 && getComputedStyle(e).textOverflow !== 'ellipsis').length);
  expect(bad, `${selector} has clipped text`).toBe(0);
}

export async function assertTopmost(page: Page, selector: string) {
  const ok = await page.$eval(selector, el => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return !!hit && el.contains(hit);
  });
  expect(ok, `${selector} is covered by another element`).toBe(true);
}
