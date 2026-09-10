export type PaymentDetails = Record<string, unknown>;

export const parsePaymentDetails = (raw: unknown): PaymentDetails => {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return { ...(raw as PaymentDetails) };
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return {};
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as PaymentDetails;
      }
    } catch {
      return {};
    }
  }
  return {};
};

export const extractSlipImage = (details: PaymentDetails): string | null => {
  const candidates = [
    details.slipImage,
    details.slip_image,
    details.slipUrl,
    details.slip_url,
    details.image,
  ];

  for (const value of candidates) {
    if (typeof value !== 'string') continue;
    const slip = value.trim();
    if (slip.startsWith('http') || slip.startsWith('data:image')) {
      return slip;
    }
  }

  return null;
};
