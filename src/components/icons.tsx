import {
  BarChart01,
  Clock,
  Colors,
  ClockRewind,
  Command,
  HelpCircle,
  Home01,
  InfoCircle,
  Keyboard01,
  Microphone01,
  Minimize01,
  Phone01,
  Recording01,
  Settings01,
  Sliders02,
} from "@untitledui/icons";

type IconProps = { size?: number; className?: string };

const wrap = (Icon: typeof Home01, { size = 16, className }: IconProps = {}) => (
  <Icon size={size} className={className} aria-hidden focusable={false} />
);

export const IconHome = (p: IconProps) => wrap(Home01, p);
export const IconSettings = (p: IconProps) => wrap(Settings01, p);
export const IconPhone = (p: IconProps) => wrap(Phone01, p);
export const IconMic = (p: IconProps) => wrap(Microphone01, p);
export const IconKeyboard = (p: IconProps) => wrap(Keyboard01, p);
export const IconAppearance = (p: IconProps) => wrap(Colors, p);
export const IconSliders = (p: IconProps) => wrap(Sliders02, p);
export const IconHelp = (p: IconProps) => wrap(HelpCircle, p);
export const IconHistory = (p: IconProps) => wrap(ClockRewind, p);
export const IconInfo = (p: IconProps) => wrap(InfoCircle, p);
export const IconMinimize = (p: IconProps) => wrap(Minimize01, p);
export const IconCommand = (p: IconProps) => wrap(Command, p);
export const IconChart = (p: IconProps) => wrap(BarChart01, p);
export const IconClock = (p: IconProps) => wrap(Clock, p);
export const IconRecording = (p: IconProps) => wrap(Recording01, p);
