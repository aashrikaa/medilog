import { GoogleGenerativeAI } from '@google/generative-ai';
import { LabValue, AIExtractionResult } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function extractLabValues(text: string): Promise<AIExtractionResult> {
  const startTime = Date.now();
  
  const prompt = `
    Analyze this medical document text and extract lab values. 
    Return a JSON object with the following structure:
    {
      "labValues": [
        {
          "name": "Test name (e.g., Hemoglobin, Glucose, Cholesterol)",
          "value": numeric_value,
          "unit": "unit (e.g., g/dL, mg/dL, mmol/L)",
          "referenceRange": {
            "min": min_normal_value,
            "max": max_normal_value
          },
          "status": "normal|high|low|critical"
        }
      ],
      "summary": "Brief medical summary highlighting key findings, diagnoses, and abnormal readings"
    }
    
    Only extract values that are clearly lab test results. Be precise with units and reference ranges.
    If no lab values are found, return empty labValues array.
    
    Document text:
    ${text}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and process lab values
    const labValues: LabValue[] = (parsed.labValues || [])
      .map((lv: any) => ({
        // Do NOT set _id here; let MongoDB generate one
        documentId: '' as any,
        name: lv.name,
        value: parseFloat(lv.value),
        unit: lv.unit,
        referenceRange: lv.referenceRange,
        status: lv.status || 'normal',
        confidence: 0.85,
        extractedDate: new Date(),
      }))
      .filter((lv: LabValue) => !Number.isNaN(lv.value));

    const processingTime = Date.now() - startTime;

    return {
      labValues,
      summary: parsed.summary || 'No summary generated',
      confidence: 0.85,
      processingTime,
    };
  } catch (error) {
    console.error('AI extraction error:', error);
    // Graceful fallback so uploads still succeed
    return {
      labValues: [],
      summary: 'AI extraction unavailable.',
      confidence: 0,
      processingTime: Date.now() - startTime,
    };
  }
}

export async function generateDocumentSummary(text: string): Promise<string> {
  const prompt = `
    Generate a concise medical summary of this document. Focus on:
    - Key diagnoses or findings
    - Important test results
    - Treatment recommendations
    - Follow-up requirements
    
    Keep it under 200 words and use clear medical terminology.
    
    Document text:
    ${text}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Summary generation error:', error);
    return 'Unable to generate summary at this time.';
  }
}

export async function suggestTags(text: string): Promise<string[]> {
  const prompt = `
    Suggest 3-5 relevant tags for this medical document. 
    Consider medical conditions, test types, body systems, and urgency.
    Return only the tags as a comma-separated list, no explanations.
    
    Document text:
    ${text}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tags = response.text().split(',').map(tag => tag.trim());
    return tags.filter(tag => tag.length > 0);
  } catch (error) {
    console.error('Tag suggestion error:', error);
    return [];
  }
}
