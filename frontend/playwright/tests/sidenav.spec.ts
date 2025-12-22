import { test, expect } from "@playwright/test";
import { Sidenav } from "../fixtures/sidenav";

test.describe("Sidenav", () => {
  test("home page has collapsed nav", async ({ page }) => {
    await page.goto("/");
    const sidenav = new Sidenav(page);
    await sidenav.expectCollapsed();
  });

  test("storage page has expanded nav", async ({ page }) => {
    const sidenav = new Sidenav(page);
    await sidenav.gotoStorage("samples");
    await sidenav.expectExpanded();
  });

  test("can toggle sidenav on storage page", async ({ page }) => {
    const sidenav = new Sidenav(page);
    await sidenav.gotoStorage("samples");

    await sidenav.expectExpanded();
    await sidenav.toggle();
    await sidenav.expectCollapsed();
    await sidenav.toggle();
    await sidenav.expectExpanded();
  });

  /**
   * FR-002: Preference persistence across browser refresh
   * @see spec.md User Story 2: Persist User Preference Across Sessions
   */
  test("preference persists after page refresh", async ({ page }) => {
    const sidenav = new Sidenav(page);
    await sidenav.gotoStorage("samples");

    // Storage defaults to expanded - collapse it
    await sidenav.expectExpanded();
    await sidenav.toggle();
    await sidenav.expectCollapsed();

    // Refresh the page
    await page.reload();

    // Should still be collapsed (preference persisted)
    await sidenav.expectCollapsed();
  });

  /**
   * FR-007: Content push verification in LOCK mode
   * @see spec.md FR-007: Content shifts right when sidenav locked
   */
  test("content area has locked class when nav expanded", async ({ page }) => {
    const sidenav = new Sidenav(page);
    await sidenav.gotoStorage("samples");

    // Storage defaults to LOCK mode (expanded + content pushed)
    await sidenav.expectExpanded();

    // Verify content has the locked class
    const content = page.locator('[data-testid="content-wrapper"]');
    await expect(content).toHaveClass(/content-nav-locked/);

    // Collapse nav
    await sidenav.toggle();
    await sidenav.expectCollapsed();

    // Content should NOT have locked class
    await expect(content).not.toHaveClass(/content-nav-locked/);
  });

  test("storage subnav updates active state", async ({ page }) => {
    const sidenav = new Sidenav(page);
    await sidenav.gotoStorage("samples");

    // Expand menus to see items
    await sidenav.expandMenu("Storage");
    await sidenav.expandMenu("Storage Management");

    // Check initial active state
    await sidenav.expectMenuActive("Sample Items");

    // Navigate and verify active state changes
    await sidenav.clickMenu("Rooms");
    await expect(page).toHaveURL(/\/Storage\/rooms/);
    await sidenav.expectMenuActive("Rooms");
    await sidenav.expectMenuInactive("Sample Items");
  });

  test("cold storage subnav updates active state", async ({ page }) => {
    const sidenav = new Sidenav(page);
    await sidenav.gotoFreezer(0);

    // Expand menus
    await sidenav.expandMenu("Storage");
    await sidenav.expandMenu("Cold Storage Monitoring");

    // Check initial active state
    await sidenav.expectMenuActive("Dashboard");

    // Navigate to another tab
    await sidenav.clickMenu("Corrective Actions");
    await expect(page).toHaveURL(/FreezerMonitoring\?tab=1/);
    await sidenav.expectMenuActive("Corrective Actions");
    await sidenav.expectMenuInactive("Dashboard");
  });
});
