import { test, expect } from '@playwright/test';
import { Sidenav } from '../fixtures/sidenav';

test.describe('Sidenav', () => {
  test('home page has collapsed nav', async ({ page }) => {
    await page.goto('/');
    const sidenav = new Sidenav(page);
    await sidenav.expectCollapsed();
  });

  test('storage page has expanded nav', async ({ page }) => {
    const sidenav = new Sidenav(page);
    await sidenav.gotoStorage('samples');
    await sidenav.expectExpanded();
  });

  test('can toggle sidenav on storage page', async ({ page }) => {
    const sidenav = new Sidenav(page);
    await sidenav.gotoStorage('samples');
    
    await sidenav.expectExpanded();
    await sidenav.toggle();
    await sidenav.expectCollapsed();
    await sidenav.toggle();
    await sidenav.expectExpanded();
  });

  test('storage subnav updates active state', async ({ page }) => {
    const sidenav = new Sidenav(page);
    await sidenav.gotoStorage('samples');
    
    // Expand menus to see items
    await sidenav.expandMenu('Storage');
    await sidenav.expandMenu('Storage Management');
    
    // Check initial active state
    await sidenav.expectMenuActive('Sample Items');
    
    // Navigate and verify active state changes
    await sidenav.clickMenu('Rooms');
    await expect(page).toHaveURL(/\/Storage\/rooms/);
    await sidenav.expectMenuActive('Rooms');
    await sidenav.expectMenuInactive('Sample Items');
  });

  test('cold storage subnav updates active state', async ({ page }) => {
    const sidenav = new Sidenav(page);
    await sidenav.gotoFreezer(0);
    
    // Expand menus
    await sidenav.expandMenu('Storage');
    await sidenav.expandMenu('Cold Storage Monitoring');
    
    // Check initial active state
    await sidenav.expectMenuActive('Dashboard');
    
    // Navigate to another tab
    await sidenav.clickMenu('Corrective Actions');
    await expect(page).toHaveURL(/FreezerMonitoring\?tab=1/);
    await sidenav.expectMenuActive('Corrective Actions');
    await sidenav.expectMenuInactive('Dashboard');
  });
});
