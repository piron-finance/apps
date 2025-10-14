"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdate);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user && !synced) {
        try {
          await createOrUpdateUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            name: user.fullName || "",
            image: user.imageUrl || "",
          });
          setSynced(true);
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }
    };

    syncUser();
  }, [isLoaded, user, createOrUpdateUser, synced]);

  return null;
}
