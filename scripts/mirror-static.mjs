// Batch-mirrors every static page of clauwi.pl (everything except the two
// dynamic features — advisor directory and course calendar — and everything
// we're dropping: WooCommerce/accounts, the phpBB forum, test/hidden pages).
//
// Usage: node scripts/mirror-static.mjs
import { mirrorPage, finalizeBaseCss } from "./mirror.mjs";

// slug (registry key / route path) -> live WordPress path
export const STATIC_PAGES = [
  ["home", "/"],
  ["o-nas", "/o-nas/"],
  ["strona-glowna/system-ksztalcenia", "/strona-glowna/system-ksztalcenia/"],
  ["regulam-i-zasady-naboru", "/regulam-i-zasady-naboru/"],
  ["strona-glowna/faq", "/strona-glowna/faq/"],
  ["kontakt", "/kontakt/"],
  ["opinie", "/opinie/"],
  ["wsparcie-na-starcie", "/wsparcie-na-starcie/"],
  ["konferencja-clauwi2025", "/konferencja-clauwi2025/"],
  ["polityka-prywatnosci", "/polityka-prywatnosci/"],
  ["blog", "/blog/"],
  // 8 blog posts (frozen content — client is not writing new posts)
  ["siegnij-po-spelnienie-marzen-dobro-wraca", "/siegnij-po-spelnienie-marzen-dobro-wraca/"],
  ["nowa-odslona-clauwi", "/nowa-odslona-clauwi/"],
  ["nie-nos-bo-rozpiescisz", "/nie-nos-bo-rozpiescisz/"],
  ["noszenie-na-wsi", "/noszenie-na-wsi/"],
  ["noszenie-w-chuscie-przez-mame-z-dyskopatia-ledzwiowa", "/noszenie-w-chuscie-przez-mame-z-dyskopatia-ledzwiowa/"],
  ["a-co-na-to-fizjoterapeuta-osteopata-ortopeda-pediatra-zapytaj-go", "/a-co-na-to-fizjoterapeuta-osteopata-ortopeda-pediatra-zapytaj-go/"],
  ["jak-dlugo-mozna-nosic-dziecko-w-chuscie", "/jak-dlugo-mozna-nosic-dziecko-w-chuscie/"],
  ["chustonoszenie-jako-profilaktyka-problemow-logopedycznych", "/chustonoszenie-jako-profilaktyka-problemow-logopedycznych/"],
  // category archives
  ["category/bez-kategorii", "/category/bez-kategorii/"],
  ["category/doradcy-pisza", "/category/doradcy-pisza/"],
];

if (process.argv[1] && process.argv[1].endsWith("mirror-static.mjs")) {
  for (const [slug, path] of STATIC_PAGES) {
    try {
      await mirrorPage(slug, path);
    } catch (e) {
      console.error(`FAILED ${slug} (${path}):`, e.message);
    }
  }
  finalizeBaseCss();
}
