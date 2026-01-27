import { Page, expect, Locator } from '@playwright/test';

/**
 * Sidenav Page Object - encapsulates sidenav interactions
 */
export class Sidenav {
  readonly page: Page;
  readonly nav: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.locator('.cds--side-nav');
    this.menuButton = page.locator('[data-cy="menuButton"]');
  }

  /** Check if sidenav is expanded */
  async expectExpanded() {
    await expect(this.nav).toHaveClass(/cds--side-nav--expanded/);
  }

  /** Check if sidenav is collapsed */
  async expectCollapsed() {
    await expect(this.nav).not.toHaveClass(/cds--side-nav--expanded/);
  }

  /** Toggle sidenav open/close */
  async toggle() {
    await this.menuButton.click();
  }

  /** Click a menu item by text */
  async clickMenu(text: string) {
    await this.nav.getByRole('link', { name: text }).click();
  }

  /** Expand a parent menu by text (exact match) */
  async expandMenu(text: string) {
    const button = this.nav.getByRole('button', { name: text, exact: true });
    const expanded = await button.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await button.click();
    }
  }

  /** Check if a menu item is active/current */
  async expectMenuActive(text: string) {
    const link = this.nav.getByRole('link', { name: text });
    await expect(link).toHaveClass(/cds--side-nav__link--current/);
  }

  /** Check if a menu item is NOT active */
  async expectMenuInactive(text: string) {
    const link = this.nav.getByRole('link', { name: text });
    await expect(link).not.toHaveClass(/cds--side-nav__link--current/);
  }

  /** Navigate to storage section and wait for load */
  async gotoStorage(path = 'samples') {
    await this.page.goto(`/Storage/${path}`);
    await expect(this.page).toHaveURL(new RegExp(`/Storage/${path}`));
  }

  /** Navigate to freezer monitoring */
  async gotoFreezer(tab = 0) {
    await this.page.goto(`/FreezerMonitoring?tab=${tab}`);
    await expect(this.page).toHaveURL(/FreezerMonitoring/);
  }
}

