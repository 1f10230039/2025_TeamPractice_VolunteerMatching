import EventAdminFormContainer from "@/components/pages/EventAdminFormContainer";

export default async function EditEventPage({ params }) {
  // URLパラメータの解決 (Next.js 15/16の仕様変更に対応するため await 推奨)
  const { id } = await params;

  // 編集モードなので ID を渡す
  return <EventAdminFormContainer eventId={id} />;
}
