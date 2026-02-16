import { MapPin } from "lucide-react";

export default function ReadyToPredict() {
  return (
    <div className="flex-1 border border-dashed border-white/20 rounded-2xl
      flex flex-col items-center justify-center text-gray-400">
      <MapPin size={40} />
      <h3 className="mt-4 text-lg">Ready to Predict</h3>
      <p className="text-sm mt-1">
        Adjust the input features and click "Predict Rentals"
      </p>
    </div>
  );
}
