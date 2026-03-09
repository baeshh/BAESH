import logoSrc from "../assets/BAESH logo.png";

export default function Brand() {
  return (
    <img
      src={logoSrc}
      alt="BAESH 로고"
      style={{ height: 32, display: "block" }}
    />
  );
}
