import { describe, expect, it } from "vitest";
import { hasCheckoutFieldErrors, validateCheckoutFields, type CheckoutFields } from "./checkout-validation";

const validFields: CheckoutFields = {
  customerName: "Ana Souza",
  customerEmail: "ana@example.com",
  cpf: "529.982.247-25",
  phone: "11987654321",
  cep: "01311000",
  number: "120",
  street: "Avenida Paulista",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
};

describe("checkout validation", () => {
  it("accepts a complete and valid delivery form", () => {
    const errors = validateCheckoutFields(validFields);
    expect(errors).toEqual({});
    expect(hasCheckoutFieldErrors(errors)).toBe(false);
  });

  it("requires a full name, valid email, contact and address", () => {
    const errors = validateCheckoutFields({
      ...validFields,
      customerName: "Ana",
      customerEmail: "invalid",
      cpf: "123",
      phone: "999",
      cep: "000",
      number: "",
      street: "",
      neighborhood: "",
      city: "",
      state: "São",
    });

    expect(errors).toMatchObject({
      customerName: "Informe nome e sobrenome.",
      customerEmail: "Informe um e-mail válido.",
      cpf: "Informe um CPF válido com 11 dígitos.",
      phone: "Informe um telefone válido.",
      cep: "Informe um CEP válido com 8 dígitos.",
      number: "Informe o número.",
      street: "Informe o endereço completo.",
      neighborhood: "Informe o bairro.",
      city: "Informe a cidade.",
      state: "Informe a UF com 2 letras.",
    });
    expect(hasCheckoutFieldErrors(errors)).toBe(true);
  });

  it("accepts formatted contact and postal values", () => {
    const errors = validateCheckoutFields({
      ...validFields,
      cpf: "529.982.247-25",
      phone: "(11) 98765-4321",
      cep: "01311-000",
    });

    expect(errors).toEqual({});
  });
});
