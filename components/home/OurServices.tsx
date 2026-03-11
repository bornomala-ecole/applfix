import { Truck, Shield, Headphones, Award } from "lucide-react";

// Define the type for a service item
type Service = {
  id: number;
  icon: React.ComponentType<{ className?: string; size?: number }>; // Lucide React icon type
  title: string;
  description: string;
};

// An array of your key services
const services: Service[] = [
  {
    id: 1,
    icon: Truck,
    title: "Free & Fast Delivery",
    description: "Free delivery on all orders over $50. Get your new phone in no time.",
  },
  {
    id: 2,
    icon: Shield,
    title: "Secure Payment",
    description: "Your payment information is safe and encrypted with industry-standard security.",
  },
  {
    id: 3,
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated customer support team is here to help you anytime, day or night.",
  },
  {
    id: 4,
    icon: Award,
    title: "Official Warranty",
    description: "All our products come with a manufacturer's warranty for complete peace of mind.",
  },
];

export default function OurServices() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Why Shop With Us?</h2>
          <p className="mt-2 text-gray-600">
            We provide the best buying experience for your next phone.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            // Destructure the icon component from the service object
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="flex flex-col items-center rounded-lg bg-white p-6 text-center transition-shadow duration-300 hover:shadow-md"
              >
                {/* Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primaryRed/10">
                  <IconComponent
                    className="text-primaryRed"
                    size={32}
                  />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}