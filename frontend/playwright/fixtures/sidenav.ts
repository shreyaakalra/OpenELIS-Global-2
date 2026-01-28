import { Page, expect, Locator } from "@playwright/test";

/**
 * Sidenav Page Object - encapsulates sidenav interactions
 */
export class Sidenav {
  readonly page: Page;
  readonly nav: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.locator(".cds--side-nav");
    // Use id for stability (data-cy is for testing, id is the DOM identifier)
    this.menuButton = page.locator("#sidenav-menu-button");
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

  /** Ensure the SideNav is expanded (click toggle if needed) */
  async ensureExpanded() {
    try {
      await this.nav.waitFor({ timeout: 2000 });
    } catch {
      return;
    }
    
    try {
      const hasExpandedClass = await this.nav.evaluate((el) =>
        el.classList.contains("cds--side-nav--expanded"),
      );
      if (!hasExpandedClass) {
        await this.toggle();
        await this.expectExpanded();
      }
    } catch {
      return;
    }
  }

  async expandAllMenus() {
    try {
      await this.nav.waitFor({ timeout: 2000 });
    } catch {
      return;
    }

    await this.ensureExpanded();

    for (let i = 0; i < 25; i++) {
      try {
        const closed = this.nav.locator('button[aria-expanded="false"]');
        const count = await closed.count();
        if (count === 0) return;

        await closed.first().click();
      } catch (error) {
        return;
      }
    }
  }

  /** Click a menu item by text */
  async clickMenu(text: string) {
    const tab = this.page.getByRole("tab", { name: text });
    const tabCount = await tab.count();
    
    if (tabCount > 0) {
      await tab.click();
      return;
    }
    
    await this.nav.getByRole("link", { name: text }).click();
  }

  async expectMenuActive(text: string) {
    const tab = this.page.getByRole("tab", { name: text });
    const tabCount = await tab.count();
    
    if (tabCount > 0) {
      await expect(tab).toHaveClass(/cds--tabs__nav-item--selected/);
      return;
    }
    
    const link = this.nav.getByRole("link", { name: text });
    await expect(link).toHaveClass(/cds--side-nav__link--current/);
  }

  async expectMenuInactive(text: string) {
    const tab = this.page.getByRole("tab", { name: text });
    const tabCount = await tab.count();
    
    if (tabCount > 0) {
      await expect(tab).not.toHaveClass(/cds--tabs__nav-item--selected/);
      return;
    }
    
    const link = this.nav.getByRole("link", { name: text });
    await expect(link).not.toHaveClass(/cds--side-nav__link--current/);
  }

  /** Expand a parent menu by text (exact match) */
  async expandMenu(text: string) {
    const button = this.nav.getByText(text, { exact: true });    const expanded = await button.getAttribute("aria-expanded");
    if (expanded !== "true") {
      await button.click({ force: true });
    }
  }


  /**
   * Return visible sidenav link info. This intentionally only captures "real" links
   * (anchor tags) and skips menu toggle buttons.
   */
  async getVisibleLinkInfos(): Promise<
    Array<{ name: string; href: string; target: string | null }>
  > {
    await this.ensureExpanded();
    // Expand all menus so nested links are visible
    await this.expandAllMenus();

    const links = this.nav.locator("a.cds--side-nav__link");
    const count = await links.count();
    const infos: Array<{ name: string; href: string; target: string | null }> =
      [];

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      if (!(await link.isVisible())) continue;
      const href = (await link.getAttribute("href")) || "";
      if (!href) continue;
      const target = await link.getAttribute("target");
      const rawName = (await link.textContent()) || "";
      const name = rawName.replace(/\s+/g, " ").trim();
      infos.push({ name, href, target });
    }

    return infos;
  }

  /** Navigate to storage section and wait for load */
  async gotoStorage(path = "samples") {
    await this.page.goto(`/Storage/${path}`);
    await expect(this.page).toHaveURL(new RegExp(`/Storage/${path}`));
  }

  /** Navigate to freezer monitoring */
  async gotoFreezer(tab = 0) {
    await this.page.goto(`/FreezerMonitoring?tab=${tab}`);
    await expect(this.page).toHaveURL(/FreezerMonitoring/);
  }
}
