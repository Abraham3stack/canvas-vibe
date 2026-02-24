export const metadata = {
  title: "About | Canvas Vibe",
  description: "Learn more about Canvas Vibe and the vision behind it.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
        About Canvas Vibe
      </h1>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Canvas Vibe is a modern social platform where users can share posts, connect with others and express creativity freely.
      </p>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Built with Next.js, Firebase and Tailwind CSS. This project focuses on Authentication, routing, performance, clean UI and real-time interactions.
      </p>

      <p className="text-gray-700 dark:text-gray-300">
        This platform was created as a full-stack learning project and demonstrates authentication, user profiles, social interactions,and responsive design.
      </p>
    </div>
  );
}
