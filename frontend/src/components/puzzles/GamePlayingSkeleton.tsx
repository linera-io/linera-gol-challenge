import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

export function GamePlayingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-10 rounded-lg" />
        <div className="flex-1" />
      </div>

      <Skeleton className="w-64 h-9 rounded-lg mx-auto" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white shadow-lg">
            <CardBody className="p-6">
              <div className="space-y-4">
                <Skeleton className="w-32 h-6 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="w-full h-4 rounded-lg" />
                  <Skeleton className="w-3/4 h-4 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="w-20 h-4 rounded-lg mb-1" />
                    <Skeleton className="w-16 h-6 rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="w-20 h-4 rounded-lg mb-1" />
                    <Skeleton className="w-16 h-6 rounded-lg" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="flex-1 h-10 rounded-lg" />
                  <Skeleton className="flex-1 h-10 rounded-lg" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-white shadow-lg">
            <CardBody className="p-6">
              <div className="space-y-4">
                <Skeleton className="w-48 h-7 rounded-lg mx-auto mb-4" />
                <div className="flex items-center justify-center">
                  <Skeleton className="w-96 h-96 rounded-lg" />
                </div>
                <div className="flex justify-center gap-2">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="w-10 h-10 rounded-lg" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function PuzzleInfoSkeleton() {
  return (
    <Card className="bg-white shadow-lg">
      <CardBody className="p-6">
        <div className="space-y-4">
          <Skeleton className="w-32 h-6 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="w-full h-4 rounded-lg" />
            <Skeleton className="w-3/4 h-4 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="w-20 h-4 rounded-lg mb-1" />
              <Skeleton className="w-16 h-6 rounded-lg" />
            </div>
            <div>
              <Skeleton className="w-20 h-4 rounded-lg mb-1" />
              <Skeleton className="w-16 h-6 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="w-24 h-4 rounded-lg mb-1" />
              <Skeleton className="w-20 h-6 rounded-lg" />
            </div>
            <div>
              <Skeleton className="w-24 h-4 rounded-lg mb-1" />
              <Skeleton className="w-20 h-6 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-10 rounded-lg" />
            <Skeleton className="flex-1 h-10 rounded-lg" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function GameBoardSkeleton() {
  return (
    <div className="flex items-center justify-center rounded-lg">
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden p-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-200 rounded"
                style={{
                  animationDelay: `${i * 10}ms`,
                  opacity: 0.5 + Math.random() * 0.5,
                }}
              />
            ))}
          </div>
        </div>
        <p className="text-center text-gray-500 mt-4">Loading puzzle...</p>
      </div>
    </div>
  );
}
