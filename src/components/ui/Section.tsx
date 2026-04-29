import type { PropsWithChildren, ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function Section({
  title,
  subtitle,
  right,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string; right?: ReactNode }>) {
  return (
    <Card>
      <div className="vv-sectionHeader">
        <div style={{ minWidth: 0 }}>
          <div className="vv-sectionTitle">{title}</div>
          {subtitle && <div className="vv-sectionSubtitle">{subtitle}</div>}
        </div>
        {right && <div className="vv-sectionRight">{right}</div>}
      </div>
      <div className="vv-sectionBody">{children}</div>
    </Card>
  );
}

