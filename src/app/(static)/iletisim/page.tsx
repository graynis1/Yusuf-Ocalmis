export const metadata = { title: "İletişim" };

export default function ContactPage() {
  return (
    <>
      <h1>İletişim</h1>
      <p>Soruların, iş birliği teklifleri ve mağaza başvuruları için bize ulaş.</p>
      <h2>E-posta</h2>
      <p>destek@fiyatbul.com</p>
      <h2>Satıcı olmak ister misin?</h2>
      <p>
        Ürünlerini FİYATBUL'da listelemek için <a className="text-[var(--brand)]" href="/satici/kayit">satıcı kaydı</a> sayfasından
        başvurabilirsin.
      </p>
    </>
  );
}
