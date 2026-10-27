# FairSplit — قسمة عادلة

A small, bilingual tool for splitting shared expenses fairly. Enter what each person paid to see each person’s share and a practical set of transfers to settle up.

**Try it:** open `index.html` in a browser, or publish this folder with GitHub Pages. No build step, account, server, or dependency installation is needed.

## What it does

- Splits a group total equally, including a transparent rule for leftover minor units.
- Calculates who pays whom to settle the bill.
- Supports Arabic (RTL) and English, plus all currencies exposed by the browser’s internationalization data, with each currency’s correct number of fractional digits.
- Works on phones and desktop, with keyboard-friendly controls.
- Keeps calculations in the browser. It does not send or save entered names or amounts.

## Run the tests

The calculation logic has no dependencies. With Node.js installed, run:

```sh
node --test
```

## Publish with GitHub Pages

1. Add the project files to a GitHub repository.
2. Open **Settings → Pages** for that repository.
3. Choose **Deploy from a branch**, select the default branch and `/ (root)`, then save.

## الحساب بالعربية

أداة صغيرة لتقسيم المصاريف المشتركة: أدخل أسماء الأشخاص وما دفعه كل واحد، وستظهر حصة كل شخص والتحويلات اللازمة لتصفية الحساب. تعمل مباشرة في المتصفح دون تثبيت أو تسجيل، وتبقى المدخلات على جهازك. تدعم العربية والإنجليزية وجميع العملات التي يوفّرها المتصفح.

المشروع مرخّص برخصة MIT. راجع `LICENSE`.
