export type CepAddress = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

export async function lookupCep(value: string, signal?: AbortSignal): Promise<CepAddress> {
  const cep = normalizeCep(value);
  if (cep.length !== 8) throw new Error("CEP inválido");

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal });
  if (!response.ok) throw new Error("Não foi possível consultar o CEP");

  const data = (await response.json()) as ViaCepResponse;
  if (data.erro || !data.localidade || !data.uf) throw new Error("CEP não encontrado");

  return {
    street: data.logradouro?.trim() ?? "",
    neighborhood: data.bairro?.trim() ?? "",
    city: data.localidade.trim(),
    state: data.uf.trim().toUpperCase(),
  };
}
