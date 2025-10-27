# Git Hooks - Validation du Code

Ce projet utilise des hooks Git pour maintenir la qualité du code et s'assurer qu'aucun code de debug ne soit committé.

## Hooks Configurés

### 1. Pre-commit Hook (`.git/hooks/pre-commit`)

**Fonctionnalités :**

- **Détection des console.log/table/warn** : Empêche le commit si des instructions de debug sont présentes
- **Détection des //TODO:** : Met en évidence les TODO avec nom de fichier et numéro de ligne
- **Validation interactive** : Demande confirmation si des TODO sont détectés

**Comportement :**

- **Console.log/table/warn** : **COMMIT REJETÉ** (obligatoire)
- **//TODO:** : **ATTENTION** (demande confirmation)

### 2. Commit-msg Hook (`.git/hooks/commit-msg`)

**Fonctionnalités :**

- **Validation du format des messages de commit**
- **Types de commit standardisés** (feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert)

**Format requis :**

```
type(scope): description
```

**Exemples valides :**

- `feat(auth): add user login functionality`
- `fix(api): resolve database connection issue`
- `docs: update README with installation steps`
- `refactor(utils): optimize data processing functions`

## Utilisation

### Commit normal

```bash
git add .
git commit -m "feat: add new feature"
```

### En cas d'erreur de validation

1. **Console.log détecté** : Supprimez tous les `console.log`, `console.table`, `console.warn`
2. **TODO détecté** : Confirmez ou annulez le commit
3. **Message invalide** : Utilisez le format requis

## Types de Commit Autorisés

| Type       | Description                               |
| ---------- | ----------------------------------------- |
| `feat`     | Nouvelle fonctionnalité                   |
| `fix`      | Correction de bug                         |
| `docs`     | Documentation                             |
| `style`    | Formatage, point-virgules manquants, etc. |
| `refactor` | Refactoring du code                       |
| `test`     | Ajout ou modification de tests            |
| `chore`    | Tâches de maintenance                     |
| `perf`     | Amélioration des performances             |
| `ci`       | Configuration CI/CD                       |
| `build`    | Système de build                          |
| `revert`   | Annulation d'un commit précédent          |

## Exemples de Code

### Code rejeté par le hook

```javascript
function badFunction() {
  console.log("Debug message"); // Rejeté
  console.table(data); // Rejeté
  console.warn("Warning"); // Rejeté

  // TODO: Fix this later        // Attention
  return data;
}
```

### Code accepté par le hook

```javascript
function goodFunction() {
  // Utilisation d'un logger approprié
  logger.info("Operation completed");

  // Commentaire explicatif sans TODO
  const processedData = data.map((item) => transform(item));

  return processedData;
}
```

## Désactiver temporairement les hooks

Si nécessaire, vous pouvez contourner les hooks avec :

```bash
git commit --no-verify -m "message"
```

**Attention** : Utilisez cette option avec parcimonie et uniquement en cas d'urgence.

## Maintenance

Les hooks sont automatiquement exécutés à chaque commit. Aucune action supplémentaire n'est requise pour leur fonctionnement.
