import React, { useState, useEffect } from 'react';
import { useStats } from './StatsContext'; // Import the context
const PackageVersions = () => {
    const { stats, setStats, name } = useStats(); // Use the context
    const defaultPackage = name;
    const [packageData, setPackageData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchPackageData = async () => {
        setLoading(true);
        setError('');
        setPackageData(null);
        try {
            const response = await fetch(`https://registry.npmjs.org/${defaultPackage}`);
            if (!response.ok) {
                throw new Error('Package not found');
            }
            const data = await response.json();
            setPackageData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackageData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-800 text-white p-6">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">ALL Versions for {defaultPackage}</h1>

                {/* SVG Spinner */}
                {loading && (
                    <div className="flex justify-center items-center my-4">
                        <img
                            src="/tube-spinner.svg"
                            alt="Loading..."
                            className="w-20 h-20"
                        />
                    </div>
                )}

                {error && <p className="text-red-500">{error}</p>}

                {/* Overall dist-tags */}
                {packageData && packageData['dist-tags'] && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-2">Dist Tags</h2>
                        <ul className="flex flex-wrap gap-2">
                            {Object.entries(packageData['dist-tags']).map(([tag, version]) => (
                                <li
                                    key={tag}
                                    className="bg-green-700 text-green-200 px-3 py-1 rounded max-w-xs overflow-hidden whitespace-nowrap text-ellipsis"
                                    title={`${tag}: ${version}`}
                                >
                                    {tag}: {version}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {packageData && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(packageData.versions).map(([versionKey, versionData]) => (
                            <div key={versionKey} className="bg-gray-700 shadow rounded p-4">
                                <h2 className="text-xl font-semibold mb-2">Version: {versionKey}</h2>
                                {packageData.time && packageData.time[versionKey] && (
                                    <p className="text-sm text-gray-300 mb-2">
                                        Published: {new Date(packageData.time[versionKey]).toLocaleDateString()}
                                    </p>
                                )}
                                {versionData.description && (
                                    <p className="mb-2">
                                        <span className="font-medium">Description:</span> {versionData.description}
                                    </p>
                                )}
                                {versionData.license && (
                                    <p className="mb-2">
                                        <span className="font-medium">License:</span> {versionData.license}
                                    </p>
                                )}
                                {versionData.author && versionData.author.name && (
                                    <p className="mb-2">
                                        <span className="font-medium">Author:</span> {versionData.author.name}
                                    </p>
                                )}
                                {/* Contributors */}
                                {versionData.contributors && (
                                    <div className="mb-2">
                                        <span className="font-medium">Contributors:</span>
                                        <ul className="list-disc list-inside text-sm mt-1">
                                            {Array.isArray(versionData.contributors)
                                                ? versionData.contributors.map((contrib, index) => (
                                                    <li key={index}>
                                                        {typeof contrib === 'object' ? contrib.name : contrib}
                                                    </li>
                                                ))
                                                : (
                                                    <li>
                                                        {typeof versionData.contributors === 'object'
                                                            ? versionData.contributors.name
                                                            : versionData.contributors}
                                                    </li>
                                                )}
                                        </ul>
                                    </div>
                                )}
                                {/* Bugs */}
                                {versionData.bugs && (
                                    <div className="mb-2">
                                        <span className="font-medium">Bugs:</span>{' '}
                                        {versionData.bugs.url ? (
                                            <a
                                                href={versionData.bugs.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:underline"
                                            >
                                                {versionData.bugs.url}
                                            </a>
                                        ) : (
                                            'No bug URL provided'
                                        )}
                                    </div>
                                )}
                                {/* Distribution Information */}
                                {versionData.dist && (
                                    <div className="mb-2">
                                        <span className="font-medium">Distribution:</span>
                                        <p className="text-sm">
                                            Tarball:{' '}
                                            {versionData.dist.tarball ? (
                                                <a
                                                    href={versionData.dist.tarball}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    {versionData.dist.tarball}
                                                </a>
                                            ) : (
                                                'N/A'
                                            )}
                                        </p>
                                        {versionData.dist.shasum && (
                                            <p className="text-sm">Shasum: {versionData.dist.shasum}</p>
                                        )}
                                    </div>
                                )}
                                {/* Dependencies */}
                                {versionData.dependencies && (
                                    <div className="mb-2">
                                        <span className="font-medium">Dependencies:</span>
                                        <ul className="list-disc list-inside text-sm mt-1">
                                            {Object.entries(versionData.dependencies).map(([dep, depVersion]) => (
                                                <li key={dep}>
                                                    {dep}: {depVersion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageVersions;
