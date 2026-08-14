import React from "react";
import { Flame } from "lucide-react";

type RedtentLogoProps = {
  compact?: boolean;
  tagline?: boolean;
  className?: string;
};

export function RedtentLogo({ compact = false, tagline = false, className = "" }: RedtentLogoProps) {
  return <span className={`redtent-logo ${compact ? "redtent-logo--compact" : ""} ${className}`.trim()} aria-label="Redtent">
    <span className="redtent-logo__mark" aria-hidden="true"><Flame strokeWidth={1.8} /></span>
    {!compact && <span className="redtent-logo__copy"><span className="redtent-logo__name">Redtent</span>{tagline && <span className="redtent-logo__tagline">Your cycle. Your care. Your power.</span>}</span>}
  </span>;
}
