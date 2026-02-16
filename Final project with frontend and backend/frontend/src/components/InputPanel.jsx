import { useState } from "react";

export default function InputPanel({ onPredict, mode }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    season: "Summer",
    weather: "Clear",
    temp: 20,
    humidity: 60,
    wind: 10,
    weekend: false
  });

  // 🔥 CALL BACKEND HERE
    const handlePredict = async () => {
      setLoading(true);
      const payload = {
        season: data.season === "Summer" ? 1 :
                data.season === "Winter" ? 4 :
                data.season === "Spring" ? 2 : 3,

        weather: data.weather === "Clear" ? 0 :
                data.weather === "Cloudy" ? 1 : 2,

        temp: Number(data.temp),
        atemp: Number(data.temp) + 2,
        humidity: Number(data.humidity),
        windspeed: Number(data.wind),
        weekend: data.weekend ? 1 : 0,

        holiday: 0,
        workingday: data.weekend ? 0 : 1,

        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        dayofweek: new Date().getDay(),
        is_peak_hour: 0
      };

      try {
        const res = await fetch("http://localhost:5000/api/predict/day", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        onPredict(result);
      }
      catch(err){
        console.error("Prediction failed:", err);
      }
      finally{
        setLoading(false);
      }
    };

  return (
    <div className="w-[360px] p-6 rounded-2xl bg-black/30 border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4">Input Features</h2>

      <Label text="Season" />
      <Select
        value={data.season}
        onChange={(e) => setData({ ...data, season: e.target.value })}
        options={["Summer", "Winter", "Spring", "Fall"]}
      />

      <Label text="Weather Condition" />
      <Select
        value={data.weather}
        onChange={(e) => setData({ ...data, weather: e.target.value })}
        options={["Clear", "Cloudy", "Rainy"]}
      />

      <Slider label={`Temperature: ${data.temp}°C`} value={data.temp} min={0} max={40}
        onChange={(e) => setData({ ...data, temp: +e.target.value })} />

      <Slider label={`Humidity: ${data.humidity}%`} value={data.humidity} min={0} max={100}
        onChange={(e) => setData({ ...data, humidity: +e.target.value })} />

      <Slider label={`Wind Speed: ${data.wind} km/h`} value={data.wind} min={0} max={40}
        onChange={(e) => setData({ ...data, wind: +e.target.value })} />

      <div className="flex items-center gap-3 mt-4">
        <input
          type="checkbox"
          checked={data.weekend}
          onChange={() => setData({ ...data, weekend: !data.weekend })}
        />
        <span className="text-gray-300">Weekend</span>
      </div>

      <button disabled={loading}
        onClick={handlePredict}
        className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-semibold"
      >
        {loading ? "Predicting ... " : "Predict Rentals "} 
      </button>
    </div>
  );
}

const Label = ({ text }) => <p className="text-gray-400 mt-3 mb-1">{text}</p>;

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
  >
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

const Slider = ({ label, value, min, max, onChange }) => (
  <>
    <p className="text-gray-400 mt-3">{label}</p>
    <input type="range" value={value} min={min} max={max} onChange={onChange}
      className="w-full accent-cyan-400" />
  </>
);
