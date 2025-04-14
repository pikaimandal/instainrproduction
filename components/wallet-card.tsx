interface WalletCardProps {
  title: string
  balance: number
  value: number
  color: string
  rate: number
}

export default function WalletCard({ title, balance, value, color, rate }: WalletCardProps) {
  return (
    <div className={`rounded-xl p-4 bg-gradient-to-r ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-white">{title}</h3>
          <p className="text-white/70 text-sm">Balance</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-white text-xl">
            {balance} {title}
          </p>
          <p className="text-white/70 text-sm">≈ ₹{value.toLocaleString()}</p>
          <p className="text-white/70 text-xs mt-1">Market Price: ₹{rate.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
