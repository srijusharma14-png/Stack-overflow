
import Mainlayout from "@/layout/MainLayout";

export default function TagsPage() {
  const tags = [
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "mongodb",
    "express",
    "css",
    "html",
    "c++",
  ];

  return (
    <Mainlayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">
          Tags
        </h1>

        <p className="text-gray-600 mb-6">
          Explore topics and technologies discussed on CodeQuest.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <div
              key={tag}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                {tag}
              </span>

              <p className="text-sm text-gray-600 mt-3">
                Explore questions about {tag}.
              </p>
            </div>
          ))}
        </div>
      </div>
    </Mainlayout>
  );
}
