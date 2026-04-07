import { Prisma } from '@prisma/client';

/**
 * Universal Lead Mapper
 * Extracts core identity fields and bundles everything else into customFields.
 */
export function mapRawLeadData(rawData: Record<string, any>) {
  const coreFields = ['name', 'email', 'phone', 'first_name', 'last_name', 'full_name'];
  
  const core: Record<string, any> = {};
  const custom: Record<string, any> = {};

  Object.entries(rawData).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Handle Name Mapping
    if (['name', 'full_name'].includes(normalizedKey)) {
      core.name = value;
    } else if (normalizedKey === 'first_name') {
      core.firstName = value;
    } else if (normalizedKey === 'last_name') {
      core.lastName = value;
    } 
    // Handle Email Mapping
    else if (['email', 'email_address'].includes(normalizedKey)) {
      core.email = value;
    }
    // Handle Phone Mapping
    else if (['phone', 'phone_number', 'mobile'].includes(normalizedKey)) {
      core.phone = value;
    }
    // Everything else goes to Custom Fields
    else if (!['source', 'campaign', 'intent', 'clientId'].includes(key)) {
      custom[key] = value;
    }
  });

  // Final Name Assembly if only first/last provided
  if (!core.name && (core.firstName || core.lastName)) {
    core.name = `${core.firstName || ''} ${core.lastName || ''}`.trim();
  }

  return {
    name: core.name || 'Unknown Lead',
    email: core.email,
    phone: core.phone,
    customFields: Object.keys(custom).length > 0 ? custom : null
  };
}

/**
 * Formats custom fields for table display (Snippet)
 */
export function getLeadRequirementSnippet(customFields: any, intent: string | null): string {
  const parts: string[] = [];
  
  if (customFields) {
    Object.entries(customFields).forEach(([key, value]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      parts.push(`${label}: ${value}`);
    });
  }

  if (parts.length > 0) return parts.join(' | ');
  return intent || 'General Enquiry';
}
