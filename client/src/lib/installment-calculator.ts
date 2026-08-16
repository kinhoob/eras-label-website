export function calculateInstallmentTotal(principal: number, installments: number, monthlyRatePercent: number) {
  if (installments <= 1 || monthlyRatePercent <= 0) return principal;
  return principal * Math.pow(1 + monthlyRatePercent / 100, installments);
}

export function calculateInstallmentAmount(total: number, installments: number) {
  return installments > 0 ? total / installments : total;
}

export function buildInstallmentOptions(total: number, maxInstallments: number, monthlyRatePercent: number) {
  return Array.from({ length: Math.max(1, Math.min(24, Math.floor(maxInstallments))) }, (_, index) => {
    const installments = index + 1;
    const financedTotal = calculateInstallmentTotal(total, installments, monthlyRatePercent);
    return {
      installments,
      total: financedTotal,
      amount: calculateInstallmentAmount(financedTotal, installments),
      interest: Math.max(0, financedTotal - total),
    };
  });
}
