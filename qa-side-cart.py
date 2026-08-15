import json
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer/"


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


def add_first_product(page):
    page.locator(".shop-section .product-card").first.scroll_into_view_if_needed()
    page.locator(".shop-section .product-card .product-image-button").first.click()
    page.get_by_role("button", name="ADICIONAR À SACOLA").click()
    page.wait_for_timeout(750)
    assert_true(page.locator(".side-cart").count() == 1, "a Sacola lateral não abriu após adicionar o produto")


def run():
    results = {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto(BASE_URL, wait_until="networkidle")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")
        add_first_product(page)
        side = page.locator(".side-cart")
        assert_true(side.get_by_text("Seu Carrinho (1)").count() == 1, "o contador inicial do drawer não é 1")
        initial_total = side.locator(".cart-total-row.final strong").inner_text()

        side.locator(".quantity-stepper button").nth(1).click()
        page.wait_for_timeout(120)
        assert_true(side.get_by_text("Seu Carrinho (2)").count() == 1, "aumentar quantidade não atualizou o contador")
        increased_total = side.locator(".cart-total-row.final strong").inner_text()
        assert_true(increased_total != initial_total, "o total não mudou ao aumentar quantidade")

        side.locator(".quantity-stepper button").nth(0).click()
        page.wait_for_timeout(120)
        assert_true(side.get_by_text("Seu Carrinho (1)").count() == 1, "diminuir quantidade não atualizou o contador")
        restored_total = side.locator(".cart-total-row.final strong").inner_text()
        assert_true(restored_total == initial_total, "o total não voltou ao valor original")

        side.locator(".cart-item-remove").click()
        page.wait_for_timeout(200)
        assert_true(side.get_by_text("Sua sacola está vazia.").count() == 1, "remover item não esvaziou a Sacola")
        page.get_by_role("button", name="Desfazer").click()
        page.wait_for_timeout(180)
        assert_true(side.get_by_text("Seu Carrinho (1)").count() == 1, "Desfazer não restaurou o item")
        page.keyboard.press("Escape")
        page.wait_for_timeout(120)
        assert_true(page.locator(".side-cart").count() == 0, "Escape não fechou a Sacola lateral")
        results["desktop"] = {"open": True, "quantity": "1 → 2 → 1", "total": "atualizado", "remove_undo": True, "escape": True}
        page.close()

        mobile = browser.new_page(viewport={"width": 375, "height": 812}, is_mobile=True, has_touch=True)
        mobile.goto(BASE_URL, wait_until="networkidle")
        mobile.evaluate("localStorage.clear()")
        mobile.reload(wait_until="networkidle")
        add_first_product(mobile)
        mobile_side = mobile.locator(".side-cart")
        assert_true(mobile_side.get_by_text("Seu Carrinho (1)").count() == 1, "o drawer não abriu corretamente no mobile")
        mobile_side.locator(".quantity-stepper button").nth(1).click()
        assert_true(mobile_side.get_by_text("Seu Carrinho (2)").count() == 1, "quantidade não atualizou no mobile")
        mobile.get_by_role("button", name="Fechar carrinho").click()
        assert_true(mobile.locator(".side-cart").count() == 0, "fecho por botão não funcionou no mobile")
        results["mobile"] = {"open": True, "quantity": "1 → 2", "close_button": True}
        mobile.close()
        browser.close()

    print(json.dumps({"status": "passed", "checks": results}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        run()
    except Exception as error:
        print(json.dumps({"status": "failed", "error": str(error)}, ensure_ascii=False))
        sys.exit(1)
