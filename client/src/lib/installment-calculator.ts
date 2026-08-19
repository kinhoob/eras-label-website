export function calculateInstallmentTotal(principal: number, installments: number, monthlyRatePercent: number, interestFreeInstallments: number = 3) {
  // Se o número de parcelas for menor ou igual ao limite sem juros, ou se não houver taxa, retorna o principal sem juros.
  if (installments <= Math.max(1, interestFreeInstallments) || monthlyRatePercent <= 0) {
    return principal;
  }
  // Se ultrapassar o limite sem juros, cobra juros compostos sobre as parcelas excedentes.
  const financedCount = installments - Math.max(1, interestFreeInstallments);
  return principal * Math.pow(1 + monthlyRatePercent / 100, financedCount);
}

export function calculateInstallmentAmount(total: number, installments: number) {
  return installments > 0 ? total / installments : total;
}

export function buildInstallmentOptions(total: number, maxInstallments: number, monthlyRatePercent: number, interestFreeInstallments: number = 3) {
  return Array.from({ length: Math.max(1, Math.min(24, Math.floor(maxInstallments))) }, (_, index) => {
    const installments = index + 1;
    const financedTotal = calculateInstallmentTotal(total, installments, monthlyRatePercent, interestFreeInstallments);
    return {
      installments,
      total: financedTotal,
      amount: calculateInstallmentAmount(financedTotal, installments),
      interest: Math.max(0, financedTotal - total),
      isInterestFree: installments <= Math.max(1, interestFreeInstallments),
    };
  });
}
