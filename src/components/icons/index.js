import CalendarIcon from './CalendarIcon.svelte';
import TagIcon from './TagIcon.svelte';
import LocationIcon from './LocationIcon.svelte';
import GithubIcon from './GithubIcon.svelte';
import UpIcon from './UpIcon.svelte';
import PenIcon from './PenIcon.svelte';
import BookIcon from './BookIcon.svelte';
import RightIcon from './RightIcon.svelte';
import HeartIcon from './HeartIcon.svelte';
import MessageIcon from './MessageIcon.svelte';
import CodeIcon from './CodeIcon.svelte';
import SearchIcon from './SearchIcon.svelte';

const iconMapping = {
  calendar: CalendarIcon,
  tag: TagIcon,
  location: LocationIcon,
  github: GithubIcon,
  up: UpIcon,
  pen: PenIcon,
  book: BookIcon,
  right: RightIcon,
  heart: HeartIcon,
  message: MessageIcon,
  code: CodeIcon,
  search: SearchIcon
};

export function getIcon(type) {
  const icon = iconMapping[type];
  if (!icon) {
    throw new Error(`Unknown icon type: ${type}`);
  }
  return icon;
}
