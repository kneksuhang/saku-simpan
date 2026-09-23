import React, { useMemo } from "react";
import { Product, Category, Tag } from "../types";
import { formatRupiah } from "../utils/format";
import {
  Package,
  Wallet,
  Calculator,
  FolderTree,
  Tags,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

interface StatisticsViewProps {
  products: Product[];
  categories: Category[];
  tags: Tag[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  products,
  categories,
  tags,
}) => {
  // 1. Ringkasan Metrics
  const totalProducts = products.length;
  const totalPrice = useMemo(
    () => products.reduce((acc, curr) => acc + (curr.price || 0), 0),
    [products],
  );
  const avgPrice =
    totalProducts > 0 ? Math.round(totalPrice / totalProducts) : 0;
  const totalCategories = categories.length;
  const totalTags = tags.length;

  // 2. Bar Chart Data: Produk per Kategori & Total Nilai per Kategori
  const categoryBarData = useMemo(() => {
    const map = new Map<
      string,
      { count: number; totalValue: number; name: string }
    >();
    categories.forEach((cat) => {
      map.set(cat.id, { count: 0, totalValue: 0, name: cat.name });
    });
    map.set("uncategorized", {
      count: 0,
      totalValue: 0,
      name: "Tanpa Kategori",
    });

    products.forEach((p) => {
      const key = p.categoryId || "uncategorized";
      const existing = map.get(key) || {
        count: 0,
        totalValue: 0,
        name: "Lainnya",
      };
      existing.count += 1;
      existing.totalValue += p.price;
      map.set(key, existing);
    });

    return Array.from(map.values())
      .filter(
        (item) =>
          item.count > 0 || categories.some((c) => c.name === item.name),
      )
      .slice(0, 8);
  }, [products, categories]);

  // 3. Line Chart Data: Urutan produk berdasarkan waktu / harga kumulatif
  const priceTimelineData = useMemo(() => {
    const sorted = [...products].sort((a, b) => a.createdAt - b.createdAt);
    let runningTotal = 0;
    return sorted.map((p, index) => {
      runningTotal += p.price;
      return {
        name: p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name,
        harga: p.price,
        akumulasi: runningTotal,
        index: index + 1,
      };
    });
  }, [products]);

  // 4. Pie Chart Data: Proporsi jumlah item per kategori
  const pieData = useMemo(() => {
    const data = categoryBarData.map((c) => ({
      name: c.name,
      value: c.count,
    }));
    return data.filter((d) => d.value > 0);
  }, [categoryBarData]);

  const PIE_COLORS = [
    "#E64A19", // Shu-iro
    "#005F73", // Ruri-iro
    "#8B5FBF", // Fuji-iro
    "#3B7A57", // Tokiwa-iro
    "#F2B705", // Yamabuki-iro
    "#7A5C43", // Kurumi-iro
    "#D94126", // Hi-iro
    "#51A8DD", // Gunjyo-iro
  ];

  return (
    <div id="statistics-view" className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-(--text-primary)">
          Dasbor Statistik
        </h2>
      </div>

      {/* 5 Modul Ringkasan Matriks */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {/* Total Produk */}
        <div className="rounded-xl border border-(--border-color) bg-(--bg-card) p-4 shadow-xs">
          <div className="flex items-center justify-between text-(--text-muted)">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Produk
            </span>
            <Package className="w-4 h-4 text-(--accent-color)" />
          </div>
          <p className="font-num text-2xl sm:text-3xl font-bold text-(--text-primary) mt-2">
            {totalProducts}
          </p>
        </div>

        {/* Jumlah Harga */}
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-(--border-color) bg-(--bg-card) p-4 shadow-xs">
          <div className="flex items-center justify-between text-(--text-muted)">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Jumlah Harga
            </span>
            <Wallet className="w-4 h-4 text-(--accent-color)" />
          </div>
          <p className="font-num text-xl sm:text-2xl font-bold text-(--accent-color) mt-2 truncate">
            {formatRupiah(totalPrice)}
          </p>
        </div>

        {/* Harga Rata-Rata */}
        <div className="rounded-xl border border-(--border-color) bg-(--bg-card) p-4 shadow-xs">
          <div className="flex items-center justify-between text-(--text-muted)">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Harga Rata-Rata
            </span>
            <Calculator className="w-4 h-4 text-(--accent-color)" />
          </div>
          <p className="font-num text-xl sm:text-2xl font-bold text-(--text-primary) mt-2 truncate">
            {formatRupiah(avgPrice)}
          </p>
        </div>

        {/* Jumlah Kategori */}
        <div className="rounded-xl border border-(--border-color) bg-(--bg-card) p-4 shadow-xs">
          <div className="flex items-center justify-between text-(--text-muted)">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Jumlah Kategori
            </span>
            <FolderTree className="w-4 h-4 text-(--accent-color)" />
          </div>
          <p className="font-num text-2xl sm:text-3xl font-bold text-(--text-primary) mt-2">
            {totalCategories}
          </p>
        </div>

        {/* Jumlah Tag */}
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-(--border-color) bg-(--bg-card) p-4 shadow-xs">
          <div className="flex items-center justify-between text-(--text-muted)">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Jumlah Tag
            </span>
            <Tags className="w-4 h-4 text-(--accent-color)" />
          </div>
          <p className="font-num text-2xl sm:text-3xl font-bold text-(--text-primary) mt-2">
            {totalTags}
          </p>
        </div>
      </div>

      {/* Visualisasi Grafik: Bar, Line, Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Bar Chart: Jumlah Produk & Total Nilai per Kategori */}
        <div className="rounded-xl border border-(--border-color) bg-(--bg-card) p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-(--accent-color)" />
              <h3 className="text-sm font-bold text-(--text-primary)">
                Distribusi Produk per Kategori
              </h3>
            </div>
          </div>

          <div className="h-64 w-full">
            {categoryBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryBarData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      borderRadius: "12px",
                      color: "var(--text-primary)",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`${val} produk`, "Jumlah"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--accent-color)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-(--text-muted)">
                Belum ada data kategori
              </div>
            )}
          </div>
        </div>

        {/* 2. Line Chart: Gelombang Meliuk Sesuai Titik Data */}
        <div className="rounded-xl border border-(--border-color) bg-(--bg-card) p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-(--accent-color)" />
              <h3 className="text-sm font-bold text-(--text-primary)">
                Gelombang Tren Harga Produk
              </h3>
            </div>
          </div>

          <div className="h-64 w-full">
            {priceTimelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceTimelineData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      borderRadius: "12px",
                      color: "var(--text-primary)",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [
                      formatRupiah(Number(val) || 0),
                      "Harga",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="harga"
                    stroke="var(--accent-color)"
                    strokeWidth={2.5}
                    dot={{ fill: "var(--accent-color)", r: 4 }}
                    activeDot={{ r: 7 }}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-(--text-muted)">
                Belum ada produk tersimpan
              </div>
            )}
          </div>
        </div>

        {/* 3. Pie Chart: Proporsi Kategori */}
        <div className="rounded-xl border border-(--border-color) bg-(--bg-card) p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-(--accent-color)" />
              <h3 className="text-sm font-bold text-(--text-primary)">
                Proporsi Wishlist per Kategori
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <div className="h-56 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                      animationDuration={1300}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--border-color)",
                        borderRadius: "12px",
                        color: "var(--text-primary)",
                        fontSize: "12px",
                      }}
                      formatter={(v: any, name: any) => [
                        `${v} barang`,
                        String(name),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                // buat supaya ketengah
                <div className="h-full flex items-center justify-center text-xs text-(--text-muted)">
                  Belum ada pembagian kategori
                </div>
              )}
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-2">
              {pieData.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs py-1 border-b border-(--border-color)"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                      }}
                    />
                    <span className="font-semibold text-(--text-primary)">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-num text-(--text-muted)">
                    {item.value} item (
                    {Math.round((item.value / totalProducts) * 100) || 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
