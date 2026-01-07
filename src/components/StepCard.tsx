interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

export const StepCard = ({ number, title, description }: StepCardProps) => {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground mb-4 shadow-glow">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
