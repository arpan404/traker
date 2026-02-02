import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-6 py-12">
      <div className="rounded-lg border border-[#e9e9e7] bg-white p-6 shadow-sm">
        <SignUp />
      </div>
    </div>
  );
}
