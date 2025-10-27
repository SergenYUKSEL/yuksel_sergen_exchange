// Fichier de test propre pour valider les hooks Git
// Ce fichier ne contient aucun console.log/table/warn ni TODO

function cleanFunction() {
    // Fonction propre sans console.log
    const data = ["item1", "item2", "item3"];
    
    // Utilisation d'un logger approprié (exemple)
    // logger.info("Données traitées avec succès");
    
    return data.map(item => item.toUpperCase());
}

function anotherCleanFunction() {
    // Fonction sans TODO ni console.log
    return {
        status: "success",
        message: "Opération terminée"
    };
}

export { cleanFunction, anotherCleanFunction };
