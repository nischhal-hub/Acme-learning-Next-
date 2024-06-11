export default function Loading() {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex items-center space-x-6 animate-pulse">
                <div className="w-14 h-14 bg-gray-300 rounded-md" />
                <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-300 rounded" />
                    <div className="space-y-1">
                        <div className="w-24 h-4 bg-gray-300 rounded" />
                        <div className="w-16 h-4 bg-gray-300 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}


