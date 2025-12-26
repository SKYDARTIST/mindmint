import { redirect } from 'next/navigation'

export default function LoginPage() {
    // Simple redirect to home page with a flag to show the auth modal
    redirect('/?showAuth=true')
}
