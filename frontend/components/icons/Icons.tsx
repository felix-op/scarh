// Tipo común para todos los iconos
type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

/* ───── Edit ───── */

export function Edit({
  size = 32,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill={color}
      className={className}
    >
      <path d="M27.87 7.863L23.024 4.82l-7.89 12.566l4.843 3.04zM14.395 21.25l-.107 2.855l2.527-1.337l2.35-1.24l-4.673-2.936zM29.163 3.24L26.63 1.647a1.364 1.364 0 0 0-1.88.43l-1 1.588l4.843 3.042l1-1.586c.4-.64.21-1.483-.43-1.883zm-3.965 23.82c0 .275-.225.5-.5.5h-19a.5.5 0 0 1-.5-.5v-19a.5.5 0 0 1 .5-.5h13.244l1.884-3H5.698c-1.93 0-3.5 1.57-3.5 3.5v19c0 1.93 1.57 3.5 3.5 3.5h19c1.93 0 3.5-1.57 3.5-3.5V11.097l-3 4.776v11.19z" />
    </svg>
  );
}

/* ───── Save ───── */

export function Save({
  size = 32,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <g
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      >
        <path d="M7 3v5h8" />
        <path d="M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="M17 21v-8H7v8" />
      </g>
    </svg>
  );
}

/* ───── User ───── */

export function User({
  size = 32,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
    >
      <path d="M11 7c0 1.66-1.34 3-3 3S5 8.66 5 7s1.34-3 3-3s3 1.34 3 3" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 8c0 4.42-3.58 8-8 8s-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8M4 13.75C4.16 13.484 5.71 11 7.99 11c2.27 0 3.83 2.49 3.99 2.75A6.98 6.98 0 0 0 14.99 8c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 2.38 1.19 4.49 3.01 5.75"
      />
    </svg>
  );
}

/* ───── Documet ───── */

export function Documet({
    size = 32,
    color = "currentColor",
    className = "",
}: IconProps) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={className}>
            <path 
                fill= {color} 
                d="M15.75 13a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75m0 4a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75"/>
            <path 
                fill= {color} 
                fill-rule="evenodd" 
                d="M7 2.25A2.75 2.75 0 0 0 4.25 5v14A2.75 2.75 0 0 0 7 21.75h10A2.75 2.75 0 0 0 19.75 19V7.968c0-.381-.124-.751-.354-1.055l-2.998-3.968a1.75 1.75 0 0 0-1.396-.695zM5.75 5c0-.69.56-1.25 1.25-1.25h7.25v4.397c0 .414.336.75.75.75h3.25V19c0 .69-.56 1.25-1.25 1.25H7c-.69 0-1.25-.56-1.25-1.25z" 
                clip-rule="evenodd"/>
        </svg>
    )
}

/* ───── Delete ───── */

export function Delete({
    size = 32,
    color = "currentColor",
    className = "",
}: IconProps) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={className}>
            <path 
            fill={color}
            d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/>
        </svg>
    )
}

/* ───── Chip ───── */

export function Chip ({
    size = 32,
    color = "currentColor",
    className = "",
}: IconProps) {
    return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24"
        className={className}>
        <path 
        fill={color} 
        d="M6 4h12v1h3v2h-3v2h3v2h-3v2h3v2h-3v2h3v2h-3v1H6v-1H3v-2h3v-2H3v-2h3v-2H3V9h3V7H3V5h3zm5 11v3h1v-3zm2 0v3h1v-3zm2 0v3h1v-3z"/>
    </svg>
    )
}

/* ───── Map ───── */

