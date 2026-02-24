export const metadata = {
  title: "Terms and Conditions| Canvas Vibe",
  description: "Understand the rules and guildlines of Canvas Vibe.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
        Terms and Conditions
      </h1>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        By using Canvas Vibe, you agree to follow all community guidelines and respect other users.
      </p>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Users are responsible for the content they post. Any misuse, harmful content, or abuse may result in account suspension.
      </p>

      <p className="text-gray-700 dark:text-gray-300">
        These terms may be updated as the platform evolves.
      </p>
    </div>
  );
}
