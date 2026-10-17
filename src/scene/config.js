// Everything you are likely to tune lives here: colours, node positions,
// camera framing, the background video, and how long each hop takes.

export const COLORS = {
  bg: '#07060F',
  amber: '#F2B84B', // "execution" gold: wire, pulse, active node
  amberSoft: '#FFE2A3',
  node: '#1A1530', // tablet body (deep indigo)
  nodeEdge: '#6A5636', // dim bronze edge for nodes that are not active
  wire: '#4A3F5E',
  text: '#F6EEDC',
  muted: '#B9AFC4',
  gold: '#E3B35A',
  success: '#4ADE80',
}

// One entry per chapter. pos is the node's position in the world.
// side: 1 puts the node on the right of the screen (text on the left),
//       -1 puts the node on the left (text on the right).
// weight: how much scroll distance the chapter gets.
// offset: optional, overrides FLIGHT.offsetX for this chapter (the hero node sits further right).
// sanskrit / roman: the mythic name shown on the node and above the heading.
export const CHAPTERS = [
  { id: 'hero', kind: 'Trigger', title: 'Page opened', sanskrit: 'आरंभ', roman: 'Aarambh', pos: [0, 1.6, 0], side: 1, weight: 1.0, offset: 3.8 },
  { id: 'about', kind: 'Profile', title: 'About', sanskrit: 'परिचय', roman: 'Parichay', pos: [16, 3.2, -4], side: -1, weight: 1.1 },
  { id: 'skills', kind: 'Toolbox', title: 'Skills', sanskrit: 'कौशल', roman: 'Kaushal', pos: [32, 0.8, 1], side: 1, weight: 1.1 },
  { id: 'projects', kind: 'Workflows', title: 'Projects', sanskrit: 'कृति', roman: 'Kriti', pos: [48, 3.0, -3], side: -1, weight: 1.9 },
  { id: 'services', kind: 'Branch', title: 'Services', sanskrit: 'सेवा', roman: 'Seva', pos: [64, 1.0, 0], side: 1, weight: 1.2 },
  { id: 'contact', kind: 'Action', title: 'Say hello', sanskrit: 'संपर्क', roman: 'Sampark', pos: [80, 3.0, -4], side: -1, weight: 1.0 },
]

export const NODE = { w: 4.4, h: 2.2, depth: 0.26, radius: 0.28 }

export const FLIGHT = {
  fov: 48,
  dist: 10.5, // how far the camera sits in front of a node
  offsetX: 3.2, // sideways offset, pushes the node to one side of the screen
  height: 0.5,
  lookAhead: 0.5, // looks slightly toward the next node
  hop: 0.62, // share of each chapter's scroll spent travelling to the next node (was 0.28)
  hopLift: 1.2, // camera rises during a hop
  hopPull: 1.8, // camera pulls back during a hop
  hopRoll: 0.035, // slight tilt during a hop
  drift: 0.7, // gentle sway while resting on a node
  vhPerWeight: 130, // page height per unit of weight, in vh
}

// The background picture (a file in public/). To use a different picture, change
// `image`, and set `stars` to [] (or the positions of its stars).
export const BG = {
  image: 'backdrop.jpg',
  zoom: 1.06, // crop-in; a little room for the drift
  zoomGain: 0.02, // extra zoom by the end of the scroll
  edgeStart: 0.99, // right edge of the view at the top of the page (1 = picture's right edge)
  edgeEnd: 0.95, // right edge of the view at the end: the picture drifts slowly left, keeps the temple in
  anchor: 0.9, // 0 = keep the bottom of the picture in view, 1 = keep the top
  bright: 0.95, // brightness of the picture
  bottomShade: 0.6, // how much the lower part is darkened
  leftShade: 0.3, // darkening on the left, behind the text
  ripple: 0, // size of the ripple around the cursor (0 = off)
  // twinkling stars: [x, y] from 0 to 1, measured from the top-left. Up to 10.
  stars: [
    [0.321, 0.129], [0.633, 0.115], [0.778, 0.078], [0.565, 0.06],
    [0.595, 0.218], [0.723, 0.119], [0.726, 0.206], [0.161, 0.092],
  ],
}