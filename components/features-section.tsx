import { Heart, Users, Zap, Globe } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Globe,
      title: "Find Local Activities",
      description: "Discover volunteer opportunities right in your community",
    },
    {
      icon: Users,
      title: "Join a Community",
      description: "Meet like-minded people and build meaningful connections",
    },
    {
      icon: Heart,
      title: "Make an Impact",
      description:
        "Help organizations and make a real difference in people's lives",
    },
    {
      icon: Zap,
      title: "Simple & Intuitive",
      description: "Easy-to-use platform designed for everyone",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12 text-balance">
          Why Choose VolunMe?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg border border-border bg-card"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
