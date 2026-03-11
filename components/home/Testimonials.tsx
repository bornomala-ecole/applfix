"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Star, Quote } from "lucide-react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

// Define the type for a testimonial
type Testimonial = {
  id: number;
  name: string;
  location: string;
  rating: number; // 1 to 5
  comment: string;
  avatar?: string; // Optional avatar image
};

// Sample testimonial data
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Jenkins",
    location: "New York, USA",
    rating: 5,
    comment:
      "Absolutely fantastic experience! My new iPhone arrived the next day, and the price was unbeatable. Customer service was incredibly helpful with my questions. Highly recommend!",
  },
  {
    id: 2,
    name: "David Chen",
    location: "San Francisco, USA",
    rating: 5,
    comment:
      "I was hesitant about buying a phone online, but this store made it so easy and secure. The product is 100% genuine and came with a full warranty. I'm a very happy customer.",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    location: "London, UK",
    rating: 4,
    comment:
      "Great selection of phones and competitive pricing. The delivery was a bit slower than expected, but the support team kept me updated every step of the way. Will shop again.",
  },
  {
    id: 4,
    name: "Michael Brown",
    location: "Toronto, Canada",
    rating: 5,
    comment:
      "Best place to buy a new phone! The 'Featured Products' section helped me find exactly what I was looking for. The checkout process was smooth and secure. 10/10!",
  },
];

// Helper component to render star rating
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={18}
          className={`${
            index < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
};

export default function Testimonials() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold">What Our Customers Say</h2>
          <p className="mt-2 text-gray-600">
            Don't just take our word for it. Hear from our happy customers.
          </p>
        </div>

        {/* Testimonials Slider */}
        {/* FIX IS HERE: Added 'relative' class to the container div */}
        <div className="relative mt-8 md:mt-12">
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={1}
            spaceBetween={20}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            navigation={{
              prevEl: ".testimonial-prev",
              nextEl: ".testimonial-next",
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="testimonials-swiper"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="flex h-full flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                  {/* Quote Icon */}
                  <Quote
                    className="mb-4 text-primaryRed/20"
                    size={40}
                  />

                  {/* Star Rating */}
                  <div className="mb-4">
                    <StarRating rating={testimonial.rating} />
                  </div>

                  {/* Comment */}
                  <p className="mb-6 flex-grow text-gray-700">
                    "{testimonial.comment}"
                  </p>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold uppercase text-gray-600">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows */}
          <button className="testimonial-prev absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-all hover:scale-110 md:-left-4 md:flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button className="testimonial-next absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-all hover:scale-110 md:-right-4 md:flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}