import { motion } from 'framer-motion';
import { HardDrive, Mail, Folder, FileText, Clock, Star } from 'lucide-react';
import { formatFileSize } from '../../utils/theme';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

export default function StatsCards({ stats, type = 'drive' }) {
  const driveStats = [
    {
      label: 'Total Files',
      value: stats?.totalFiles || 0,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Folders',
      value: stats?.folders || 0,
      icon: Folder,
      color: 'amber',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Storage Used',
      value: formatFileSize(stats?.storageUsed || 0),
      icon: HardDrive,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
      isStorage: true,
    },
    {
      label: 'Recent',
      value: stats?.recent || 0,
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
  ];

  const gmailStats = [
    {
      label: 'Total Emails',
      value: stats?.totalEmails || 0,
      icon: Mail,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Unread',
      value: stats?.unread || 0,
      icon: Mail,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500',
      highlight: stats?.unread > 0,
    },
    {
      label: 'Starred',
      value: stats?.starred || 0,
      icon: Star,
      color: 'amber',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Labels',
      value: stats?.labels || 0,
      icon: Folder,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
  ];

  const statsToShow = type === 'drive' ? driveStats : gmailStats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsToShow.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.label}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${
              stat.highlight ? 'ring-2 ring-red-100' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>

            {/* Mini progress bar for storage */}
            {stat.isStorage && stats?.storageTotal && (
              <div className="mt-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stats.storageUsed / stats.storageTotal) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  of {formatFileSize(stats.storageTotal)}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