export function Map ({
    size = 32,
    color = "currentColor",
    className = "",
}: IconProps) {
    return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 32 32"
        className={className}>
        <path 
        fill={color}
        d="m16 24l-6.09-8.6A8.14 8.14 0 0 1 16 2a8.08 8.08 0 0 1 8 8.13a8.2 8.2 0 0 1-1.8 5.13Zm0-20a6.07 6.07 0 0 0-6 6.13a6.2 6.2 0 0 0 1.49 4L16 20.52L20.63 14A6.24 6.24 0 0 0 22 10.13A6.07 6.07 0 0 0 16 4"/>
        <circle 
        cx="16" 
        cy="9" 
        r="2" 
        fill={color}/>
        <path 
        fill={color}
        d="M28 12h-2v2h2v14H4V14h2v-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V14a2 2 0 0 0-2-2"/>
    </svg>
    )
}

/* ───── Ruler ───── */

export function Ruler ({
    size = 32,
    color = "currentColor",
    className = "",
}: IconProps) {
    return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 32 32"
        className={className}>
        <path fill={color}
        d="m6.63 21.796l-5.122 5.12H27.25V1.177zM18.702 10.48a.47.47 0 0 1 .664 0l1.16 1.16a.466.466 0 1 1-.66.661l-1.164-1.16a.47.47 0 0 1 0-.662zm-1.6 1.604a.465.465 0 0 1 .66 0l2.157 2.154a.465.465 0 0 1 0 .66a.463.463 0 0 1-.663.003L17.1 12.748a.47.47 0 0 1 0-.663zm-1.605 1.6a.47.47 0 0 1 .664 0l1.16 1.162a.467.467 0 0 1-.33.8a.47.47 0 0 1-.333-.138l-1.16-1.16a.47.47 0 0 1 0-.665zm-1.6 1.604a.47.47 0 0 1 .663.002l1.158 1.16a.468.468 0 1 1-.664.662l-1.158-1.16a.47.47 0 0 1 0-.664zm-1.604 1.604a.467.467 0 0 1 .663 0l2.154 2.153a.47.47 0 1 1-.664.665l-2.153-2.155a.47.47 0 0 1 0-.663m-1.99 7.623a.47.47 0 0 1-.663.002l-2.154-2.153a.468.468 0 1 1 .662-.663l2.154 2.154a.465.465 0 0 1 0 .66zm.61-2.597a.48.48 0 0 1-.334.14a.46.46 0 0 1-.33-.138l-1.163-1.16a.464.464 0 0 1 0-.66a.467.467 0 0 1 .664-.004l1.162 1.162a.465.465 0 0 1 0 .66zm1.6-1.602a.465.465 0 0 1-.662 0l-1.16-1.16a.468.468 0 1 1 .664-.662l1.16 1.16a.47.47 0 0 1 0 .662zm9.737 1.6h-8.67l8.67-8.67zM22.13 10.7a.46.46 0 0 1-.33.138a.47.47 0 0 1-.334-.138l-1.16-1.16a.468.468 0 1 1 .662-.662l1.16 1.16c.184.183.185.48.002.662m2.596-.608a.47.47 0 0 1-.662-.001L21.91 7.938a.468.468 0 1 1 .664-.662l2.154 2.154c.183.183.18.48-.002.662"/>
    </svg>
    )
}

/* ───── Funcion ───── */

export function Funcion ({
    size = 32,
    color = "currentColor",
    className = "",
}: IconProps) {
    return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size}
        viewBox="0 0 24 24"
        className={className}>
            <g 
            fill="none" 
            stroke={color} 
            stroke-width="1.5">
                <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M8.5 15.5c.132.478.398 1 1.094 1c1.203 0 1.504-1 2.406-4.5s1.203-4.5 2.406-4.5c.696 0 .962.522 1.094 1m-4.958 2.25h3.864"/>
                <circle 
                cx="12" 
                cy="12" 
                r="10"/>
            </g>
    </svg>
    )
}

/* ───── HistoryIcon ───── */

