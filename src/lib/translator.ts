import { NextResponse } from 'next/server'

// Microsoft Translator API configuration
const TRANSLATOR_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com'
const TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY
const TRANSLATOR_REGION = process.env.AZURE_TRANSLATOR_REGION || 'eastus'

interface TranslationResponse {
  translations: {
    text: string
    to: string
  }[]
  detectedLanguage?: {
    language: string
    score: number
  }
}

/**
 * Translate text using Microsoft Translator API
 * @param text - Text to translate
 * @param targetLanguage - Target language code (e.g., 'en', 'tr')
 * @param sourceLanguage - Source language code (optional, auto-detect if not provided)
 * @returns Translated text
 */
export async function translateText(
  text: string, 
  targetLanguage: string, 
  sourceLanguage?: string
): Promise<string> {
  if (!TRANSLATOR_KEY) {
    throw new Error('Azure Translator API key is not configured')
  }

  if (!text.trim()) {
    return text
  }

  // Don't translate if source and target languages are the same
  if (sourceLanguage === targetLanguage) {
    return text
  }

  try {
    const url = `${TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${targetLanguage}`
    const urlWithFrom = sourceLanguage ? `${url}&from=${sourceLanguage}` : url

    const response = await fetch(urlWithFrom, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': TRANSLATOR_REGION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text }])
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Translation API error: ${response.status} - ${errorText}`)
    }

    const result: TranslationResponse[] = await response.json()
    
    if (result?.[0]?.translations?.[0]?.text) {
      return result[0].translations[0].text
    } else {
      throw new Error('Invalid translation response format')
    }
  } catch (error) {
    console.error('Translation error:', error)
    // Return original text as fallback
    return text
  }
}

/**
 * Translate markdown content while preserving formatting
 * @param content - Markdown content to translate
 * @param targetLanguage - Target language code
 * @param sourceLanguage - Source language code (optional)
 * @returns Translated markdown content
 */
export async function translateMarkdown(
  content: string, 
  targetLanguage: string, 
  sourceLanguage?: string
): Promise<string> {
  if (!content.trim()) {
    return content
  }

  try {
    // Split content into translatable and non-translatable parts
    const parts = splitMarkdownForTranslation(content)
    const translatedParts: string[] = []

    for (const part of parts) {
      if (part.shouldTranslate) {
        const translated = await translateText(part.content, targetLanguage, sourceLanguage)
        translatedParts.push(translated)
      } else {
        translatedParts.push(part.content)
      }
    }

    return translatedParts.join('')
  } catch (error) {
    console.error('Markdown translation error:', error)
    return content
  }
}

/**
 * Split markdown content into translatable and non-translatable parts
 */
function splitMarkdownForTranslation(content: string): Array<{content: string, shouldTranslate: boolean}> {
  const parts: Array<{content: string, shouldTranslate: boolean}> = []
  const lines = content.split('\n')
  let currentPart = ''
  let shouldTranslate = true

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if this line should not be translated
    if (
      line.trim().startsWith('```') || // Code blocks
      line.trim().startsWith('---') || // Front matter
      line.match(/^#+\s/) || // Headers (translate these)
      line.match(/^\[.*\]:/) || // Link references
      line.match(/^!\[.*\]\(.*\)/) || // Images
      line.trim().startsWith('|') // Tables
    ) {
      // Finish current translatable part
      if (currentPart.trim() && shouldTranslate) {
        parts.push({ content: currentPart, shouldTranslate: true })
        currentPart = ''
      }
      
      // Handle special cases
      if (line.trim().startsWith('```')) {
        // Code block - don't translate until closing ```
        shouldTranslate = false
        parts.push({ content: line + '\n', shouldTranslate: false })
      } else if (line.match(/^#+\s/)) {
        // Header - translate this
        parts.push({ content: line + '\n', shouldTranslate: true })
      } else {
        // Other non-translatable content
        parts.push({ content: line + '\n', shouldTranslate: false })
      }
    } else if (line.trim() === '' && !shouldTranslate && lines[i-1]?.trim().startsWith('```')) {
      // End of code block
      shouldTranslate = true
      parts.push({ content: line + '\n', shouldTranslate: false })
    } else {
      // Regular content
      currentPart += line + '\n'
    }
  }

  // Add remaining content
  if (currentPart.trim()) {
    parts.push({ content: currentPart, shouldTranslate })
  }

  return parts
}

/**
 * Detect language of given text
 * @param text - Text to analyze
 * @returns Detected language code
 */
export async function detectLanguage(text: string): Promise<string> {
  if (!TRANSLATOR_KEY || !text.trim()) {
    return 'unknown'
  }

  try {
    const url = `${TRANSLATOR_ENDPOINT}/detect?api-version=3.0`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': TRANSLATOR_REGION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text }])
    })

    if (!response.ok) {
      throw new Error(`Language detection error: ${response.status}`)
    }

    const result = await response.json()
    return result?.[0]?.language || 'unknown'
  } catch (error) {
    console.error('Language detection error:', error)
    return 'unknown'
  }
}

/**
 * Get supported languages from Microsoft Translator
 * @returns Object with language codes and names
 */
export async function getSupportedLanguages(): Promise<Record<string, any>> {
  try {
    const url = `${TRANSLATOR_ENDPOINT}/languages?api-version=3.0`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`Languages API error: ${response.status}`)
    }

    const result = await response.json()
    return result.translation || {}
  } catch (error) {
    console.error('Supported languages error:', error)
    return {}
  }
}

/**
 * Utility function to check if translation is needed
 * @param sourceLanguage - Source language code
 * @param targetLanguage - Target language code
 * @returns True if translation is needed
 */
export function needsTranslation(sourceLanguage: string, targetLanguage: string): boolean {
  return sourceLanguage !== targetLanguage && 
         sourceLanguage !== 'unknown' && 
         targetLanguage !== 'unknown'
}

/**
 * Calculate estimated cost for translation (for monitoring)
 * @param text - Text to be translated
 * @returns Character count
 */
export function calculateTranslationCost(text: string): number {
  // Microsoft charges per character
  return text.length
}