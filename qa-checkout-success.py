import re
from playwright.sync_api import expect, sync_playwright

BASE_URL = "https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto(BASE_URL, wait_until="networkidle")
    page.evaluate("localStorage.clear()")
    page.reload(wait_until="networkidle")

    page.locator('.product-image-button[aria-label^="Ver "]').first.click()
    expect(page.locator(".product-modal[role='dialog']")).to_be_visible()
    related = page.locator(".quick-view-related-card")
    expect(related).to_have_count(3, timeout=3000)
    related.first.click()
    expect(page.locator("#quick-view-title")).to_be_visible()
    first_product_name = page.locator("#quick-view-title").inner_text()

    page.get_by_role("button", name="ADICIONAR À SACOLA").click()
    expect(page.locator(".side-cart")).to_be_visible(timeout=3000)
    page.get_by_role("button", name=re.compile("FINALIZAR COMPRA")).click()
    expect(page).to_have_url(re.compile(r"/checkout$"))
    expect(page.locator(".checkout-page-form")).to_be_visible()

    page.locator(".checkout-page-form button[type='submit']").click()
    expect(page.locator(".field-error").first).to_be_visible(timeout=3000)
    expect(page.locator(".checkout-page-form")).to_contain_text("Informe nome e sobrenome.")

    page.route("**/api/trpc/checkout.create**", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"result":{"data":{"json":{"orderNumber":"ERAS-QA-001"}}}}',
    ))
    fields = {
        "customerName": "Ana Souza",
        "customerEmail": "ana@example.com",
        "cpf": "529.982.247-25",
        "phone": "(11) 98765-4321",
        "cep": "01311-000",
        "number": "120",
        "street": "Avenida Paulista",
        "complement": "",
        "neighborhood": "Bela Vista",
        "city": "São Paulo",
        "state": "SP",
    }
    for name, value in fields.items():
        page.locator(f"[name='{name}']").fill(value)
    page.locator(".checkout-page-form button[type='submit']").click()
    expect(page.locator("#checkout-success-title")).to_be_visible(timeout=5000)
    expect(page.locator(".checkout-success-order")).to_contain_text("RESUMO DO PEDIDO")
    expect(page.locator(".checkout-success-order")).to_contain_text(first_product_name)
    expect(page.get_by_role("link", name=re.compile("CONTINUAR COMPRANDO"))).to_be_visible()

    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(BASE_URL, wait_until="networkidle")
    page.locator('.product-image-button[aria-label^="Ver "]').first.click()
    expect(page.locator(".quick-view-related")).to_be_visible()
    expect(page.locator(".product-modal[role='dialog']")).to_be_visible()

    print("QA checkout success/validation/related: PASS")
    browser.close()
