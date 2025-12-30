export async function simulateAIAnalysis(code: string, language: string) {
    // Simulation d'un délai réseau pour l'effet "IA"
    await new Promise(resolve => setTimeout(resolve, 2000));

    const lowercaseCode = code.toLowerCase();
    const explanation = `Cette analyse porte sur un snippet en **${language}**. 
    
Le code semble implémenter une logique de type ${lowercaseCode.includes('fetch') ? 'requête asynchrone' :
            lowercaseCode.includes('state') ? 'gestion d\'état React' :
                'traitement algorithmique'
        }.

**Points clés :**
- Utilisation de structures ${language === 'typescript' ? 'fortement typées' : 'standard'}.
- La complexité semble optimisée pour une exécution côté client.
- Suggestion : Ajouter des commentaires JSDoc pour une meilleure maintenabilité.

Ce snippet suit les bonnes pratiques de la communauté Face2Geek.`;

    const suggestedTags = [];
    if (lowercaseCode.includes('react')) suggestedTags.push('react');
    if (lowercaseCode.includes('hook')) suggestedTags.push('hooks');
    if (lowercaseCode.includes('async')) suggestedTags.push('async');
    if (lowercaseCode.includes('css')) suggestedTags.push('styling');
    if (suggestedTags.length === 0) suggestedTags.push('logic', 'web');

    return { explanation, suggestedTags };
}
