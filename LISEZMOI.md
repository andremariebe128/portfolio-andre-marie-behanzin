# Portfolio d'André-Marie BEHANZIN

Site statique (HTML, CSS, JS), sans dépendance ni étape de build.

## Mise en ligne (Vercel, dépôt GitHub existant)
1. Dans le dépôt local, supprimer les anciens fichiers (sauf `.git`).
2. Copier tout le contenu de ce dossier à la racine du dépôt.
3. `git add -A && git commit -m "Nouveau portfolio" && git push` : Vercel redéploie seul.

`vercel.json` active les URL propres (`/projets`, `/bamek`, `/apropos`, `/contact`).

## Aperçu local
`npx serve .` puis ouvrir http://localhost:3000 (les pages s'ouvrent aussi directement par double-clic).

## À adapter
- Domaine personnalisé : remplacer `portfolio-andre-marie-behanzin.vercel.app` dans `sitemap.xml`, `robots.txt` et les balises canonical/og des pages.
- Captures : remplacer les images dans `assets/img/` en gardant les mêmes noms.
- CV : `assets/docs/CV_Andre-Marie_BEHANZIN.pdf`.
