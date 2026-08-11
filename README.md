# Base Daily Brief

Base ekosisteminden süzülmüş, kaynaklı günlük özet bültenleri.

**MVP:** Manuel admin (local) + Git ile yayın. x402 ödeme henüz yok.

## Akış (Git-flow)

```
1. Local'de npm run dev
2. /admin ile bülten ekle  →  content/bulletins/YYYY-MM-DD.md oluşur
3. git add content/bulletins && git commit -m "brief: YYYY-MM-DD"
4. git push
5. Vercel otomatik deploy → canlı site güncellenir
```

Vercel üzerinde dosya yazılmaz; bültenler **Git üzerinden** yayınlanır.

## Rotalar

| Rota | Açıklama |
|------|----------|
| `/` | Landing |
| `/bulletin` | Liste + son bülten |
| `/bulletin/[tarih]` | Tek bülten |
| `/admin` | Şifre korumalı ekleme (local kullanım) |

## Kurulum (local)

```bash
git clone <repo-url>
cd base-daily-brief
npm install
cp .env.example .env.local
# ADMIN_PASSWORD=guclu-sifre
npm run dev
```

http://localhost:3000

## Vercel deploy

### İlk kurulum

```bash
# Proje klasöründe
npx vercel login
npx vercel
```

Dashboard'dan **Environment Variables** ekle:

- `ADMIN_PASSWORD` = (admin şifren — production'da admin kullanılmayacak olsa da koy)

Production:

```bash
npx vercel --prod
```

GitHub bağlarsan her `git push` otomatik deploy eder.

### GitHub ile bağlama

1. GitHub'da boş repo oluştur (`base-daily-brief`)
2. Local:

```bash
git init
git add .
git commit -m "initial: Base Daily Brief MVP"
git branch -M main
git remote add origin https://github.com/KULLANICI/base-daily-brief.git
git push -u origin main
```

3. [vercel.com](https://vercel.com) → Import Project → bu repo'yu seç
4. Deploy

## Yeni bülten yayınlama (günlük rutin)

```bash
# 1. Local dev açıkken /admin'den kaydet
# 2. Terminal:
git add content/bulletins/
git status
git commit -m "brief: 2026-08-12"
git push
```

Vercel ~1 dk içinde canlıya alır.

## Dosya yapısı

```
content/bulletins/     ← bülten .md dosyaları (Git'te)
src/app/admin/         ← ekleme formu
src/app/bulletin/      ← okuma sayfaları
src/lib/bulletins.ts   ← okuma/yazma helpers
src/app/api/admin/add/ ← kayıt API
```

## Sonraki adımlar

- [ ] x402 ile ücretli erişim
- [ ] Base Mini App
- [ ] İsteğe bağlı: Vercel KV ile online admin (Git'siz)
