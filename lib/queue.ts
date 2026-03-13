import { processCRMAutomation } from '../workers/crm_worker';

/**
 * CRM Job Dispatcher (No-Redis Version)
 * Dispatches tasks to the automation engine.
 */
export async function addCRMJob(type: string, leadId: string, clientId: string, data: any = {}) {
  // Fire and forget (don't await so the UI stays fast)
  processCRMAutomation(type, leadId, clientId, data).catch(err => {
    console.error('Failed to process CRM automation:', err);
  });
}
