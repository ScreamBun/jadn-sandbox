async function validateField(fieldValue: any, fieldType: string, options: string[]): Promise<string> {
  try {
    const response = await fetch('/api/validate/field', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: fieldValue, type: fieldType, options }),
    });
    
    const result = await response.json();
    return result.valid ? "" : result.message;
  } catch (error) {
    console.error('Validation error:', error);
    return "Validation service unavailable";
  }
};

export const validate = async (input: any, type: string, options: string[]): Promise<string> => {
    if (options.length === 0) {
        return ""; // No options means generic typed input is valid
    }

    return await validateField(input, type, options);
};
