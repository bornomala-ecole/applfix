"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically integrate with an email service provider
    // like Mailchimp, Klaviyo, or ConvertKit.
    console.log("Subscribed with email:", email);
    alert(`Thank you for subscribing with ${email}!`);
    setEmail(""); // Clear the input after submission
  };

  return (
    <section className="bg-primaryRed py-12 lg:py-16">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center text-white">
          {/* Icon */}
          <Mail className="mx-auto mb-4" size={48} />

          {/* Section Header */}
          <h2 className="text-3xl font-bold">Stay in the Loop</h2>
          <p className="mt-2 text-lg text-red-100">
            Subscribe to our newsletter for exclusive deals, new arrivals, and
            a 10% welcome discount on your first order!
          </p>

          {/* Subscription Form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row">
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              className="w-full flex-1 rounded-lg px-5 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primaryRed transition-all hover:bg-gray-100 hover:shadow-lg"
            >
              <span>Subscribe</span>
              <Send size={18} />
            </button>
          </form>

          {/* Privacy Note */}
          <p className="mt-4 text-xs text-red-200">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}