import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Visitor Counter" },
    { name: "description", content: "Simple visitor counter service" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  return {
    message: 'Server is running, https://github.com/vuthanhtrung2010/visitor-counter/',
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Visitor Counter</h1>
        <p className="text-gray-700 mb-4">
          {loaderData.message}
        </p>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Usage:</h2>
          <p className="text-sm text-gray-600">
            <code className="bg-gray-200 px-2 py-1 rounded">
              /:username/:platform/count.svg
            </code>
          </p>
          <p className="text-xs text-gray-500">
            Replace <code>:username</code> and <code>:platform</code> with your values to get a visitor counter badge.
          </p>
        </div>
      </div>
    </div>
  );
}
