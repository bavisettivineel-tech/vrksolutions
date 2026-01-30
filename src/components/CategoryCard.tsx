import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}

const CategoryCard = ({
  title,
  subtitle,
  icon: Icon,
  onClick,
  disabled = false,
  badge,
}: CategoryCardProps) => {
  return (
    <Card
      className={`relative p-4 md:p-6 flex flex-col items-center text-center transition-all duration-300 cursor-pointer group border-vrk-100 hover:border-vrk-300 ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:shadow-elevated hover:-translate-y-1"
      }`}
      onClick={disabled ? undefined : onClick}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-vrk-500 text-primary-foreground animate-pulse-soft">
          {badge}
        </span>
      )}

      <div
        className={`p-3 md:p-4 rounded-2xl mb-3 transition-all duration-300 ${
          disabled
            ? "bg-muted"
            : "gradient-soft group-hover:shadow-card"
        }`}
      >
        <Icon
          className={`h-8 w-8 md:h-10 md:w-10 transition-colors duration-300 ${
            disabled ? "text-muted-foreground" : "text-primary group-hover:text-vrk-700"
          }`}
        />
      </div>

      <h3
        className={`font-display font-semibold text-sm md:text-base transition-colors ${
          disabled ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
        }`}
      >
        {title}
      </h3>

      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </Card>
  );
};

export default CategoryCard;
