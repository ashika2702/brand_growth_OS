import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { processWebhookLead } from '@/lib/webhooks';
import { mapRawLeadData } from '@/lib/leads';

/**
 * Public Form Submission Endpoint
 * POST /api/forms/[slug]/submit
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { searchParams } = new URL(req.url);

    // 1. Identify the Form
    const form = await prisma.leadForm.findUnique({
      where: { slug },
      select: { 
        id: true, 
        clientId: true, 
        name: true,
        isActive: true,
        questions: true
      }
    });

    if (!form || !form.isActive) {
      return NextResponse.json({ error: 'Form not found or inactive' }, { status: 404 });
    }

    // 2. Resolve identity from dynamic question IDs
    let resolvedEmail = body.email;
    let resolvedName = body.name || body.full_name;
    let resolvedPhone = body.phone || body.phone_number;

    const questions = form.questions as unknown as any[];
    if (questions) {
      questions.forEach(q => {
        const val = body[q.id];
        if (!val) return;

        if (q.type === 'email' && !resolvedEmail) resolvedEmail = val;
        if (q.type === 'phone' && !resolvedPhone) resolvedPhone = val;
        if (q.type === 'text' && q.label.toLowerCase().includes('name') && !resolvedName) resolvedName = val;
      });
    }

    // 3. Normalized structure
    const { email, name, phone, ...answers } = {
       ...body, 
       email: resolvedEmail, 
       name: resolvedName, 
       phone: resolvedPhone 
    };

    // 3. Extract Attribution from URL (GCLID, FBCLID, LI_FAT_ID)
    const gclid = searchParams.get('gclid');
    const fbclid = searchParams.get('fbclid');
    const li_fat_id = searchParams.get('li_fat_id');
    const utmSource = searchParams.get('utm_source') || 
                      (gclid ? 'google_ads' : fbclid ? 'meta_ads' : li_fat_id ? 'linkedin_ads' : 'landing_page');
    const utmCampaign = searchParams.get('utm_campaign') || form.name;

    // 4. Map and Process
    // mapRawLeadData handles normalizing fields and putting extra data into customFields
    const leadData = mapRawLeadData({
      name,
      email,
      phone,
      ...answers
    });

    if (!leadData.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 5. Process through the Lead Engine
    const lead = await processWebhookLead({
      clientId: form.clientId,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      source: gclid ? 'google_ads' : fbclid ? 'meta_ads' : li_fat_id ? 'linkedin_ads' : 'landing_page',
      utmSource: utmSource || undefined,
      utmCampaign: utmCampaign,
      gclid: gclid || undefined,
      fbclid: fbclid || undefined,
      li_fat_id: li_fat_id || undefined,
      customFields: leadData.customFields,
      intent: `Submitted BGO Form: ${form.name}`,
    });

    // 6. Link lead to specific form ID (M03)
    await prisma.lead.update({
      where: { id: lead.id },
      data: { formId: form.id }
    });

    return NextResponse.json({ success: true, leadId: lead.id });

  } catch (error) {
    console.error('[FORM_SUBMIT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
