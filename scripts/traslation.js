// Almacena los textos originales para evitar la retraducion
const originalTexts = new Map();
const translationCache = new Map();

//Configuracion del idioma 
document.addEventListener('DOMContentLoaded', function(){
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.addEventListener('change', changeLanguage);

    // Inicializar con el idioma del navegador si esta disponible
    const browserLanguage = navigator.language.split('-')[0];
    if (['en', 'es', 'zh', 'fr'].includes(browserLanguage)){
        languageSelect.value = browserLanguage;
    }
});

// Funcion principal para cambiar el idioma
async function changeLanguage() {
    const select = document.getElementById('languageSelect');
    const targetLanguage = select.value;

    //Elementos a traducir
    const elementsToTranslate = document.querySelectorAll('[data-translate]');

    for (const element of elementsToTranslate){
        //Guarda el texto original si no lo hemos hecho antes
        if (!originalTexts.has(element)){
            originalTexts.set(element, element.innerText);
        }
        const originalText = originalTexts.get(element);
        // Solo traduce si hay texto y no es elemento interactivo
        if (originalText.trim() && !['INPUT', 'TEXTAREA','BUTTON'].includes(element.tagName)) {
            const translatedText = await translateWithCache(originalText, targetLanguage);
            element.textContent = translatedText;
        }
    }
}

// Funcion para traducir con cache
async function translateWithCache(text, targetLanguage){
    const cacheKey = `${text}-${targetLanguage}`;

    if (translationCache.has(cacheKey)){
        return translationCache.get(cacheKey);
    }
    const translatedText = await translate(text, targetLanguage);
    translationCache.set(cacheKey, translatedText);
    return translatedText;
}

// Funcion para llamar a la API de traduccion

async function translate(text, targetLanguage){
    // Si no hay texto para traducir, devuelve vacio
    if (!text.trim()) return'';

    try {
        const translate = firebase.functions().httpsCallable('translateText');
        const result = await translate({ text, targetLanguage });
        return result.data.translatedText;
    } catch(error){
        console.error('Error al traducir:', error);
        return text; // Devuelve el texto original en caso de error 
    }
}    