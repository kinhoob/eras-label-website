import { describe, expect, it } from "vitest";
import {
  hasCheckoutFieldErrors,
  isValidCardCvv,
  isValidCardExpiry,
  isValidCardNumber,
  isValidCpf,
  validateCheckoutFields,
  type CheckoutFields,
} from "./checkout-validation";

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
  it("accepts a complete delivery form", () => {
    const errors = validateCheckoutFields(validFields);
    expect(errors).toEqual({});
    expect(hasCheckoutFieldErrors(errors)).toBe(false);
  });

  it("reports invalid required fields", () => {
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
      cpf: "Informe um CPF válido.",
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

  it("accepts formatted CPF, phone and CEP", () => {
    const errors = validateCheckoutFields({
      ...validFields,
      cpf: "529.982.247-25",
      phone: "(11) 98765-4321",
      cep: "01311-000",
    });
    expect(errors).toEqual({});
  });

  it("validates CPF check digits", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("529.982.247-26")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });

  it("validates card number, expiry and CVV", () => {
    expect(isValidCardNumber("4111 1111 1111 1111")).toBe(true);
    expect(isValidCardNumber("4111 1111 1111 1112")).toBe(false);
    expect(isValidCardExpiry("12/30", new Date("2026-08-16T00:00:00Z"))).toBe(true);
    expect(isValidCardExpiry("07/26", new Date("2026-08-16T00:00:00Z"))).toBe(false);
    expect(isValidCardCvv("123")).toBe(true);
    expect(isValidCardCvv("12")).toBe(false);
  });

  it("checks card fields only for credit card payments", () => {
    const fields = {
      ...validFields,
      cardNumber: "4111 1111 1111 1112",
      cardName: "Ana Souza",
      cardExpiry: "12/30",
      cardCvv: "123",
    };

    expect(validateCheckoutFields(fields, "pix").cardNumber).toBeUndefined();
    expect(validateCheckoutFields(fields, "credit_card").cardNumber).toBe("Número de cartão inválido.");
  });
});
