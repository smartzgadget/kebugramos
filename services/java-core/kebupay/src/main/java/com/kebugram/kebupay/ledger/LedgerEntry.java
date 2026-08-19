package com.kebugram.kebupay.ledger;

import java.time.Instant;

// Mirrors Zod LedgerEntrySchema — amountMinor sovereign minor units, idempotencyKey UUID
public record LedgerEntry(String id, Instant at, long amountMinor, String currency, String counterparty, String idempotencyKey, String status) {}
