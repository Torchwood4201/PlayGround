/**
 * Command builders for Minecraft Java 1.21.9+ sprite (`object`/`atlas`)
 * text components, plus the MiniMessage equivalent (adventure >= 4.25).
 */

export function atlasShort(atlas) {
  // 'minecraft:items' -> 'items' (bare); other namespaces stay quoted.
  if (atlas.startsWith('minecraft:')) {
    const short = atlas.slice('minecraft:'.length);
    return /^[A-Za-z0-9_.-]+$/.test(short) ? short : `"${atlas}"`;
  }
  return `"${atlas}"`;
}

export function jsonComponent(sprite) {
  return JSON.stringify({
    type: 'object',
    object: 'atlas',
    atlas: sprite.atlas,
    sprite: sprite.sprite,
  });
}

export function minimessage(sprite) {
  return `<sprite:${atlasShort(sprite.atlas)}:${sprite.sprite}>`;
}

export function tellraw(sprite, selector = '@s') {
  return `/tellraw ${selector} ${jsonComponent(sprite)}`;
}

export function titleCommand(sprite, kind, selector = '@s') {
  if (!['actionbar', 'title', 'subtitle'].includes(kind)) {
    throw new Error(`unknown title kind: ${kind}`);
  }
  return `/title ${selector} ${kind} ${jsonComponent(sprite)}`;
}

export const FORMATS = [
  { key: 'minimessage', label: 'MiniMessage', build: (s) => minimessage(s) },
  { key: 'json', label: 'JSON text component', build: (s) => jsonComponent(s) },
  { key: 'tellraw', label: '/tellraw', build: (s) => tellraw(s) },
  { key: 'actionbar', label: '/title actionbar', build: (s) => titleCommand(s, 'actionbar') },
  { key: 'title', label: '/title title', build: (s) => titleCommand(s, 'title') },
  { key: 'subtitle', label: '/title subtitle', build: (s) => titleCommand(s, 'subtitle') },
];
