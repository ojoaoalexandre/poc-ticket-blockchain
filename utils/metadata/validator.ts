import {
  NFTMetadata,
  ValidationResult
} from "./types";

export function validateMetadata(metadata: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!metadata || typeof metadata !== "object") {
    return {
      valid: false,
      errors: ["Metadata must be a valid object"],
      warnings: []
    };
  }

  if (!metadata.name || typeof metadata.name !== "string") {
    errors.push("Field 'name' is required and must be a string");
  }

  if (!metadata.description || typeof metadata.description !== "string") {
    errors.push("Field 'description' is required and must be a string");
  }

  if (!metadata.image || typeof metadata.image !== "string") {
    errors.push("Field 'image' is required and must be a string");
  } else {
    const imageValidation = validateImageURL(metadata.image);
    if (!imageValidation.valid) {
      errors.push(...imageValidation.errors);
    }
    warnings.push(...imageValidation.warnings);
  }

  if (!metadata.attributes) {
    errors.push("Field 'attributes' is required");
  } else if (!Array.isArray(metadata.attributes)) {
    errors.push("Field 'attributes' must be an array");
  } else {
    const attributesValidation = validateAttributes(metadata.attributes);
    errors.push(...attributesValidation.errors);
    warnings.push(...attributesValidation.warnings);
  }

  if (metadata.animation_url !== undefined && typeof metadata.animation_url !== "string") {
    errors.push("Field 'animation_url' must be a string if provided");
  }

  if (metadata.external_url !== undefined && typeof metadata.external_url !== "string") {
    errors.push("Field 'external_url' must be a string if provided");
  }

  if (metadata.background_color !== undefined) {
    if (typeof metadata.background_color !== "string") {
      errors.push("Field 'background_color' must be a string if provided");
    } else if (!isValidHexColor(metadata.background_color)) {
      errors.push("Field 'background_color' must be a valid hex color (without #)");
    }
  }

  if (metadata.name && metadata.name.length > 100) {
    warnings.push("Name is longer than 100 characters - may be truncated on some platforms");
  }

  if (metadata.description && metadata.description.length > 1000) {
    warnings.push("Description is longer than 1000 characters - may be truncated on some platforms");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateAttributes(attributes: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (attributes.length === 0) {
    warnings.push("Attributes array is empty - NFT will have no traits");
  }

  attributes.forEach((attr, index) => {
    if (!attr || typeof attr !== "object") {
      errors.push(`Attribute at index ${index} must be an object`);
      return;
    }

    if (!attr.trait_type || typeof attr.trait_type !== "string") {
      errors.push(`Attribute at index ${index} must have a 'trait_type' string field`);
    }

    if (attr.value === undefined || attr.value === null) {
      errors.push(`Attribute at index ${index} must have a 'value' field`);
    } else {
      const valueType = typeof attr.value;
      if (valueType !== "string" && valueType !== "number") {
        errors.push(`Attribute at index ${index} has invalid value type (must be string or number)`);
      }
    }

    if (attr.display_type !== undefined) {
      const validDisplayTypes = ["number", "boost_number", "boost_percentage", "date"];
      if (!validDisplayTypes.includes(attr.display_type)) {
        errors.push(`Attribute at index ${index} has invalid display_type: ${attr.display_type}`);
      }

      if (attr.display_type && typeof attr.value !== "number") {
        warnings.push(`Attribute at index ${index} has display_type but value is not a number`);
      }
    }

    if (attr.max_value !== undefined && typeof attr.max_value !== "number") {
      errors.push(`Attribute at index ${index} has invalid max_value (must be a number)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateImageURL(url: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const ipfsPattern = /^ipfs:\/\//;
  const httpsPattern = /^https:\/\//;
  const httpPattern = /^http:\/\//;
  const dataPattern = /^data:image\//;

  if (!ipfsPattern.test(url) && !httpsPattern.test(url) && !dataPattern.test(url)) {
    if (httpPattern.test(url)) {
      warnings.push("Image URL uses HTTP instead of HTTPS - not recommended for production");
    } else {
      errors.push("Image URL must start with ipfs://, https://, or data:image/");
    }
  }

  if (url.includes("ipfs.io") || url.includes("gateway.pinata.cloud")) {
    warnings.push("Consider using ipfs:// protocol instead of gateway URL for better decentralization");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function isValidHexColor(color: string): boolean {
  return /^[0-9A-Fa-f]{6}$/.test(color);
}

export function validateMetadataJSON(json: string): ValidationResult {
  try {
    const metadata = JSON.parse(json);
    return validateMetadata(metadata);
  } catch (error) {
    return {
      valid: false,
      errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

export function isValidMetadata(metadata: any): metadata is NFTMetadata {
  const result = validateMetadata(metadata);
  return result.valid;
}
