# Awa – Portfolio

Meine persönliche Portfolio-Website: **https://awa0174.github.io**

Statische Seite aus HTML, CSS und etwas JavaScript – ohne Framework, ohne Build-Schritt, ohne externe Dienste.
Veröffentlicht über GitHub Pages direkt aus dem `main`-Zweig.

## Aufbau

```
index.html          Startseite mit allen Abschnitten
css/style.css       Gestaltung (Farben als Variablen in :root)
js/main.js          Partikelmotiv, aktive Navigation, Einblenden
assets/img/         Signaturbild, Screenshots (WebP, je 640 und 1200 px breit), OG-Bild, Icons
404.html, robots.txt, sitemap.xml
```

## Pflege

- **Projekt ergänzen oder ändern:** In `index.html` ist jedes Projekt ein `<article class="project">`-Block mit
  gleichem Aufbau (Bild, Status, Beschreibung, vier Fragen, Technologien, Links). Block kopieren, Inhalte ersetzen.
- **Statusfarben:** `status--live`, `status--wip`, `status--fork`, `status--jam`, `status--gmod`.
- **Screenshots:** als WebP in 640 und 1200 px Breite im Seitenverhältnis 16:10 ablegen.
- **„Aktuell“:** Text und Datum im Abschnitt „Über mich“ anpassen.

## Lokal ansehen

```bash
python -m http.server 5300
```

Danach http://localhost:5300 öffnen.
