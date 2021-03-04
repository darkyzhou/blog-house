import CalendarIcon from './CalendarIcon.svelte';
import TagIcon from './TagIcon.svelte';
import LocationIcon from './LocationIcon.svelte';
import GithubIcon from './GithubIcon.svelte';
import UpIcon from './UpIcon.svelte';

const iconMapping = {
  calendar: CalendarIcon,
  tag: TagIcon,
  location: LocationIcon,
  github: GithubIcon,
  up: UpIcon
};

export function getIcon(type) {
  const icon = iconMapping[type];
  if (!icon) {
    throw new Error(`Unknown icon type: ${type}`);
  }
  return icon;
}
