import { processCRMAutomation } from '@/workers/crm_worker';
import { processContentAutomation } from '@/workers/content_worker';

/**
 * CRM Job Dispatcher (No-Redis Version)
 * Dispatches tasks to the automation engine.
 */
export async function addCRMJob(type: string, leadId: string, clientId: string, data: any = {}) {
  // Fire and forget (don't await so the UI stays fast)
  processCRMAutomation(type, leadId, clientId, data).catch((err: Error) => {
    console.error('Failed to process CRM automation:', err);
  });
}

/**
 * Content Job Dispatcher
 * Dispatches tasks to the content automation engine.
 */
export async function addContentJob(type: string, contentId: string, clientId: string, data: any = {}) {
  processContentAutomation(type, contentId, clientId, data).catch((err: Error) => {
    console.error('Failed to process Content automation:', err);
  });
}
