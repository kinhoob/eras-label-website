from playwright.sync_api import sync_playwright

BASE_URL = "https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    page.goto(BASE_URL, wait_until="networkidle")
    button = page.locator('button[aria-label^="Ver "]').first
    print("buttons", page.locator('button[aria-label^="Ver "]').count())
    print("before modal", page.locator(".product-modal").count())
    button.scroll_into_view_if_needed()
    print("button visible", button.is_visible(), "enabled", button.is_enabled())
    print("button html", button.evaluate("el => el.outerHTML.slice(0, 500)"))
    button.click()
    page.wait_for_timeout(500)
    print("after modal", page.locator(".product-modal").count())
    print("dialog modal", page.locator('.product-modal[role="dialog"]').count())
    print("url", page.url)
    browser.close()
