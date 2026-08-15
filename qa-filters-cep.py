from playwright.sync_api import sync_playwright

BASE = "https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    desktop = browser.new_page(viewport={"width": 1280, "height": 720})
    desktop.goto(BASE, wait_until="networkidle")
    desktop.locator("#shop").scroll_into_view_if_needed()
    desktop.locator('select[aria-label="Filtrar por tamanho"]').select_option(label="M")
    desktop.locator('select[aria-label="Filtrar por cor"]').select_option(index=1)
    desktop.locator('select[aria-label="Filtrar por faixa de preço"]').select_option("150to200")
    result_count = desktop.locator(".shop-result-count").inner_text()
    print("RESULT COUNT:", repr(result_count))
    assert result_count.strip().lower().split()[-1] in {"produtos", "produto"}
    assert desktop.locator(".shop-filter-clear").is_visible()
    desktop.locator(".shop-filter-clear").click()
    assert desktop.locator('select[aria-label="Filtrar por tamanho"]').input_value() == "Todos"
    assert desktop.locator('select[aria-label="Filtrar por cor"]').input_value() == "Todas"
    assert desktop.locator('select[aria-label="Filtrar por faixa de preço"]').input_value() == "all"

    line = {"id": 1, "name": "Eras T-Shirt", "price": 154.9, "pixPrice": 147.16, "image": "", "alt": "Eras T-Shirt", "size": "M", "quantity": 1, "stock": 5}
    checkout = browser.new_page(viewport={"width": 375, "height": 812})
    checkout.add_init_script(f"localStorage.setItem('eras-label-cart', {repr('[' + __import__('json').dumps(line) + ']')});")
    checkout.route("https://viacep.com.br/ws/01310100/json/", lambda route: route.fulfill(status=200, content_type="application/json", body='{"logradouro":"Avenida Paulista","bairro":"Bela Vista","localidade":"São Paulo","uf":"SP"}'))
    checkout.goto(BASE + "/checkout", wait_until="networkidle")
    assert checkout.locator('input[name="cep"]').is_visible()
    checkout.locator('input[name="cep"]').fill("01310100")
    checkout.locator('input[name="street"]').wait_for(state="visible")
    checkout.wait_for_timeout(500)
    assert checkout.locator('input[name="street"]').input_value() == "Avenida Paulista"
    assert checkout.locator('input[name="neighborhood"]').input_value() == "Bela Vista"
    assert checkout.locator('input[name="city"]').input_value() == "São Paulo"
    assert checkout.locator('input[name="state"]').input_value() == "SP"
    assert "Morada preenchida automaticamente" in checkout.locator(".checkout-page-helper").inner_text()
    print("PASS filters desktop + CEP autocomplete mobile")
    browser.close()
