
export function removeChildren(parent: string | HTMLElement) {
  if (typeof parent === 'string') {
    parent = document.getElementById(parent)!
  }
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}
