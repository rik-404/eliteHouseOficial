import { Skeleton } from '@/components/ui/skeleton';

const PropertyCardSkeleton = () => {
  return (
    <div className="property-card group border-2 border-orange-500">
      <div className="relative overflow-hidden h-[200px]">
        <Skeleton className="w-full h-full" />
        <Skeleton className="absolute top-4 left-4 w-20 h-6" />
        <Skeleton className="absolute top-4 right-4 w-20 h-6" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <Skeleton className="w-40 h-6" />
          <Skeleton className="w-24 h-6" />
        </div>
        <div className="flex items-center mt-2">
          <Skeleton className="w-4 h-4 rounded-full mr-2" />
          <Skeleton className="w-40 h-4" />
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex items-center">
            <Skeleton className="w-4 h-4 rounded-full mr-2" />
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="flex items-center">
            <Skeleton className="w-4 h-4 rounded-full mr-2" />
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="flex items-center">
            <Skeleton className="w-4 h-4 rounded-full mr-2" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
        <Skeleton className="w-full h-10 mt-4" />
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;