export function HistoryIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill={color}
        d="M12 21q-3.45 0-6.012-2.287T3.05 13H5.1q.35 2.6 2.313 4.3T12 19q2.925 0 4.963-2.037T19 12t-2.037-4.962T12 5q-1.725 0-3.225.8T6.25 8H9v2H3V4h2v2.35q1.275-1.6 3.113-2.475T12 3q1.875 0 3.513.713t2.85 1.924t1.925 2.85T21 12t-.712 3.513t-1.925 2.85t-2.85 1.925T12 21m2.8-4.8L11 12.4V7h2v4.6l3.2 3.2z"
      />
    </svg>
  );
}

/* ───── MenuBurgerHorizontalIcon ───── */

export function MenuBurgerHorizontalIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 6h18M3 12h18M3 18h18"
      />
    </svg>
  );
}

/* ───── BurgerArrowLeftIcon ───── */

export function BurgerArrowLeftIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill={color}
        d="M7 6a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1m-1.97 7.97L3.86 12.8H19a.8.8 0 0 0 0-1.6H3.86l1.17-1.17a.75.75 0 1 0-1.06-1.06l-2.5 2.5a.75.75 0 0 0 0 1.06l2.5 2.5a.75.75 0 0 0 1.06-1.06M8 17a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2z"
      />
    </svg>
  );
}

/* ───── BurgerArrowRightIcon ───── */

export function BurgerArrowRightIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill={color}
        d="M3 6a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1m1.25 6a.75.75 0 0 1 .75-.75h15.19l-1.22-1.22a.75.75 0 1 1 1.06-1.06l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06l1.22-1.22H5a.75.75 0 0 1-.75-.75M4 17a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2z"
      />
    </svg>
  );
}

/* ───── CopySolidIcon ───── */

export function CopySolidIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <g fill={color} fillRule="evenodd" clipRule="evenodd">
        <path d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a2 2 0 0 0-1 .267V5a2 2 0 0 1 2-2z" />
        <path d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054M10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      </g>
    </svg>
  );
}

/* ───── NotificationFillIcon ───── */

export function NotificationFillIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill={color}
        d="M8.645 20.5a3.502 3.502 0 0 0 6.71 0zM3 19.5h18v-3l-2-3v-5a7 7 0 1 0-14 0v5l-2 3z"
      />
    </svg>
  );
}

/* ───── NotificationNewdotFillIcon ───── */

export function NotificationNewdotFillIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <g fill="none">
        <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
        <path
          fill={color}
          d="M12 2a7 7 0 0 1 2.263.374a4.5 4.5 0 0 0 4.5 7.447L19 9.743v2.784a1 1 0 0 0 .06.34l.046.107l1.716 3.433a1.1 1.1 0 0 1-.869 1.586l-.115.006H4.162a1.1 1.1 0 0 1-1.03-1.487l.046-.105l1.717-3.433a1 1 0 0 0 .098-.331L5 12.528V9a7 7 0 0 1 7-7m5.5 1a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5M12 21a3 3 0 0 1-2.83-2h5.66A3 3 0 0 1 12 21"
        />
      </g>
    </svg>
  );
}

/* ───── ArrowDownIcon ───── */

export function ArrowDownIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m7 10l5 5m0 0l5-5"
      />
    </svg>
  );
}

/* ───── ChevronRightIcon ───── */

export function ChevronRightIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="m9 6 6 6l-6 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ───── SettingsIcon ───── */

