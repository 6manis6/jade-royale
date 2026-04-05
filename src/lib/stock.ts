import Product from "@/lib/models/Product";

export type StockItem = {
  productId: string;
  qty: number;
  variantLabel?: string;
};

type VariantMatch = {
  matchField: "colorName" | "shadeName";
  matchValue: string;
  stock: number;
};

type StockUpdate =
  | { type: "base"; baseId: string; qty: number }
  | {
      type: "variant";
      baseId: string;
      qty: number;
      matchField: "colorName" | "shadeName";
      matchValue: string;
    };

const getBaseProductId = (productId: string) => productId.split("-")[0];
const normalizeLabel = (value?: string) => value?.trim().toLowerCase();

const parseVariantLabelFromId = (productId: string, baseId: string) => {
  if (!productId.startsWith(`${baseId}-`)) return undefined;
  const suffix = productId.slice(baseId.length + 1);
  if (!suffix) return undefined;
  return suffix.replace(/-/g, " ").trim();
};

type VariantLike = {
  colorName?: string;
  shadeName?: string;
  stock?: number;
};

type ProductLike = {
  _id: { toString: () => string };
  stock?: number;
  variants?: VariantLike[];
};

const findVariantMatch = (
  variants: VariantLike[] | undefined,
  label: string | undefined,
): VariantMatch | null => {
  const normalized = normalizeLabel(label);
  if (!normalized || !variants?.length) return null;

  for (const variant of variants) {
    const shade = normalizeLabel(variant.shadeName);
    if (shade && shade === normalized) {
      return {
        matchField: "shadeName",
        matchValue: variant.shadeName || "",
        stock: typeof variant.stock === "number" ? variant.stock : 0,
      };
    }
    const color = normalizeLabel(variant.colorName);
    if (color && color === normalized) {
      return {
        matchField: "colorName",
        matchValue: variant.colorName || "",
        stock: typeof variant.stock === "number" ? variant.stock : 0,
      };
    }
  }

  return null;
};

const coerceQty = (value: unknown) => {
  const qty = Number(value);
  if (!Number.isFinite(qty)) return 0;
  return Math.max(0, Math.floor(qty));
};

export async function verifyAndDecrementStock(items: StockItem[]) {
  const aggregated = new Map<
    string,
    { baseId: string; qty: number; label?: string }
  >();

  for (const item of items) {
    const baseId = getBaseProductId(String(item.productId || ""));
    if (!baseId) {
      return { success: false, error: "Invalid product reference" } as const;
    }

    const qty = coerceQty(item.qty);
    if (qty <= 0) {
      return { success: false, error: "Invalid item quantity" } as const;
    }

    const label =
      item.variantLabel || parseVariantLabelFromId(item.productId, baseId);
    const normalizedLabel = normalizeLabel(label);
    const key = `${baseId}::${normalizedLabel || ""}`;
    const existing = aggregated.get(key);
    if (existing) {
      existing.qty += qty;
    } else {
      aggregated.set(key, { baseId, qty, label });
    }
  }

  const baseIds = Array.from(
    new Set(Array.from(aggregated.values()).map((v) => v.baseId)),
  );
  const products = await Product.find(
    { _id: { $in: baseIds } },
    "stock variants",
  );
  const productMap = new Map(
    (products as ProductLike[]).map((product) => [
      product._id.toString(),
      product,
    ]),
  );

  const updates: StockUpdate[] = [];

  for (const entry of aggregated.values()) {
    const product = productMap.get(entry.baseId);
    if (!product) {
      return { success: false, error: "Product not found" } as const;
    }

    const variants = product.variants as VariantLike[] | undefined;
    const labelNormalized = normalizeLabel(entry.label);
    const match = findVariantMatch(variants, labelNormalized);

    if (match) {
      if (match.stock < entry.qty) {
        return { success: false, error: "Insufficient variant stock" } as const;
      }
      updates.push({
        type: "variant",
        baseId: entry.baseId,
        qty: entry.qty,
        matchField: match.matchField,
        matchValue: match.matchValue,
      });
      continue;
    }

    if (labelNormalized && variants?.length) {
      return { success: false, error: "Variant not available" } as const;
    }

    const stock = typeof product.stock === "number" ? product.stock : 0;
    if (stock < entry.qty) {
      return { success: false, error: "Insufficient stock" } as const;
    }

    updates.push({ type: "base", baseId: entry.baseId, qty: entry.qty });
  }

  for (const update of updates) {
    if (update.type === "base") {
      const result = await Product.updateOne(
        { _id: update.baseId, stock: { $gte: update.qty } },
        { $inc: { stock: -update.qty } },
      );
      if (result.matchedCount === 0) {
        return { success: false, error: "Insufficient stock" } as const;
      }
      continue;
    }

    const result = await Product.updateOne(
      {
        _id: update.baseId,
        "variants.stock": { $gte: update.qty },
        $or: [
          { "variants.colorName": update.matchValue },
          { "variants.shadeName": update.matchValue },
        ],
      },
      { $inc: { "variants.$.stock": -update.qty } },
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Insufficient variant stock" } as const;
    }
  }

  return { success: true } as const;
}
