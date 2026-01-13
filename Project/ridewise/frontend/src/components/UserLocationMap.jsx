export default function UserLocationMap({ location }) {
  if (!location) {
    return (
      <div className="h-[300px] flex items-center justify-center text-white/60">
        Loading map...
      </div>
    );
  }

  const mapSrc = `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=13&output=embed`;

  return (
    <iframe
      title="User Location Map"
      src={mapSrc}
      className="w-full h-[300px] rounded-xl border border-white/20"
      loading="lazy"
    />
  );
}
