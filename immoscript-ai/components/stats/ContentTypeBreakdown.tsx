import type { ContentTypeBreakdownItem } from "@/lib/services/StatsService";
import { contentTypeColorClasses } from "./chartPalette";
import { DonutChart } from "./DonutChart";

export function ContentTypeBreakdown({ data }: { data: ContentTypeBreakdownItem[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <DonutChart
      centerLabel="contenus"
      centerValue={total}
      data={data.map((item) => {
        const colors = contentTypeColorClasses(item.type);
        return { key: item.type, label: item.label, count: item.count, colorBg: colors.bg, colorText: colors.text };
      })}
    />
  );
}
