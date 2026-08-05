import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/ContentEditor";
import { getSection } from "@/lib/content-schema";

export default async function ContentSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: sectionId } = await params;
  const section = getSection(sectionId);
  if (!section) notFound();

  return (
    <div className="space-y-6">
      <Link href="/content" className="text-sm font-medium text-brand-medium">
        ← חזרה לכל המקטעים
      </Link>
      <ContentEditor section={section} />
    </div>
  );
}
