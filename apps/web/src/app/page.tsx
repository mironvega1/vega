import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">VEGA</span>
          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/listings" className="hover:text-white transition-colors">İlanlar</Link>
          <Link href="/valuation" className="hover:text-white transition-colors">Değerleme</Link>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors">
            Giriş Yap
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Türkiye'nin İlk<br />
          <span className="text-purple-400">Emlak Zeka Altyapısı</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Sokak bazlı fiyat tahmini. Kaç günde satılır analizi. Her fiyatın neden çıktığını gösteren açıklanabilir AI.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-colors">
            Dashboard'a Git
          </Link>
          <Link href="/valuation" className="border border-gray-700 hover:border-gray-500 text-gray-300 px-8 py-3 rounded-xl font-medium transition-colors">
            Değerleme Dene
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-3 gap-6">
        {[
          {
            title: "Ultra Micro Valuation",
            desc: "Kapı numarası, kat, cephe bazlı fiyat tahmini. Gradient boosting ensemble.",
            icon: "◎",
          },
          {
            title: "Liquidity Engine",
            desc: "Bu ev kaç günde satılır? Günlük arz-talep dengesi ve alıcı yoğunluğu.",
            icon: "⚡",
          },
          {
            title: "Explainable AI",
            desc: "Her fiyatın neden çıktığını gösterir. SHAP değerleri ile şeffaf analiz.",
            icon: "◈",
          },
        ].map((f) => (
          <div key={f.title} className="border border-gray-800 rounded-2xl p-6 hover:border-purple-800 transition-colors">
            <div className="text-2xl mb-3 text-purple-400">{f.icon}</div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}