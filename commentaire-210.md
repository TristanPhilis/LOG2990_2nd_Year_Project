# **Correction Sprint 2**

# Fonctionnalité

## Exporter le dessin 5.07/6 - 0.84

- [x] Il est possible d'exporter le dessin localement via une fenêtre d'export de fichier.
- [x] Il est possible d'ouvrir la fenêtre d'export avec le raccourci `CTRL + E`.
- [ ] Une seule fenêtre modale parmi: (sauvegarder, carrousel et exporter) peut être affichée en même temps (pas de _stack_ non plus).
- [ ] Les différent raccourcis ne sont pas disponibles lorsque cette fenêtre est affichée.
- [x] Il est possible d'exporter une image en format JPG.
- [x] Il est possible d'exporter une image en format PNG.
- [x] Il est possible d'appliquer un filtre à l'image exportée.
- [x] Un choix d'au moins 5 filtres _sensiblement_ différents est offert.
- [x] Les différents filtres sont clairement identifiés pour leur sélection.
- [x] Un seul filtre est appliqué à l'image exportée.
- [x] Il est possible d'entrer un nom pour le fichier exporté.
- [x] Il est possible de voir une vignette de prévisualisation de l'image à exporter.
- [x] Un bouton de confirmation doit être présent pour exporter l'image.

### Commentaires

Les raccourcis claviers de chrome sont encore disponible. Lorsqu'on ouvrir l'exportatio de dessin le aucun filtre n'est pas activé.

## Carrousel de dessins 6.09/8 - 0.76

