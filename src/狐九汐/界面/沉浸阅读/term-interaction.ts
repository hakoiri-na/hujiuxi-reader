export type TermTrigger = {
  term: string;
  note: string;
  anchor: HTMLElement;
  event: Event;
  source: 'hover' | 'keyboard' | 'touch';
};

// Capture-phase dismissal prevents a second tap on the same (or another) term
// from closing and immediately reopening the note during the same click.
export function createTermInteraction(onOpen: (value: TermTrigger) => void, onClose: () => void) {
  let current: TermTrigger | null = null;
  const dismissed = new WeakSet<Event>();
  function close() {
    current = null;
    onClose();
  }
  function open(value: TermTrigger) {
    if (dismissed.has(value.event)) return;
    current = value;
    onOpen(value);
  }
  function leave(anchor: HTMLElement) {
    if (current?.anchor === anchor && current.source !== 'touch') close();
  }
  function click(event: Event) {
    if (!current) return;
    if (current.source === 'touch') {
      dismissed.add(event);
      close();
      return;
    }
    if (!(event.target instanceof Element) || !current.anchor.contains(event.target)) close();
  }
  return { open, leave, click, close };
}
