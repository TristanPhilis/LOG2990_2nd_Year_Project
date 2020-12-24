# **Correction Sprint 3**

# Fonctionnalité

## Outil - Sélection par baguette magique /8

- [x] Il est possible d'activer la baguette magique avec la touche `V`.
- [x] Il est possible d'effectuer une sélection en mode _pixels contigus_ avec le bouton gauche de la souris.
- [x] Il est possible d'effectuer une sélection en mode _pixels non contigus_ avec le bouton droit de la souris.
- [x] Un pixel est sélectionné s'il est voisin d'une région de pixels de même couleur pour le mode _pixels contigus_.
- [x] Un pixel est sélectionné s'il est de la même couleur pour le mode _pixels non contigus_.
- [x] La ou les régions de pixels sélectionnés sont délimitées par un contour de sélection qui sera lui-même encadré par une seule boite englobante.
- [x] Une boite englobante doit être minimale, peu importe son orientation.
- [x] Une boite englobante a 8 points de contrôle.
- [x] La sélection inclut toujours les pixels de l'arrière-plan.
- [x] La ou les régions de sélection ne peut jamais dépasser la zone de dessin, même si la souris dépasse cette zone.
- [x] L'utilisation de la touche d'échappement (`ESC`) annule la sélection en entier.

### Commentaires

## Continuer un dessin

- [ ] Il est possible de charger le dernier dessin sauvegardé par le système de sauvegarde automatique.
- [ ] Il est possible de voir l'option _Continuer un dessin_ dans le point d'entrée de l'application seulement s'il y a un dessin sauvegardé.
- [ ] L'utilisateur est amené à la vue de dessin avec le dessin déjà chargé sur la surface de dessin.

### Commentaires

Non disponible

## Sauvegarde automatique

- [ ] Il est possible de faire une sauvegarde automatique du dessin pendant son édition.
- [ ] La sauvegarde automatique est déclenchée après le chargement d'un dessin (à partir du serveur ou continuation d'un dessin sauvegardé automatiquement).
- [ ] La sauvegarde automatique est déclenchée après toute modification au dessin (création, ouverture de dessin, modification de la surface de dessin).
- [ ] La sauvegarde est locale au fureteur seulement.
- [ ] La sauvegarde automatique a lieu sans intervention de l'utilisateur.
- [ ] Un dessin sauvegardé automatiquement n'a pas de nom ou d'étiquettes.

### Commentaires

Non disponible

## Envoyer le dessin par courriel

- [x] Il est possible d'exporter le dessin et l'envoyer par courriel via une fenêtre d'export de fichier.
- [x] Il est possible d'ouvrir la fenêtre d'export avec le raccourci `CTRL + E`.
- [x] Une seule fenêtre modale parmi: (sauvegarder, carrousel et exporter) peut être affichée en même temps (pas de _stack_ non plus).
- [x] Les différent raccourcis ne sont pas disponibles lorsque cette fenêtre est affichée.
- [x] Il est possible d'envoyer une image en format JPG.
- [x] Il est possible d'envoyer une image en format PNG.
- [x] Il est possible d'appliquer un filtre à l'image exportée.
- [x] Un choix d'au moins 5 filtres _sensiblement_ différents est offert.
- [x] Les différents filtres sont clairement identifiés pour leur sélection.
- [x] Un seul filtre est appliqué à l'image exportée.
- [x] Il est possible d'entrer un nom pour le fichier exporté.
- [x] Il est possible de définir une addresse de destination _valide_.
- [x] L'envoi du courriel est fait à travers le serveur et non l'application client.
- [x] Il est possible de voir une vignette de prévisualisation de l'image à exporter.
- [x] Un bouton de confirmation doit être présent pour envoyer l'image par courriel.

### Commentaires

Test : - 0.1

## Manipulations de sélections et presse-papier

- [x] Il est possible de copier une sélection avec le raccourci `CTRL + C`.
- [x] Le contenu du presse-papier est remplacé par la sélection lors d'un copiage.
- [x] Il est possible de couper une sélection avec le raccourci `CTRL + X`.
- [x] Le contenu du presse-papier est remplacé par la sélection active lors d'un coupage.
- [x] Les pixels de la surface de dessin sous une sélection sont remplacés par des pixels blancs lors d'un coupage.
- [x] Il est possible de coller ce qui se trouve dans le presse-papier avec le raccourci `CTRL + V`.
- [x] Les pixels créés par un collage sont positionés sur le coin suppérieur gauche.
- [x] Les pixels créés par un collage sont automatiquement sélectionnés.
- [x] Le contenu du presse-papier n’est pas affecté par un collage.
- [x] Il est possible de supprimer une sélection avec le raccourci `DELETE`.
- [x] Les pixels de la surface de dessin sous une sélection sont remplacés par des pixels blancs lors d'une suppression.
- [x] Les actions couper, copier, coller et supprimer sont aussi accessibles via la barre latérale à travers des boutons.
- [ ] Les actions couper, copier, coller et supprimer ne sont pas disponibles sans une sélection courante.

