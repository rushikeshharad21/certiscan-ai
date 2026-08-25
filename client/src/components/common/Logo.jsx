function Logo({ size = 44 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200"
    >
      <span className="text-white font-semibold" style={{ fontSize: size * 0.4 }}>
        CS
      </span>
    </div>
  )
}

export default Logo