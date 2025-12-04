import { motion } from 'framer-motion'

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.05 }} className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-8 h-8" />
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-sm opacity-90">{label}</p>
    </motion.div>
  )
}

export default StatCard