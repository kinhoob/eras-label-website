import json
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer/"


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


def run():
    results = {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto(BASE_URL, wait_until="networkidle")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")

        product_card = page.locator(".shop-section .product-card").first
        product_card.scroll_into_view_if_needed()
        product_name = product_card.locator(".product-name").inner_text()
        product_card.locator(".product-image-button").click()
        add_button = page.get_by_role("button", name="ADICIONAR À SACOLA")
        add_button.click()

        confirmation_button = page.locator(".add-to-cart-button.is-added")
        assert_true(confirmation_button.count() == 1, "botão não entrou no estado visual de confirmação")
        assert_true("ADICIONADO À SACOLA" in confirmation_button.inner_text(), "texto de confirmação ausente no botão")
        page.wait_for_timeout(250)
        toast = page.get_by_text("Adicionado à sacola", exact=False)
        assert_true(toast.count() > 0, "toast de confirmação não foi exibido")
        toast_region = page.locator("[data-sonner-toast]")
        assert_true(toast_region.count() > 0 and product_name in toast_region.first.inner_text(), "toast não identifica o produto adicionado")
        results["desktop_feedback"] = {"product": product_name, "button": "ADICIONADO À SACOLA", "toast": "produto identificado"}

        page.wait_for_timeout(750)
        stored = page.evaluate("localStorage.getItem('eras-label-cart')")
        assert_true(stored and '"quantity":1' in stored, "Sacola não foi gravada no localStorage")
        page.reload(wait_until="networkidle")
        badge = page.locator(".bag-badge")
        assert_true(badge.inner_text() == "1", "contador não foi recuperado após recarregar")
        page.locator(".bag-button").click()
        assert_true("Seu Carrinho (1)" in page.locator(".side-cart").inner_text(), "item persistido não apareceu no carrinho lateral")
        results["desktop_persistence"] = {"badge": "1", "side_cart": "Seu Carrinho (1)"}
        page.close()

        mobile = browser.new_page(viewport={"width": 375, "height": 812}, is_mobile=True, has_touch=True)
        mobile.goto(BASE_URL, wait_until="networkidle")
        mobile.evaluate("localStorage.clear()")
        mobile.reload(wait_until="networkidle")
        mobile.locator(".shop-section .product-card").first.scroll_into_view_if_needed()
        mobile.locator(".shop-section .product-card .product-image-button").first.click()
        mobile.get_by_role("button", name="ADICIONAR À SACOLA").click()
        assert_true(mobile.locator(".add-to-cart-button.is-added").count() == 1, "confirmação do botão não apareceu no mobile")
        mobile.wait_for_timeout(250)
        assert_true(mobile.get_by_text("Adicionado à sacola", exact=False).count() > 0, "toast não apareceu no mobile")
        mobile.wait_for_timeout(750)
        mobile.reload(wait_until="networkidle")
        assert_true(mobile.locator(".bag-badge").inner_text() == "1", "Sacola não persistiu no mobile após recarregar")
        results["mobile_feedback_persistence"] = {"button": "confirmado", "toast": "visível", "badge_after_reload": "1"}
        mobile.close()
        browser.close()

    print(json.dumps({"status": "passed", "checks": results}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        run()
    except Exception as error:
        print(json.dumps({"status": "failed", "error": str(error)}, ensure_ascii=False))
        sys.exit(1)
