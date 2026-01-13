export default function PredictionPanel({ result }) {
  return (
    <div className="flex-1 rounded-2xl border border-dashed border-white/20 flex items-center justify-center">
      {!result ? (
        <div className="text-center text-gray-400">
          📍 Ready to Predict  
          <p className="mt-2 text-sm">
            Adjust inputs and click "Predict Rentals"
          </p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-cyan-400">
            {result} Rentals
          </h2>
          <p className="text-gray-400 mt-2">Predicted Demand</p>
        </div>
      )}
    </div>
  );
}
