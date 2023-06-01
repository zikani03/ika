import { expect, test } from '@playwright/test';

// test.beforeAll(async () => {
//   // TODO: run webserver here
// });

// NOTE: Run caddy file-server --root "../../demo" --listen ":3000" before running the tests
// or use any other webserver e.g. python -m http.server 
test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/test.html');
});

test.describe('ika autofill test @feature-autofill', () => {
  test('inputs are automatically filled using faker.js input', async ({ page }) => {
    await page.waitForSelector('#nndi--ika-control');
    await expect(page.locator('#nndi--ika-powered'))
                .toContainText('Powered by ika');
    await expect(page.locator('#nndi--ika-txt'))
                .not.toBeDisabled();
    await expect(page.locator('#nndi--ika-txt'))
                .toBeVisible();

    await page.locator('#nndi--ika-btn').click();

    await expect(page.locator('input[name="firstName"]'))
        .not.toBeEmpty();

    await expect(page.locator('input[name="lastName"]'))
        .not.toBeEmpty();
  });
});

test.describe('ika tags test @feature-tags', () => {
  test('inputs are filled using tagged input', async ({ page }) => {
    await page.waitForSelector('#nndi--ika-control');
    await expect(page.locator('#nndi--ika-powered'))
                .toContainText('Powered by ika');
    
    let ikaInputField = await page.locator('#nndi--ika-txt');
    await expect(ikaInputField)
                .not.toBeDisabled();
    await expect(ikaInputField)
                .toBeVisible();

    await page.fill('#nndi--ika-txt', 'firstName:John lastName:Banda')

    await page.locator('#nndi--ika-btn').click();

    await expect(page.locator('input[name="firstName"]'))
        .toHaveValue('John');

    await expect(page.locator('input[name="lastName"]'))
        .toHaveValue('Banda')
  });
});