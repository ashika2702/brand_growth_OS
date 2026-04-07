import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import PublicForm from '@/components/forms/PublicForm';
import { FormQuestion } from '@/components/forms/QuestionLibrary';

/**
 * Public Form Page
 * URL: /f/[slug]
 */
export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Fetch form config
  const form = await prisma.leadForm.findUnique({
    where: { slug },
    include: {
      client: {
        select: {
          name: true,
          primaryColor: true,
          logo: true,
          domain: true,
        },
      },
    },
  });

  if (!form) {
    notFound();
  }

  const questions = form.questions as unknown as FormQuestion[];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="w-full max-w-xl relative z-10 px-2 sm:px-0">        
        <PublicForm
          formId={form.id}
          slug={form.slug}
          name={form.name}
          questions={questions}
          domain={form.client.domain}
        />
      </div>
    </div>
  );
}