- [x] Il est possible de voir les dessins sauvegardés sur un serveur via le carrousel de dessins.
- [x] Il est possible d'ouvrir la fenêtre du carrousel avec le raccourci `CTRL + G`.
- [x] Le carrousel doit présenter 3 fiches à la fois.
- [x] Le carrousel doit gérer les cas oũ moins de 3 dessins sont disponibles.
- [x] Il est possible de faire défiler le carrousel en boucle avec les touches du clavier.
- [x] Il est possible de faire défiler le carrousel en boucle avec des boutons présents dans l'interface.
- [ ] Une seule fenêtre modale parmi: (sauvegarder, carrousel et exporter) peut être affichée en même temps (pas de _stack_ non plus).
- [ ] Les différent raccourcis ne sont pas disponibles lorsque cette fenêtre est affichée.
- [x] Chaque fiche de dessin comporte un nom, des étiquettes (s'il y en a) et un aperçu du dessin en format réduit.
- [x] Le nom, les étiquettes et l'aperçu doivent être ceux qui ont été définis lorsque l'utilisateur les a sauvegardé.
- [x] Lors des requêtes pour charger les dessins dans la liste, un élément de chargement doit indiquer que la requête est en cours.
- [x] La liste doit être chargeable sans délai excessif.
- [x] Il est possible de filtrer les dessins par leurs étiquettes. Voir la carte **Filtrage par étiquettes**.
- [x] Il est possible de charger un dessin en cliquant sur sa fiche.
- [ ] Si un dessin choisi ne peut pas être ouvert, l'utilisateur doit être invité à choisir un autre via la même fenêtre modale.
- [ ] Si un dessin présent non-vide est sur la zone de travail, l'utilisateur doit recevoir une alerte confirmant ou non vouloir abandonner ses changements.
- [x] Il est possible de supprimer un dessin à l'aide d'un bouton de suppression.
- [x] Lorsqu'un dessin est supprimé, le carrousel doit se mettre automatiquement à jour et ne doit plus contenir ce dessin .
- [ ] Si un dessin choisi ne peut pas être supprimé, l'utilisateur doit être informé de la raison et le carrousel doit être mis à jour.
- [x] Lorsqu'un dessin est sauvegardé, _au moins à_ la prochaine ouverture, le carrousel doit pouvoir afficher le nouveau dessin sauvegardé.
- [x] Les anciens paramètres d'ouverture ne sont plus visibles lors de la réouverture du carrousel (les paramètres sont remis à leur état original). _ie: pas de filtre d'activé_

### Commentaires

Erreur dans la console pour le caroussel. Aucun message si erreur d'ouverture de dessin. Aucune gestion d'erreur sur la suppression. Si le dessin est vide, j'ai quand même un message d'alerte de modification de mon dessin. Les raccourcis claviers de chrome sont encore disponible.
Le dessin ouvert ne garde pas ses proportions - 1.

Test 0.6, plusieurs branches et fonctions sont manquantes !

## Base de données 5/6 - 0.83

- [x] Il est possible de sauvegarder le nom et les tags d'un nouveau dessin sur une base de données MongoDB.
- [x] La base de données est à distance et non localement sur la machine du serveur.
- [x] Lorsqu'un dessin est supprimé par un utilisateur, la base de données est mise à jour.
- [x] Le client est capable de récupérer l'information d'un ou plusieurs dessins à partir de la base de données.
- [x] La récupération de données se fait à partir de la base de données et non des fichiers locaux.
- [ ] Si la base de données contient des informations sur des dessins non-existants sur le serveur, ces dessins ne sont pas montrés à l'utilisateur.

### Commentaires

Les dessins sont enregistrer dans la base de donnée au lieu de sur le serveur.
Quelques branchent ne sont pas testées : 0.9

## Sauvegarder le dessin sur serveur 5.71/8 - 0.71

- [x] Il est possible de sauvegarder le dessin sur un serveur via une fenêtre de sauvegarde.
- [ ] Il est possible de sauvegarder le dessin en formant PNG.
- [x] Il est possible d'ouvrir la fenêtre de sauvegarde avec le raccourci `CTRL + S`.
- [ ] Une seule fenêtre modale parmi: (sauvegarder, ouvrir et exporter) peut être affichée en même temps (pas de _stack_ non plus)
- [ ] Les différent raccourcis ne sont pas disponibles lorsque cette fenêtre est affichée.
- [x] Il est possible d'associer un nom au dessin à sauvegarder.
- [x] Il est possible d'associer zéro ou plusieurs étiquettes au dessin.
- [x] Il est possible d'enlever les étiquettes si elles sont choisies dans la fenêtre.
- [x] Il est possible de sauvegarder des dessins avec le même nom et avec les mêmes étiquettes (cette condition simultanément ou non) dans le serveur.
- [x] Les règles de validation pour les étiquettes sont clairement présentées dans l'interface.
- [x] Des vérifications (client ET serveur) sont présentes pour la sauvegarde. _Vérification minimale: nom non vide et étiquettes valides_
- [ ] S'il est impossible de sauvegarder le dessin, l'utilisateur se fait mettre au courant avec un message pertinent (message d'erreur).
- [x] Un bouton de confirmation doit être présent pour sauvegarder le dessin.
- [x] La modale de sauvegarde (ou du moins le bouton de confirmation) est mise non disponbile lorsque le dessin est en pleine sauvegarde.

### Commentaires

Aucun message d'erreur sur l'échec de sauvegarde. La sauvegarde se fait dans la base de donnée au lieu de sur le serveur. Les reccourcis claviers sont disponibles et ont peut empiler les modales.
On peut se ramasser dans un état ou on peu ne plus enregistrer de dessins
Erreur dans la console.

## Filtrage par étiquettes 6/6 - 1

- [x] Il doit être possible de filtrer les dessins en utilisant des étiquettes.
- [x] Pour chaque dessin de la liste, les étiquettes, si présentes, doivent toutes être visibles (via un mécanisme de votre choix).
- [x] Le filtrage par étiquette - Lorsque vide, tous les dessins doivent être possibles d'être chargés. _ie: pas d'étiquette, pas de filtre_.
- [x] Le filtrage par étiquette - Lorsqu'une étiquette est sélectionnée pour filtrage, seulement les dessins sur le serveur avec cette étiquette sont visibles dans le carrousel.
- [x] Le filtrage par étiquette - Lorsque mutliples étiquettes sont sélectionnées pour filtrage, seulement les dessins sur le serveur qui contiennent au moins une des étiquettes doivent être visibles dans la liste (_OU_ logique).
- [x] Il doit être possible d'accéder à tous les dessins du carrousel, pour un critère de recherche donné.
- [x] Si aucun dessin n'est trouvable par les étiquettes sélectionnées, l'utilisateur doit en être informé.
- [x] Les anciens paramètres d'ouverture ne sont plus visibles lors de la réouverture du carrousel (les paramètres sont remis à leur état original). _ie: pas de filtre d'activé_

### Commentaires

## Selection

- 0.05 ctrl-A ne marche pas,
- 0.05 pas de boîte englobante pour l'ellipse,
- 0.05 sélection ellipse devient blanc lorsque c'est sélectionné

## Guide

- 0.05 manque le guide pour la selection

## Annuler-refaire

- Un redimensionnement ne peut pas être undo (La selection non plus)
- On peut faire Ctrl-Z pendant qu'on dessine
- Lorsqu'on clique à l'écran avec un outil (rectancle par exemple) sans dessiner quoique ce soit l'action est rajouter à la pile undoRedo ce qui ne dvrait pas arriver.
- Vos tests devraient inclure une vérification de l'état des piles de undo et redo.

## Anciennes fonctionnalités brisées ou non réglées

- Après un redimensionnement, lorsqu'on créé un nouveau dessin la surface de dessin n'est pas remise aux dimensions initiales
- Lorsqu'on entre manuellement des couleurs ça change l'outil utilisé (par exemple si je suis sur le sceau de peinture et que j'écris '111111' on passe à rctangle)

## UI/UX (suggestions)

- Ce serait bon pour le visuel d'avoir minimalement le valeur min et max des slider
- Lorsqu'on pèse sur 3 pour avoir le polygone l'outil est bien le polygone mais l'affichage du side bar montre rectangle
- Un peu de couleur ici et là

# QA

## Qualité des classes /14

### La classe n'a qu'une responsabilitée et elle est non triviale.

**2/3**  
_Commentaires :_

color-comparison-helper devrait être une classe statique
tool-service.ts openToolSidenav et closeToolSidenav n'ont pas leur place dans le tool service.
ajouter un controller pour votre service de dessin

### Le nom de la classe est approprié. Utilisation appropriée des suffixes ({..}Component,{..}Controller, {..}Service, etc.). Le format à utiliser est le PascalCase

**1.25/2**  
_Commentaires :_

IndexService index.service.ts n'est pas un nom approprié
DrawingsDataService drawings-data.service.ts le nom devrait etre lié au carousel, on dirait que c'est les informations générique des dessins comme service

### La classe ne comporte pas d'attributs inutiles (incluant des getter/setter inutiles). Les attributs ne représentent que des états de la classe. Un attribut utilisé seulement dans les tests ne devrait pas exister.

**1.25/3**  
_Commentaires :_

tabLinks guide.component.ts
initialCoord rectangle-service.ts
showDrawingTools sidebar.component.ts
toogleToolSidenav tool-service.ts
showTools attribute-panel.component.ts
noDrawingFiltered carousel.component.ts
sideBarToolsBottomMap sidebar.component.ts
availableTextures brush.service.ts

### La classe minimise l'accessibilité des membres (public/private/protected)

**0/2**  
_Commentaires :_

noDrawings, sendDrawingToEditor carousel.component.ts
drawingService create-new-drawing.component.ts
resizeX, resizeY, setAnchorPosition editor.component.ts
tabElement, tabContent guide.component.ts
toolService editor.component.ts
sideBarToolsTopMap sidebar.component.ts
getColorAtPosition, emitColor, ... color-slide.component.ts

### Les valeurs par défaut des attributs de la classe sont initialisés de manière consistante (soit dans le constructeur partout, soit à la définition)

**0/4**  
_Commentaires :_

Inconsistant

## Qualité des fonctions /13

### Les noms des fonctions sont précis et décrivent les tâches voulues. Le format à utiliser doit être uniforme dans tous les fichiers (camelCase, PascalCase, ...)

**0.25/2**  
_Commentaires :_

ApplyGradient color-palette.component.ts
getcolorsHistory color-selection-service.ts
\_currentDrawingTool, \_currentDrawingToolID, \_currentDrawingToolID , \_selectedSideBarToolID, \_selectedSideBarToolID

### Chaque fonction n'a qu'une seule utilité, elle ne peut pas être fragmentée en plusieurs fonctions et elle est facilement lisible.

**2/3**  
_Commentaires :_

onKeyDown ellipse-selector.service.ts
onKeyDown line-service.ts
onKeyDown rectangle-selector.service.ts
drawSelectedBox rectangle-selector.service.ts

### Les fonctions minimisent les paramètres en entrée (pas plus de trois). Utilisation d'interfaces ou de classe pour des paramètres pouvant être regroupé logiquement.

**3/3**  
_Commentaires :_

### Les fonctions sont pures lorsque possible. Les effets secondaires sont minimisés

**2/3**  
_Commentaires :_

le constructeur de undo-redo-service.ts, un injection manuel du toolservice devrait pas être nécéssaire

### Tous les paramètres de fonction sont utilisés

**1.75/2**  
_Commentaires :_

deleteDrawing carousel.component.ts

## Exceptions /4

### Les exceptions sont claires et spécifiques (Pas d'erreurs génériques). Les messages d'erreur affichés à l'utilisateur sont compréhensible pour l'utilisateur moyen (pas de code d'erreur serveur, mais plutôt un message descriptif du genre "Un problème est survenu lors de la sauvegarde du dessin")

**1/2**  
_Commentaires :_

getAllDrawings drawing-data.service.ts aucun message d'erreur
catch sans erreur relancer dans le serveur

### Toute fonction doit gérer les valeurs limites de leurs paramètres

**1/1**  
_Commentaires :_

### Tout code asynchrone (Promise, Observable ou Event) doit être géré adéquatement.

**0/1**  
_Commentaires :_

main-page.component.ts subscribe mal géré
save-popup.component.ts subscribe mal géré

## Qualité générale

- #27: pas de regroupement logique des constantes dans constant.ts(2-22), Pas de fichier .env pour le url de la database
- #30: nom d'attribut avec systeme de nomage different: color-comparison-helper.ts(4, 10), tools-service.ts
- #33: editor.component.ts(65), guide.component.ts(25), line-service.ts(94), undo-redo.service.ts(35, 47), validator-service.ts(31)
- #35: drawings-data.service.ts(125), sidebar.component.ts(70, 81)
- #39: pencil-service.ts plutôt que pencil.service.ts
- #43: Code commenté
- #45: document.getElementBy\* ne peut pas être utilisé, utilisé plutôt ViewChild
- #47: no-magic-numbers disable dans color-slider.component sans justification; deprecation disabled sans justification; pour les any qui on été disable vous devriez être en mesure de trouver le type du parametre (sinon je peux verifier avec vous)
- #48: Pas utilisé
