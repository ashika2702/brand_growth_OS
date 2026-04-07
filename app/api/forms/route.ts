import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/forms
 * Fetch all forms for a specific client (via query param)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const forms = await prisma.leadForm.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error('Failed to fetch forms:', error);
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
  }
}

/**
 * POST /api/forms
 * Create or update a form configuration
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, clientId, name, description, slug, questions, isActive } = body;

    if (!clientId || !name || !slug || !questions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const formData = {
      clientId,
      name,
      description,
      slug,
      questions, // This should be a JSON array
      isActive: isActive ?? true
    };

    let form;
    if (id) {
      // Update existing form
      form = await prisma.leadForm.update({
        where: { id },
        data: formData
      });
    } else {
      // Create new form
      form = await prisma.leadForm.create({
        data: formData
      });
    }

    return NextResponse.json(form);
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Selected client no longer exists. Please refresh the page or re-select the account.' }, { status: 400 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A form with this slug already exists. Please choose a unique URL.' }, { status: 400 });
    }
    console.error('Failed to save form:', error);
    return NextResponse.json({ error: 'Failed to save form' }, { status: 500 });
  }
}

/**
 * DELETE /api/forms
 * Delete a form by ID
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    await prisma.leadForm.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete form:', error);
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
  }
}
