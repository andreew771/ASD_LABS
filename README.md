# ASD Labs DOT Inspection Reporter

Aplicație web statică pentru raportarea inspecțiilor DOT la camioane în SUA. Utilizatorul încarcă un spreadsheet CSV/XLS/XLSX, selectează o perioadă și primește o clasificare a inspecțiilor, indicatori de risc și o hartă interactivă.

## Funcționalități

- Citește fișiere `.csv`, `.xls` și `.xlsx` direct în browser.
- Detectează automat coloane uzuale pentru data inspecției, stat, oraș, coordonate, transportator, USDOT, nivel, rezultat, număr de încălcări, OOS și hazmat.
- Filtrează raportul după interval de date, stat, severitate și transportator.
- Clasifică fiecare inspecție în `Curat`, `Minor`, `Major` sau `Critic / Out-of-Service`.
- Afișează inspecțiile pe harta SUA folosind coordonate exacte sau centrul statului când coordonatele lipsesc.
- Include un set de date demonstrativ în `data/sample_dot_inspections.csv`.

## Rulare locală

```bash
npm run serve
```

Apoi deschide `http://localhost:4173` în browser.

## Teste

```bash
npm test
```

## Coloane acceptate

Aplicația recunoaște automat mai multe variante de antet, inclusiv:

| Câmp | Exemple de antete |
| --- | --- |
| Data inspecției | `Inspection Date`, `Date`, `Insp Date` |
| Stat | `State`, `Inspection State`, `Location State` |
| Oraș | `City`, `Inspection City`, `Location City` |
| Coordonate | `Latitude`, `Lat`, `Longitude`, `Lng`, `Lon` |
| Transportator | `Carrier`, `Carrier Name`, `Company`, `Motor Carrier` |
| USDOT | `USDOT`, `USDOT Number`, `DOT Number` |
| Nivel | `Inspection Level`, `Level`, `Insp Level` |
| Rezultat | `Result`, `Inspection Result`, `Status` |
| Încălcări | `Violations`, `Violation Count`, `Total Violations` |
| OOS | `OOS`, `Out of Service`, `Out-of-Service` |

## Reguli de clasificare

1. `Critic / Out-of-Service`: inspecția are OOS sau rezultat nefavorabil (`Fail`, `Out of Service`, `OOS`).
2. `Major`: cel puțin 3 încălcări, fără OOS.
3. `Minor`: 1-2 încălcări, fără OOS.
4. `Curat`: fără încălcări și fără OOS.
