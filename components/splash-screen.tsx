import { Sparkles } from "lucide-react"

export default function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full splash-animation">
      <div className="relative flex flex-col items-center">
        <div className="absolute -top-12 -right-12">
          <Sparkles className="h-8 w-8 text-blue-500" />
        </div>
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl font-bold text-white">₹</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">InstaINR</h1>
        <p className="text-gray-400 text-sm">Convert your crypto to INR instantly</p>
      </div>
    </div>
  )
}
