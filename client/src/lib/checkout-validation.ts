export type CheckoutFieldName =
  | "customerName"
  | "customerEmail"
  | "cpf"
  | "phone"
  | "cep"
  | "number"
  | "street"
  | "neighborhood"
  | "city"
  | "state";

export type CheckoutFields = Record<CheckoutFieldName, string>;
export type CheckoutFieldErrors = Partial<Record<CheckoutFieldName, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckoutFields(fields: CheckoutFields): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const nameParts = fields.customerName.trim().split(/\s+/).filter(Boolean);
  const cpfDigits = fields.cpf.replace(/\D/g, "");
  const phoneDigits = fields.phone.replace(/\D/g, "");
  const cepDigits = fields.cep.replace(/\D/g, "");

  if (nameParts.length < 2) errors.customerName = "Informe nome e sobrenome.";
  if (!emailPattern.test(fields.customerEmail.trim())) errors.customerEmail = "Informe um e-mail válido.";
  if (cpfDigits.length !== 11) errors.cpf = "Informe um CPF válido com 11 dígitos.";
  if (phoneDigits.length < 10) errors.phone = "Informe um telefone válido.";
  if (cepDigits.length !== 8) errors.cep = "Informe um CEP válido com 8 dígitos.";
  if (!fields.number.trim()) errors.number = "Informe o número.";
  if (fields.street.trim().length < 3) errors.street = "Informe o endereço completo.";
  if (fields.neighborhood.trim().length < 2) errors.neighborhood = "Informe o bairro.";
  if (fields.city.trim().length < 2) errors.city = "Informe a cidade.";
  if (!/^[A-Za-zÀ-ÿ]{2}$/.test(fields.state.trim())) errors.state = "Informe a UF com 2 letras.";

  return errors;
}

export function hasCheckoutFieldErrors(errors: CheckoutFieldErrors) {
  return Object.keys(errors).length > 0;
}
