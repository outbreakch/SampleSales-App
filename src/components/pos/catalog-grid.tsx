import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStaffCopy } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { CatalogItemView, CountryConfig } from "@/lib/types";

export function CatalogGrid({
  items,
  country,
  language,
  onAddItem
}: {
  items: CatalogItemView[];
  country: CountryConfig;
  language?: string | null;
  onAddItem: (item: CatalogItemView) => void;
}) {
  const copy = getStaffCopy(language);

  return (
    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="flex flex-col gap-3 bg-white/95 p-4 lg:p-4">
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-stone">{item.sku}</p>
            <h3 className="text-lg font-semibold leading-tight text-ink lg:text-[1.05rem]">{item.name}</h3>
            <p className="text-sm text-stone">{item.taxCategory}</p>
          </div>
          <div className="mt-auto flex items-end justify-between gap-3">
            <span className="text-xl font-semibold leading-none text-ink lg:text-[1.35rem]">
              {formatCurrency(item.price, country.currencyCode, country.locale)}
            </span>
            <Button className="catalog-add-button h-10 px-4 text-sm" onClick={() => onAddItem(item)}>
              <Plus className="mr-1.5 size-4" />
              {copy.navSell === "Vente" ? "Ajouter" : "Add"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
