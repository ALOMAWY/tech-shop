"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/Card";

function tokenValue(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * Renders a QR code for a Sham Cash payment code. The QR payload is the code
 * itself (`PAY-XXXX-XXXX`) — a barcode the branch/agent can scan to confirm the
 * transfer. Colors come from design tokens, not hardcoded hex.
 */
export function PaymentQr({ value, label }: { value: string; label?: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const dark = tokenValue("--on-accent", "#0e1b26");
    const light = tokenValue("--bg", "#f2f4f6");
    QRCode.toDataURL(value, { margin: 1, width: 220, color: { dark, light } })
      .then((url) => {
        if (mounted) setDataUrl(url);
      })
      .catch(() => {
        if (mounted) setDataUrl(null);
      });
    return () => {
      mounted = false;
    };
  }, [value]);

  return (
    <Card pad className="flex min-w-[210px] flex-col items-center gap-3 border-line bg-surface-2 text-center">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt={label ?? `رمز الدفع ${value}`} width={180} height={180} />
      ) : (
        <div className="grid h-[180px] w-[180px] place-items-center text-xs text-text-2">
          …
        </div>
      )}
      <span className="mono lat text-sm tracking-[0.14em] text-text">{value}</span>
    </Card>
  );
}