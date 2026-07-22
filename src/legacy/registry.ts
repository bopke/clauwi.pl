// Maps a URL path (matching the live WordPress permalink structure, so
// existing links/SEO keep working) to its mirrored page module.
// "home" (the "/" route) is handled separately by src/app/(public)/page.tsx —
// everything else goes through the [...slug] catch-all route.

import * as oNas from "./o-nas";
import * as systemKsztalcenia from "./strona-glowna/system-ksztalcenia";
import * as zasadyNaboru from "./regulam-i-zasady-naboru";
import * as faq from "./strona-glowna/faq";
import * as kontakt from "./kontakt";
import * as opinie from "./opinie";
import * as wsparcieNaStarcie from "./wsparcie-na-starcie";
import * as konferencjaClauwi2025 from "./konferencja-clauwi2025";
import * as politykaPrywatnosci from "./polityka-prywatnosci";
import * as blog from "./blog";
import * as siegnijPoSpelnienie from "./siegnij-po-spelnienie-marzen-dobro-wraca";
import * as nowaOdslonaClauwi from "./nowa-odslona-clauwi";
import * as nieNosBoRozpiescisz from "./nie-nos-bo-rozpiescisz";
import * as noszenieNaWsi from "./noszenie-na-wsi";
import * as noszenieWChuscie from "./noszenie-w-chuscie-przez-mame-z-dyskopatia-ledzwiowa";
import * as coNaToFizjoterapeuta from "./a-co-na-to-fizjoterapeuta-osteopata-ortopeda-pediatra-zapytaj-go";
import * as jakDlugoMoznaNosic from "./jak-dlugo-mozna-nosic-dziecko-w-chuscie";
import * as chustonoszenie from "./chustonoszenie-jako-profilaktyka-problemow-logopedycznych";
import * as categoryBezKategorii from "./category/bez-kategorii";
import * as categoryDoradcyPisza from "./category/doradcy-pisza";

export type LegacyModule = {
  title: string;
  bodyClass: string;
  css: string;
  html: string;
};

// Key = URL path with no leading/trailing slash (matches params.slug.join("/")).
export const registry: Record<string, LegacyModule> = {
  "o-nas": oNas,
  "strona-glowna/system-ksztalcenia": systemKsztalcenia,
  "regulam-i-zasady-naboru": zasadyNaboru,
  "strona-glowna/faq": faq,
  kontakt,
  opinie,
  "wsparcie-na-starcie": wsparcieNaStarcie,
  "konferencja-clauwi2025": konferencjaClauwi2025,
  "polityka-prywatnosci": politykaPrywatnosci,
  blog,
  "siegnij-po-spelnienie-marzen-dobro-wraca": siegnijPoSpelnienie,
  "nowa-odslona-clauwi": nowaOdslonaClauwi,
  "nie-nos-bo-rozpiescisz": nieNosBoRozpiescisz,
  "noszenie-na-wsi": noszenieNaWsi,
  "noszenie-w-chuscie-przez-mame-z-dyskopatia-ledzwiowa": noszenieWChuscie,
  "a-co-na-to-fizjoterapeuta-osteopata-ortopeda-pediatra-zapytaj-go": coNaToFizjoterapeuta,
  "jak-dlugo-mozna-nosic-dziecko-w-chuscie": jakDlugoMoznaNosic,
  "chustonoszenie-jako-profilaktyka-problemow-logopedycznych": chustonoszenie,
  "category/bez-kategorii": categoryBezKategorii,
  "category/doradcy-pisza": categoryDoradcyPisza,
};
