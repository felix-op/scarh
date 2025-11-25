export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center 
        bg-[#0982C8] 
        text-[#E7F5FE]
        text-[18px] 
        rounded-[20px]
        px-[25px] 
        h-[48px]
        hover:bg-[#0A6CA3]
        transition
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
