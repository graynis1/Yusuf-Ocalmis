export const metadata = { title: "Gizlilik Politikası" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Gizlilik Politikası</h1>
      <p>
        Bu politika, FİYATBUL'u kullanırken hangi verileri topladığımızı ve nasıl koruduğumuzu
        açıklar.
      </p>
      <h2>Topladığımız veriler</h2>
      <ul className="list-disc pl-5">
        <li>Hesap bilgileri (e-posta, ad) — yalnızca kayıt olursan.</li>
        <li>Favoriler ve fiyat alarmları — sana hizmet sunmak için.</li>
        <li>Tıklama olayları — IP adresin <strong>hash'lenerek</strong> saklanır, düz tutulmaz.</li>
      </ul>
      <h2>Çerezler</h2>
      <p>Oturum yönetimi için zorunlu çerezler kullanırız. Minimal tutmaya özen gösteririz.</p>
      <h2>Haklarının</h2>
      <p>Verilerinin silinmesini istemek için destek@fiyatbul.com adresine yazabilirsin.</p>
    </>
  );
}
