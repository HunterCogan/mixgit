import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import UserModel from "@/models/User";
import SettingsForm from "./_components/SettingsForm";

export default async function SettingsPage() {
  const session = await verifySession();

  await connectDB();
  const user = await UserModel.findById(session.userId).lean();

  if (!user) {
    return (
      <div className="w-full font-sans">
        <main className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-sm text-default-500">User not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      <main className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-default-500 mt-1">
            Update how you appear on your profile page.
          </p>
        </div>
        <SettingsForm
          userId={session.userId}
          initialName={user.name}
          initialColor={user.color ?? "#808080"}
          initialAbout={user.about ?? ""}
        />
      </main>
    </div>
  );
}
