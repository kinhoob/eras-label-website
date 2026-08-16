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

export type PaymentFieldName = "cardNumber" | "cardName" | "cardExpiry" | "cardCvv";

export type CheckoutFields = Record<CheckoutFieldName, string> & Partial<Record<PaymentFieldName, string>>;
export type CheckoutFieldErrors = Partial<Record<CheckoutFieldName | PaymentFieldName, string>>;
export type CheckoutPaymentMethod = "pix" | "credit_card";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Remove pontuação para que as validações trabalhem apenas com os dígitos reais. */
export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** Formata CPF progressivamente sem permitir mais de onze dígitos. */
export function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Verifica os dois dígitos verificadores do CPF e rejeita sequências repetidas. */
export function isValidCpf(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^([0-9])\1{10}$/.test(digits)) return false;

  let firstSum = 0;
  for (let index = 0; index < 9; index += 1) firstSum += Number(digits[index]) * (10 - index);
  const firstDigit = (firstSum * 10) % 11 === 10 ? 0 : (firstSum * 10) % 11;
  if (firstDigit !== Number(digits[9])) return false;

  let secondSum = 0;
  for (let index = 0; index < 10; index += 1) secondSum += Number(digits[index]) * (11 - index);
  const secondDigit = (secondSum * 10) % 11 === 10 ? 0 : (secondSum * 10) % 11;
  return secondDigit === Number(digits[10]);
}

/** Formata cartões em grupos de quatro dígitos para reduzir erros de digitação. */
export function formatCardNumber(value: string) {
  return onlyDigits(value).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** Valida o cartão com o algoritmo de Luhn, sem enviar o número bruto ao servidor. */
export function isValidCardNumber(value: string) {
  const digits = onlyDigits(value);
  if (digits.length < 13 || digits.length > 19 || /^([0-9])\1+$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/** Valida MM/AA e impede datas de validade no passado. */
export function isValidCardExpiry(value: string, now = new Date()) {
  const match = value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

/** Formata a validade do cartão como MM/AA. */
export function formatCardExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/** Valida CVV com três ou quatro dígitos. */
export function isValidCardCvv(value: string) {
  return /^\d{3,4}$/.test(onlyDigits(value));
}

export function validatePaymentFields(fields: Partial<Record<PaymentFieldName, string>>) {
  const errors: CheckoutFieldErrors = {};
  const cardNumber = fields.cardNumber ?? "";
  const cardName = fields.cardName?.trim() ?? "";
  const cardExpiry = fields.cardExpiry ?? "";
  const cardCvv = fields.cardCvv ?? "";

  if (!isValidCardNumber(cardNumber)) errors.cardNumber = "Número de cartão inválido.";
  if (cardName.split(/\s+/).filter(Boolean).length < 2) errors.cardName = "Informe o nome impresso no cartão.";
  if (!isValidCardExpiry(cardExpiry)) errors.cardExpiry = "Validade inválida ou expirada.";
  if (!isValidCardCvv(cardCvv)) errors.cardCvv = "CVV inválido.";

  return errors;
}

export function validateCheckoutFields(fields: CheckoutFields, paymentMethod: CheckoutPaymentMethod = "pix"): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const nameParts = fields.customerName.trim().split(/\s+/).filter(Boolean);
  const phoneDigits = onlyDigits(fields.phone);
  const cepDigits = onlyDigits(fields.cep);

  if (nameParts.length < 2) errors.customerName = "Informe nome e sobrenome.";
  if (!emailPattern.test(fields.customerEmail.trim())) errors.customerEmail = "Informe um e-mail válido.";
  if (!isValidCpf(fields.cpf)) errors.cpf = "Informe um CPF válido.";
  if (phoneDigits.length < 10) errors.phone = "Informe um telefone válido.";
  if (cepDigits.length !== 8) errors.cep = "Informe um CEP válido com 8 dígitos.";
  if (!fields.number.trim()) errors.number = "Informe o número.";
  if (fields.street.trim().length < 3) errors.street = "Informe o endereço completo.";
  if (fields.neighborhood.trim().length < 2) errors.neighborhood = "Informe o bairro.";
  if (fields.city.trim().length < 2) errors.city = "Informe a cidade.";
  if (!/^[A-Za-zÀ-ÿ]{2}$/.test(fields.state.trim())) errors.state = "Informe a UF com 2 letras.";

  if (paymentMethod === "credit_card") {
    Object.assign(errors, validatePaymentFields(fields));
  }

  return errors;
}

export function hasCheckoutFieldErrors(errors: CheckoutFieldErrors) {
  return Object.keys(errors).length > 0;
}
