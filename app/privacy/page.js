export const metadata = {
  title: "Privacy Policy | Canvas Vibe",
  description: "Read how Canvas Vibe handles your data and privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
        Privacy Policy
      </h1>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        We respect your privacy. Canvas Vibe only stores the information necessary to operate the platform, including account details, posts, and interactions.
      </p>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
         We do not sell your data or share personal information with third parties.
      </p>

      <p className="text-gray-700 dark:text-gray-300">
        By using this platform, you agree to the collection and use of information as described in this policy.
      </p>
    </div>
  );
}
