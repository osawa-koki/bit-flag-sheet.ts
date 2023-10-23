/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function removeChildren (parent: string | HTMLElement): void {
  if (typeof parent === 'string') {
    parent = document.getElementById(parent)!
  }
  while (parent.firstChild != null) {
    parent.removeChild(parent.firstChild)
  }
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
