// /app/profile/edit/page.tsx

import ProfileEditPage from "@/components/pages/profile-edit-page";
import { ProfileProvider } from "@/lib/contexts/profile-context";
import { Toaster } from "sonner";

export default function ProfileEditRoute() {
  return (
    <ProfileProvider>
      <Toaster position="top-right" />
      <ProfileEditPage />
    </ProfileProvider>
  );
}