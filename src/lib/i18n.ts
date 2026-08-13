export type Locale = "tr" | "en";

export const defaultLocale: Locale = "en";

export const translations = {
  tr: {
    siteTitle: "Base Daily Brief",
    tagline: "Base ekosisteminden süzülmüş, kaynaklı günlük özetler. Finansal tavsiye içermez — sadece haber.",
    latestBulletin: "Son bülten",
    viewBulletins: "Bültenleri gör",
    backToHome: "← Ana sayfa",
    backToList: "← Tüm bültenler",
    archive: "Arşiv",
    archiveEmpty: "Arşiv boş.",
    noBulletins: "Henüz bülten yok.",
    readBulletin: "Bülteni oku →",
    footerNote: "Manuel derlenir · Her madde kaynaklıdır",
    adminTitle: "Admin — Yeni Bülten",
    adminDate: "Tarih (YYYY-MM-DD)",
    adminTitleLabel: "Başlık",
    adminContent: "İçerik (Markdown)",
    adminLocale: "Dil",
    adminSave: "Kaydet",
    adminSuccess: "Bülten kaydedildi.",
    adminError: "Hata oluştu.",
  },
  en: {
    siteTitle: "Base Daily Brief",
    tagline: "Curated daily summaries from the Base ecosystem. Not financial advice — just news.",
    latestBulletin: "Latest bulletin",
    viewBulletins: "View bulletins",
    backToHome: "← Home",
    backToList: "← All bulletins",
    archive: "Archive",
    archiveEmpty: "Archive is empty.",
    noBulletins: "No bulletins yet.",
    readBulletin: "Read bulletin →",
    footerNote: "Manually curated · Every item is sourced",
    adminTitle: "Admin — New Bulletin",
    adminDate: "Date (YYYY-MM-DD)",
    adminTitleLabel: "Title",
    adminContent: "Content (Markdown)",
    adminLocale: "Language",
    adminSave: "Save",
    adminSuccess: "Bulletin saved.",
    adminError: "An error occurred.",
  },
} satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof typeof translations.tr;
