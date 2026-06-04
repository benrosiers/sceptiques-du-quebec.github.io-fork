# Changelog

Tous les changements notables du projet Sceptiques du Québec seront documentés dans ce fichier.


## [2026-06-04]

### Ajouts

- Tableau de pointage: 3 classements accessibles par onglets (Meilleur score, Top scores, Plus actifs).


## [2026-05-23]

### Ajouts

- Affichage du changelog dans une fenêtre modale sur le site.


## [2026-05-03]

### Ajouts

- Chansons MIDI aléatoires.
- Effet de bump sur le score et les vies.
- Effets sonores et musique.

### Changements

- Boutons audio plus gros.
- Slow motion passe de 0.5 à 0.7.
- Game over recommence la partie au lieu du homescreen.
- Vitesse maximale passe de 1000 à 1200.
- Configuration YAML.


## [2026-05-02]

### Ajouts
- Ajout de bump et de particules sur le score
- Ajout de bonus tombants (coeur, licorne, arc-en-ciel)
  - Coeur: +1 vie
  - Licorne: +500pts
  - Arc-en-ciel: Ralenti

### Changements
- 1000pts par niveau
- 50pts par brique
- Augmentation de la vitesse maximale
- Meilleur callback onLoadComplete

### Corrections
- Utilisation des bonnes textures


## [2026-05-01]

### Ajouts

- Ajout de deux nouvelles ressources pour les jeunes
- Double-clique souris pour pause
- Bonus 500pts par niveau réussi
- Support mobile extérieur du canvas
- Support touch 2 doigts pour pause
- Effet de "bump" sur le reveal d'un drapeau
- Ajout d'un countdown lors du reset de la boule
- Augmentation du timeout de combo
- Espace/Entrée pour mettre en pause

### Changements

- Désactivation du viewport scale
- Simplification du modal d'entrée de nom d'utilisateur
- Refactorisation de la configuration du jeu
- Augmentation de la vélocité de la souris
- Traînée de la boule plus fluide

### Corrections

- Reset combo quand boule touche paddle
- Continuité du combo
- Glitch ball visible une fraction de seconde


## [2026-04-30]

### Ajouts

- Ajout du fb:app_id dans le header
- Validation du hashing de sauvegarde de score

### Changements

- Ajout de 8 nouveaux drapeaux