export function SettingsIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
    >
      <g
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      >
        <path d="M 48.000002,16 H 208 c 17.728,0 32,14.272 32,32 v 160 c 0,17.728 -14.272,32 -32,32 H 48.000002 c -17.728,0 -32,-14.272 -32,-32 V 48 c 0,-17.728 14.272,-32 32,-32 z" />
        <path d="M 64.000006,64.000001 H 79.999993" />
        <path
          d="m 79.999996,-96.000015 a 16,16 0 0 1 -16,16 16,16 0 0 1 -16,-16
          16,16 0 0 1 16,-16.000005 16,16 0 0 1 16,16.000005 z"
          transform="rotate(90)"
        />
        <path d="m 112.00001,64.000353 79.99997,-3.52e-4" />
        <path d="M 191.99998,128 H 176" />
        <path
          d="m 144,159.99997 a 16,16 0 0 1 -16,16 16,16 0 0 1 -16,-16
           16,16 0 0 1 16,-16 16,16 0 0 1 16,16 z"
          transform="matrix(0 1 1 0 0 0)"
        />
        <path d="M 143.99998,128.00035 64.000006,128" />
        <path d="M 64.000006,192.00001 H 79.999993" />
        <path
          d="m 208,-96.000015 a 16,16 0 0 1 -16,16 16,16 0 0 1 -16,-16
          16,16 0 0 1 16,-16.000005 16,16 0 0 1 16,16.000005 z"
          transform="rotate(90)"
        />
        <path d="m 112.00001,192.00036 79.99997,-3.5e-4" />
      </g>
    </svg>
  );
}

/* ───── AddIcon ───── */

export function AddIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <g fill="none">
        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
        <path
          fill={color}
          d="M10.5 20a1.5 1.5 0 0 0 3 0v-6.5H20a1.5 1.5 0 0 0 0-3h-6.5V4a1.5 1.5 0 0 0-3 0v6.5H4a1.5 1.5 0 0 0 0 3h6.5z"
        />
      </g>
    </svg>
  );
}

/* ───── LessIcon ───── */

export function LessIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
    >
      <path fill={color} d="M1 229.3h512v85.3H1z" />
    </svg>
  );
}

/* ───── Circulo ───── */

export function circle({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
<svg xmlns="http://www.w3.org/2000/svg" 
width={size} 
height={size}  
viewBox="0 0 24 24"
className={className}>
  <circle 
  cx="12" 
  cy="12" 
  r="8" 
  fill={color} 
  opacity="0.3"/>
  <path
  fill="currentColor"
  d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8"/>
  </svg>
  )
}

/* ───── Walter ───── */

export function water({
  size = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
  <svg 
  xmlns="http://www.w3.org/2000/svg" 
  width={size} 
  height={size} 
  viewBox="0 0 24 24">
    <path 
    fill={color} 
    d="M21.98 14H22zM5.35 13c1.19 0 1.42 1 3.33 1c1.95 0 2.09-1 3.33-1c1.19 0 1.42 1 3.33 1c1.95 0 2.09-1 3.33-1c1.19 0 1.4.98 3.31 1v-2c-1.19 0-1.42-1-3.33-1c-1.95 0-2.09 1-3.33 1c-1.19 0-1.42-1-3.33-1c-1.95 0-2.09 1-3.33 1c-1.19 0-1.42-1-3.33-1c-1.95 0-2.09 1-3.33 1v2c1.9 0 2.17-1 3.35-1m13.32 2c-1.95 0-2.09 1-3.33 1c-1.19 0-1.42-1-3.33-1c-1.95 0-2.1 1-3.34 1s-1.38-1-3.33-1s-2.1 1-3.34 1v2c1.95 0 2.11-1 3.34-1c1.24 0 1.38 1 3.33 1s2.1-1 3.34-1c1.19 0 1.42 1 3.33 1c1.94 0 2.09-1 3.33-1c1.19 0 1.42 1 3.33 1v-2c-1.24 0-1.38-1-3.33-1M5.35 9c1.19 0 1.42 1 3.33 1c1.95 0 2.09-1 3.33-1c1.19 0 1.42 1 3.33 1c1.95 0 2.09-1 3.33-1c1.19 0 1.4.98 3.31 1V8c-1.19 0-1.42-1-3.33-1c-1.95 0-2.09 1-3.33 1c-1.19 0-1.42-1-3.33-1c-1.95 0-2.09 1-3.33 1c-1.19 0-1.42-1-3.33-1C3.38 7 3.24 8 2 8v2c1.9 0 2.17-1 3.35-1"/>
    </svg>
    )
}
