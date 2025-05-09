import ProfileForm from "@/components/forms/profile-form";
import { db } from "@/lib/db";
import React from "react";
import ProfilePicture from "./_components/profile-picture";
import { auth } from "@/lib/auth";

type Props = {};

const Settings = async (props: Props) => {
  const session = await auth();
  const authUser = session?.user;
  if (!authUser) return null;
   
  const user = await db.user.findUnique({ where: { id: authUser.id } });
  const removeProfileImage = async () => {
    "use server";
    const response = await db.user.update({
      where: {
        id: authUser.id
      },
      data: {
        image: ""
      }
    });
    return response;
  };
  const uploadProfileImage = async (image: string) => {
    "use server";
    const id = authUser.id;
    const response = await db.user.update({
      where: {
        id: id
      },
      data: {
        image: image
      }
    });

    return response;
  };
  const updateUserInfo = async (name: string) => {
    "use server";

    const updateUser = await db.user.update({
      where: {
        id: authUser.id
      },
      data: {
        name
      }
    });
    return updateUser;
  };
  return (
    <div className="flex flex-col gap-4">
      <h1 className="sticky top-0 z-[10] flex items-center justify-between border-b bg-background/50 p-6 text-4xl backdrop-blur-lg">
        <span>Settings</span>
      </h1>
      <div className="flex flex-col gap-10 p-6">
        <div>
          <h2 className="text-2xl font-bold">User Profile</h2>
          <p className="text-base text-white/50">
            Add or update your information
          </p>
        </div>
        <ProfilePicture
          onDelete={removeProfileImage}
          userImage={user?.image || ""}
          onUpload={uploadProfileImage}
        />
        <ProfileForm user={user} onUpdate={updateUserInfo} />
      </div>
    </div>
  );
};

export default Settings;
