export function FooterInfo() {
    return (
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">About Our Campaigns</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Our campaigns are designed to create meaningful impact in our community.</p>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">How It Works</h3>
                    <ol className="text-gray-700 dark:text-gray-300 text-sm space-y-2">
                        <li>1. Choose a campaign</li>
                        <li>2. Fill out the form</li>
                        <li>3. Receive confirmation</li>
                        <li>4. See the impact</li>
                    </ol>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Questions?</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Contact our team at <span className="text-purple-700 dark:text-purple-400">support@example.org</span>.</p>
                </div>
            </div>
        </div>
    );
}