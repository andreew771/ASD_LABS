# ASD_LABS - Metode de căutare

Proiectul conține un fișier textual cu **60 de înregistrări**, fiecare având 6 câmpuri:

1. `id` (int, cheie unică, neordonată în fișier)
2. `nume` (string)
3. `specializare` (string)
4. `media` (double)
5. `an` (int)
6. `bursa` (string: da/nu)

Fișierul este: `data/students.txt`.

## Compilare și rulare

```bash
g++ -std=c++17 -O2 -Wall -Wextra -pedantic src/main.cpp -o search_app
./search_app
```

## Metode implementate

### 1) Căutare secvențială (tabel neordonat)
**Pași algoritm:**
1. Se parcurge tabelul de la prima la ultima poziție.
2. La fiecare pas se compară cheia căutată cu cheia curentă.
3. Dacă se găsește egalitate, căutarea se oprește cu succes.
4. Dacă se ajunge la final fără egalitate, cheia nu există.

**Lungime medie teoretică (căutare cu succes):**
- \\( L_{med} = (n + 1)/2 \\)

---

### 2) Căutare în tabel neordonat structurat arborescent (Arbore Binar de Căutare - BST)
**Pași algoritm:**
1. Se construiește BST prin inserarea succesivă a cheilor din tabelul neordonat.
2. Pentru căutare se pornește din rădăcină.
3. Dacă cheia este egală cu nodul curent -> succes.
4. Dacă cheia este mai mică, se merge în subarborele stâng.
5. Dacă cheia este mai mare, se merge în subarborele drept.
6. Dacă se ajunge la `null`, cheia nu există.

**Lungime medie teoretică:**
- aproximativ \\( O(\log n) \\) pentru arbori echilibrați (în program este raportată aproximarea \\( \log_2(n)+1 \\)).

---

### 3) Căutare binară (tabel ordonat)
**Pași algoritm:**
1. Se sortează înregistrările crescător după cheie.
2. Se ia poziția mediană.
3. Dacă cheia căutată este egală cu mediana -> succes.
4. Dacă cheia este mai mică, se continuă pe jumătatea stângă.
5. Dacă cheia este mai mare, se continuă pe jumătatea dreaptă.
6. Se repetă până la găsire sau până când intervalul devine invalid.

**Lungime medie teoretică:**
- \\( O(\log n) \\), aproximat în program cu \\( \log_2(n) \\).

---

### 4) Căutare în tabele ordonate - Interpolare
**Pași algoritm:**
1. Datele sunt ordonate după cheie numerică.
2. Se estimează poziția probabilă a cheii folosind formula de interpolare.
3. Se compară cheia de la poziția estimată.
4. Se restrânge intervalul în stânga/dreapta și se repetă.
5. Se oprește la găsire sau când cheia nu mai poate fi în interval.

**Lungime medie teoretică:**
- \\( O(\log\log n) \\) în distribuție aproape uniformă a cheilor.

## Ce afișează programul
Programul calculează și afișează pentru fiecare metodă:
- lungimea medie teoretică;
- lungimea medie practică (numărul mediu de comparații), obținută rulând căutări pentru toate cheile existente în fișier.
