package com.kebugram.minipay;

import java.util.Map;

// Java delegates to kebupay ledger — MiniPay is QR intent + same ledger truth
public class MiniPayService {
  public Map<String,String> qr(String payeeId, Long amountMinor, String currency) {
    String payload = "kebupay://pay?payee=" + payeeId + (amountMinor!=null ? "&amount="+amountMinor+"&cur="+currency : "");
    return Map.of("payload", payload, "qrUrl", "https://qr.kebugram.com/?d=" + payload);
  }
}
