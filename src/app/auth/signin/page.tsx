import { SignInButton } from '@/components/auth/SignInButton'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-neutral-200">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-display font-bold text-neutral-800">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Please sign in to continue
          </p>
        </div>

        <div className="mt-8">
          <SignInButton />
        </div>
      </div>
    </div>
  )
} 