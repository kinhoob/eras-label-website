import json
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer/"


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


def run():
    results = {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)

        desktop = browser.new_page(viewport={"width": 1280, "height": 720})
        desktop.goto(BASE_URL, wait_until="networkidle")
        desktop.locator(".shop-section .product-card").first.scroll_into_view_if_needed()
        product_image = desktop.locator(".shop-section .product-card .product-image-button").first
        image = product_image.locator("img")
        before = image.evaluate("element => getComputedStyle(element).transform")
        product_image.hover()
        desktop.wait_for_timeout(650)
        after = image.evaluate("element => getComputedStyle(element).transform")
        assert_true(after != "none" and after != before, f"zoom hover não aplicado: antes={before}, depois={after}")
        results["desktop_zoom"] = {"before": before, "after": after}

        header = desktop.locator(".site-header")
        desktop.mouse.wheel(0, 720)
        desktop.wait_for_timeout(140)
        assert_true("is-hidden" in (header.get_attribute("class") or ""), "navbar não ocultou durante scroll descendente")
        desktop.wait_for_timeout(260)
        assert_true("is-visible" in (header.get_attribute("class") or ""), "navbar não reapareceu após a pausa")
        results["desktop_navbar"] = "oculta durante scroll e visível após pausa"

        mobile = browser.new_page(viewport={"width": 375, "height": 812}, is_mobile=True, has_touch=True)
        mobile.goto(BASE_URL, wait_until="networkidle")
        mobile_product = mobile.locator(".shop-section .product-card .product-image-button").first
        mobile_product.scroll_into_view_if_needed()
        mobile_product.click()
        mobile.get_by_role("button", name="ADICIONAR À SACOLA").click()
        badge = mobile.locator(".bag-badge")
        assert_true(badge.inner_text() == "1", f"contador esperado 1, encontrado {badge.inner_text()}")
        assert_true("Seu Carrinho (1)" in mobile.locator(".side-cart").inner_text(), "side cart não refletiu o item adicionado")
        results["mobile_cart"] = {"badge": badge.inner_text(), "side_cart": "Seu Carrinho (1)"}
        mobile.locator(".side-cart .close-button").click()
        mobile.wait_for_timeout(220)

        mobile.mouse.wheel(0, 720)
        mobile.wait_for_timeout(140)
        mobile_header = mobile.locator(".site-header")
        assert_true("is-hidden" in (mobile_header.get_attribute("class") or ""), "navbar mobile não ocultou durante scroll")
        mobile.wait_for_timeout(260)
        assert_true("is-visible" in (mobile_header.get_attribute("class") or ""), "navbar mobile não reapareceu após pausa")
        results["mobile_navbar"] = "oculta durante scroll e visível após pausa"

        mobile.close()
        desktop.close()
        browser.close()

    print(json.dumps({"status": "passed", "checks": results}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        run()
    except Exception as error:
        print(json.dumps({"status": "failed", "error": str(error)}, ensure_ascii=False))
        sys.exit(1)
