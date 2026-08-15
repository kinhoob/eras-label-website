from playwright.sync_api import expect, sync_playwright

BASE_URL = "https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    page.goto(BASE_URL, wait_until="networkidle")
    page.evaluate("localStorage.clear()")
    page.reload(wait_until="networkidle")

    product_card = page.locator('.product-image-button[aria-label^="Ver "]').first
    expect(product_card).to_be_visible()
    product_card.click()
    expect(page.locator('.product-modal[role="dialog"]')).to_be_visible()
    expect(page.locator("#quick-view-title")).to_be_visible()
    expect(product_card.get_by_text("VISUALIZAÇÃO RÁPIDA")).to_have_count(1)

    page.get_by_role("button", name="ADICIONAR À SACOLA").click()
    expect(page.locator(".side-cart")).to_be_visible(timeout=3000)
    product_name = page.locator(".side-cart .cart-item-name").first.inner_text()
    expect(page.locator(".side-cart")).to_contain_text(product_name)

    page.get_by_role("button", name=__import__("re").compile("FINALIZAR COMPRA")).evaluate("el => el.click()")
    expect(page).to_have_url(__import__("re").compile(r"/checkout$"))
    expect(page.locator(".checkout-page-layout")).to_be_visible()
    expect(page.locator(".checkout-page-summary")).to_contain_text(product_name)

    page.reload(wait_until="networkidle")
    expect(page.locator(".checkout-page-summary")).to_contain_text(product_name)

    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(BASE_URL, wait_until="networkidle")
    page.locator('.product-image-button[aria-label^="Ver "]').first.click()
    expect(page.locator('.product-modal[role="dialog"]')).to_be_visible()
    page.keyboard.press("Escape")
    expect(page.locator('.product-modal[role="dialog"]')).to_be_hidden()
    page.locator('button[aria-label="Abrir sacola"]' if page.locator('button[aria-label="Abrir sacola"]').count() else 'button[aria-label^="Abrir sacola"]').first.click()

    print("QA checkout/quick-view: PASS")
    browser.close()
