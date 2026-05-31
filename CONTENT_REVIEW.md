# Mééls — controlelijst voor de moedertaalspreker

Alle vertalingen hieronder zijn **voorstellen** en staan in de app gemarkeerd als
`status: "review"`. Een Meijelse moedertaalspreker controleert elke regel, vult de
juiste Méélse vorm in, en zet dan in `content/course.json` de `status` op `"approved"`.
Daarna kan de audio worden opgenomen (zie `README.md`).

- 🟢 **Gedocumenteerd** — overgenomen van protmermeels.nl / medelo.nl (mouillering). Vrij zeker, graag bevestigen.
- 🟡 **Best-effort** — beredeneerd op basis van Limburgse/Méélse patronen. Controleer extra zorgvuldig.

Kolommen: **id** · **Nederlands** · **Mééls (voorstel)** · **bron** · **✔/✘** · **correctie / opmerking**

## Goojendaag — begroeten

| id | Nederlands | Mééls (voorstel) | bron | ✔/✘ | opmerking |
|---|---|---|---|---|---|
| goedendag | goedendag | goojendaag | 🟡 |  |  |
| goedemorgen | goedemorgen | goojemèrge | 🟡 |  |  |
| goedenavond | goedenavond | goojenaovend | 🟡 |  |  |
| welkom | welkom | welkom | 🟡 |  |  |
| danke | bedankt | danke | 🟡 |  |  |
| alstublieft | alstublieft | asjeblief | 🟡 |  |  |
| tot-ziens | tot ziens | haije | 🟡 |  | Limburgse afscheidsgroet; controleer Méélse vorm |
| ja | ja | jao | 🟡 |  |  |
| nee | nee | nei | 🟡 |  |  |
| proost | proost | proost | 🟡 |  |  |
| dank-u-wel | dank u wel | dank ow wel | 🟡 |  | zin voor de woordbank |
| hoe-gaat-het | hoe gaat het | wie geit 't | 🟡 |  | zin voor de woordbank |

## De Méélse -j (mouillering)

| id | Nederlands | Mééls (voorstel) | bron | ✔/✘ | opmerking |
|---|---|---|---|---|---|
| huis | huis | husj | 🟢 |  | mouillering |
| geit | geit | géétj | 🟢 |  | mouillering |
| tijd | tijd | titj | 🟢 |  | mouillering |
| buiten | buiten | butje | 🟢 |  | mouillering |
| muis | muis | meusj | 🟢 |  | mouillering |
| wijn | wijn | winj | 🟢 |  | mouillering |
| prijs | prijs | prisj | 🟢 |  | mouillering |
| bruin | bruin | brunj | 🟢 |  | mouillering |
| kwijt | kwijt | kwitj | 🟢 |  | mouillering |
| ruiten | ruiten | rutje | 🟢 |  | mouillering |
| grijs | grijs | grisj | 🟢 |  | mouillering |
| pijn | pijn | pinj | 🟢 |  | mouillering |
| wijs | wijs | wisj | 🟢 |  | mouillering |
| meid | meid | métj | 🟢 |  | mouillering |
| luis | luis | leusj | 🟢 |  | mouillering |
| buis | buis | beusj | 🟢 |  | mouillering |

## Femilie en mènse

| id | Nederlands | Mééls (voorstel) | bron | ✔/✘ | opmerking |
|---|---|---|---|---|---|
| moeder | moeder | moder | 🟡 |  |  |
| vader | vader | vader | 🟡 |  |  |
| kind | kind | kindj | 🟡 |  | Limburgse mouillering nd→ndj; controleer |
| jongen | jongen | jong | 🟡 |  |  |
| buurman | buurman | naober | 🟡 |  |  |
| vriend | vriend | vrundj | 🟡 |  |  |
| meisje | meisje | wicht | 🟡 |  | wicht/wichtje? |
| oma | oma | bèsje | 🟡 |  | bes/bèsje = grootmoeder; controleer |
| opa | opa | bòpa | 🟡 |  | controleer Méélse vorm |
| broer | broer | broor | 🟡 |  |  |
| zus | zus | zös | 🟡 |  |  |
| femilie | familie | femilie | 🟡 |  |  |

## In ’t dörp

| id | Nederlands | Mééls (voorstel) | bron | ✔/✘ | opmerking |
|---|---|---|---|---|---|
| straat | straat | straot | 🟡 |  |  |
| kerk | kerk | kèrk | 🟡 |  |  |
| school | school | school | 🟡 |  |  |
| dorp | dorp | dörp | 🟡 |  |  |
| brood | brood | broed | 🟡 |  |  |
| water | water | water | 🟡 |  |  |
| koffie | koffie | koffie | 🟡 |  |  |
| bier | bier | beer | 🟡 |  |  |
| boom | boom | boum | 🟡 |  |  |
| turf | turf | törf | 🟡 |  | törf — de Turfsteker steekt törf in de Peel |
| veld | veld | veldj | 🟡 |  |  |
| hond | hond | hóndj | 🟡 |  |  |
| kat | kat | kat | 🟡 |  |  |
| melk | melk | mèlk | 🟡 |  |  |

---

## Meerkeuze-afleiders

Bij meerkeuzevragen tonen we naast het juiste woord twee **gelijkende echte** woorden en één **geloofwaardig FOUT** woord (veld `near` in `course.json`). De mouillering-oefening gebruikt het veld `distractors` (bevat o.a. de gewone Nederlandse vorm). Pas deze gerust aan als een fout alternatief niet logisch is.