### Commentaires

On peut appuyer dans la barre latérale les actions sans sélection courante.
Si on fait coller sans l'outil sélection la boîte reste prise !

# QA

## Qualité des classes /14

### La classe n'a qu'une responsabilitée et elle est non triviale.

**1.75/3**  
_Commentaires :_

anchorId non utilisé
CanvasAnchorsId non utilsé
Message non utilisé
feather-service.ts, selected-box.ts, spray-service.ts fonction mathématique qui peuvent être extraite.

### Le nom de la classe est approprié. Utilisation appropriée des suffixes ({..}Component,{..}Controller, {..}Service, etc.). Le format à utiliser est le PascalCase

**1.5/2**  
_Commentaires :_

anchorId -> AnchorId
SelectionMouvementService SelectionMovementService

### La classe ne comporte pas d'attributs inutiles (incluant des getter/setter inutiles). Les attributs ne représentent que des états de la classe. Un attribut utilisé seulement dans les tests ne devrait pas exister.

**1.5/3**  
_Commentaires :_

color-picker.component.ts  
email-export-service.ts  
grid-options.component.ts  
sidebar.component.ts
feather-service.ts

### La classe minimise l'accessibilité des membres (public/private/protected)

**0/2**  
_Commentaires :_

magnet-option.component.ts  
editor.component.ts  
pipette-preview.component.ts  
export-popup.component.ts  
color-palette.component.ts  
bucket-service.ts  
ellipse-service.ts  
eraser-service.ts  
...

### Les valeurs par défaut des attributs de la classe sont initialisés de manière consistante (soit dans le constructeur partout, soit à la définition)

**4/4**  
_Commentaires :_

<!--  -->

## Qualité des fonctions /13

### Les noms des fonctions sont précis et décrivent les tâches voulues. Le format à utiliser doit être uniforme dans tous les fichiers (camelCase, PascalCase, ...)

**1/2**  
_Commentaires :_

isValidEmailAddressFunction, pas besoins de mettre function
initializeAnchorMouvement, processAnchorMouvement, processWheelMouvement, processMouseMouvement, startMouvement ...
setDefaultOptions initWithDefaultOptions
fillFromRotation drawWithRotation

### Chaque fonction n'a qu'une seule utilité, elle ne peut pas être fragmentée en plusieurs fonctions et elle est facilement lisible.

**2.75/3**  
_Commentaires :_

onKeyDown text-service.ts

### Les fonctions minimisent les paramètres en entrée (pas plus de trois). Utilisation d'interfaces ou de classe pour des paramètres pouvant être regroupé logiquement.

**3/3**  
_Commentaires :_

<!--  -->

### Les fonctions sont pures lorsque possible. Les effets secondaires sont minimisés

**2.5/3**  
_Commentaires :_

setParamsForMaxTolerance un setter qui ne prends pas de paramètre n'est pas pure, il est difficile de savoir ce qu'il va se passer dans ce setter.

### Tous les paramètres de fonction sont utilisés

**2/2**  
_Commentaires :_

<!--  -->

## Exceptions /4

### Les exceptions sont claires et spécifiques (Pas d'erreurs génériques). Les messages d'erreur affichés à l'utilisateur sont compréhensible pour l'utilisateur moyen (pas de code d'erreur serveur, mais plutôt un message descriptif du genre "Un problème est survenu lors de la sauvegarde du dessin")

**2/2**  
_Commentaires :_

<!--  -->

### Toute fonction doit gérer les valeurs limites de leurs paramètres

**1/1**  
_Commentaires :_

<!--  -->

### Tout code asynchrone (Promise, Observable ou Event) doit être géré adéquatement.

**0/1**  
_Commentaires :_

color-picker.component.ts
email-export-service.ts

# QA

## Qualité générale

- L29: selection-mouvement.service.ts(142), ellipse-selector-service.ts(45), feather-service.ts(151), line-service.ts(158)
- L34: bucket-service.ts(128)
- L35: email-export.service.ts(67,69,81)

- #43: Des tslint disable inutiles
- #45: document.getElementBy\* ne peut pas être utilisé, utilisé plutôt ViewChild
- #46: Duplication de code onKeyUp selection ellipse et rectangle
- #48: Pas utilisé

# Fonctionnalités

## Plume

- Pas de ligne à la pointe de la souris

## Etampe

- Le curseur ne devrait plus être visible

## Texte

- Tous les raccourcis ne sont pas désactivés (grille par exemple)
- On ne peut pas passer d'une ligne à une autre avec le curseur
