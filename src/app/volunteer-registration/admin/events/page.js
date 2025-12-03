// src/app/volunteer-registration/admin/events/page.js

import EventAdminListContainer from "@/components/pages/EventAdminListContainer";

export default function AdminEventsPage() {
  // サーバー側での処理は廃止し、クライアント側のContainerに任せる
  return <EventAdminListContainer />;
}
