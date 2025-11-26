import { motion } from 'framer-motion';

// Base skeleton component
export function Skeleton({ className = '', animate = true }) {
  return (
    <motion.div
      className={`bg-gray-200 rounded ${className}`}
      animate={animate ? { opacity: [0.5, 1, 0.5] } : {}}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// File card skeleton (grid view)
export function FileCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex justify-center mb-4 pt-4">
        <Skeleton className="w-16 h-16 rounded-2xl" />
      </div>
      <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-3 w-1/2 mx-auto" />
    </div>
  );
}

// File card skeleton (list view)
export function FileListSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Skeleton className="w-5 h-5 rounded" />
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="w-20 h-4" />
    </div>
  );
}

// Email card skeleton
export function EmailCardSkeleton() {
  return (
    <div className="flex items-start gap-4 px-4 py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="w-5 h-5 rounded" />
      </div>
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="w-16 h-4" />
    </div>
  );
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="w-11 h-11 rounded-xl" />
      </div>
    </div>
  );
}

// Full page skeleton loader
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Search bar */}
      <Skeleton className="h-12 w-full max-w-2xl rounded-xl" />

      {/* Content grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <FileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Email list skeleton
export function EmailListSkeleton({ count = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <EmailCardSkeleton key={i} />
      ))}
    </div>
  );
}

// File grid skeleton
export function FileGridSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(count)].map((_, i) => (
        <FileCardSkeleton key={i} />
      ))}
    </div>
  );
}

// File list skeleton
export function FileListSkeletonGroup({ count = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <FileListSkeleton key={i} />
      ))}
    </div>
  );
}

export default Skeleton;
